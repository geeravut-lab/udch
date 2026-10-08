-- =============================================================================
-- UDCH Digital Cancer Care Platform
-- Phase 0–1 Foundation Schema
-- PostgreSQL / Supabase
-- =============================================================================
-- หมายเหตุ:
-- - ใช้ auth.users ของ Supabase เป็นตัวตนหลัก
-- - profiles ผูก 1:1 กับ auth.users
-- - RLS เปิดทุกตารางที่มีข้อมูลผู้ป่วย
-- - Phase 1 ยังไม่เชื่อม HIS จริง — รองรับ mock / seed / manual entry
-- =============================================================================

-- Extensions
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
do $$ begin
  create type public.user_role as enum (
    'patient', 'caregiver', 'nurse', 'doctor', 'admin'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.appointment_status as enum (
    'scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.queue_status as enum (
    'waiting', 'called', 'serving', 'done', 'skipped'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.result_type as enum (
    'lab', 'imaging', 'pathology', 'other'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.message_channel as enum (
    'in_app', 'line', 'sms', 'email'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.notification_status as enum (
    'queued', 'sent', 'failed', 'read'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.journey_step_status as enum (
    'done', 'active', 'todo'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.caregiver_permission as enum (
    'appointments_only', 'appointments_and_results', 'full'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_status as enum (
    'pending', 'awaiting_review', 'paid', 'rejected', 'cancelled'
  );
exception when duplicate_object then null;
end $$;

-- -----------------------------------------------------------------------------
-- profiles (ขยายจาก auth.users)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'patient',
  hn text unique,                          -- Hospital Number (ผู้ป่วย)
  full_name text not null default '',
  full_name_en text,
  phone text,
  email text,
  date_of_birth date,
  blood_group text,
  gender text,
  national_id_masked text,                 -- แสดงแบบ X-XXXX-XXXXX-XX-X
  rights_type text,                        -- บัตรทอง / ประกันสังคม / ข้าราชการ / อื่น
  emergency_contact_name text,
  emergency_contact_phone text,
  line_user_id text,
  preferred_lang text not null default 'th' check (preferred_lang in ('th', 'en')),
  consent jsonb default '{}'::jsonb,       -- { version, acceptedAt }
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_hn_idx on public.profiles (hn);
create index if not exists profiles_role_idx on public.profiles (role);

-- -----------------------------------------------------------------------------
-- feature_flags (knowledge 09)
-- -----------------------------------------------------------------------------
create table if not exists public.feature_flags (
  key text primary key,
  enabled boolean not null default true,
  description text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id)
);

-- ค่าเริ่มต้น Phase 1
insert into public.feature_flags (key, enabled, description) values
  ('epro', false, 'ePRO / Symptom Tracker (Phase 3)'),
  ('telemedicine', false, 'Video visit (Phase 3)'),
  ('ai_assistant', false, 'AI Patient Assistant (Phase 4)'),
  ('fast_track', false, 'Fast-track queue'),
  ('caregiver', true, 'Caregiver access'),
  ('line_notify', false, 'LINE notifications (Phase 2)'),
  ('promptpay', true, 'PromptPay QR payment'),
  ('education', true, 'Education library')
on conflict (key) do nothing;

-- -----------------------------------------------------------------------------
-- app_settings (ค่าที่ admin ตั้งได้ — manual URL, hospital info ฯลฯ)
-- -----------------------------------------------------------------------------
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id)
);

insert into public.app_settings (key, value) values
  ('manual_url', '{"th": "", "en": ""}'::jsonb),
  ('hospital_info', '{
    "name_th": "โรงพยาบาลศูนย์มะเร็ง จ.อุดรธานี",
    "name_en": "Udonthani Cancer Hospital",
    "phone": "042-110345",
    "mobile": "0610197171",
    "line_id": "@udch",
    "hours": "จันทร์–ศุกร์ 07:30–14:00"
  }'::jsonb),
  ('promptpay_id', '""'::jsonb)
on conflict (key) do nothing;

-- -----------------------------------------------------------------------------
-- ai_settings + ai_events (knowledge 11) — เตรียมไว้แม้ AI เปิดทีหลัง
-- -----------------------------------------------------------------------------
create table if not exists public.ai_settings (
  id int primary key default 1 check (id = 1),  -- แถวเดียว
  default_provider text,                        -- null = ใช้ env
  fallback_provider text,                       -- 'none' = ปิด fallback
  model_overrides jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id)
);

insert into public.ai_settings (id) values (1) on conflict do nothing;

create table if not exists public.ai_events (
  id bigserial primary key,
  provider text not null,
  task text not null,                           -- chat | document | reasoning | config
  status text not null check (status in ('fallback', 'error')),
  error_code text,
  message text,
  created_at timestamptz not null default now()
);

create index if not exists ai_events_created_idx on public.ai_events (created_at desc);

-- -----------------------------------------------------------------------------
-- cancer_journeys + journey_steps (Module 2 — โครง Phase 1, เติมเต็ม Phase 2)
-- -----------------------------------------------------------------------------
create table if not exists public.cancer_journeys (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  diagnosis text,                               -- เช่น มะเร็งเต้านม
  diagnosis_code text,                          -- ICD ถ้ามี
  stage text,
  protocol text,                                -- เช่น AC-T
  status text not null default 'active',        -- active | completed | paused
  started_at date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cancer_journeys_patient_idx
  on public.cancer_journeys (patient_id);

create table if not exists public.journey_steps (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.cancer_journeys (id) on delete cascade,
  sort_order int not null default 0,
  title text not null,
  description text,
  status public.journey_step_status not null default 'todo',
  completed_at date,
  meta jsonb default '{}'::jsonb,               -- เช่น { "cycle": "3/6" }
  created_at timestamptz not null default now()
);

create index if not exists journey_steps_journey_idx
  on public.journey_steps (journey_id, sort_order);

-- -----------------------------------------------------------------------------
-- appointments + queue_tickets (Module 3)
-- -----------------------------------------------------------------------------
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  appointment_type text not null,               -- blood_test | doctor | chemo | radiation | imaging | follow_up | other
  title text not null,
  scheduled_at timestamptz not null,
  location text,                                -- ห้อง / ชั้น
  department text,
  status public.appointment_status not null default 'scheduled',
  preparation text,                             -- คำแนะนำก่อนมา
  notes text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists appointments_patient_idx
  on public.appointments (patient_id, scheduled_at);
create index if not exists appointments_date_idx
  on public.appointments (scheduled_at);

create table if not exists public.queue_tickets (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments (id) on delete set null,
  patient_id uuid not null references public.profiles (id) on delete cascade,
  service_point text not null,                  -- lab | opd | pharmacy | chemo | ...
  queue_number int,
  status public.queue_status not null default 'waiting',
  estimated_wait_minutes int,
  called_at timestamptz,
  completed_at timestamptz,
  service_date date not null default (timezone('Asia/Bangkok', now()))::date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists queue_tickets_date_point_idx
  on public.queue_tickets (service_date, service_point, status);

-- -----------------------------------------------------------------------------
-- medical_results (Module 4)
-- -----------------------------------------------------------------------------
create table if not exists public.medical_results (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  result_type public.result_type not null,
  title text not null,
  result_date date not null,
  summary text,                                 -- คำอธิบายภาษาคน
  status text not null default 'final',         -- preliminary | final
  is_abnormal boolean default false,
  values jsonb default '{}'::jsonb,             -- { "wbc": 5.2, "unit": "..." }
  file_path text,                               -- Storage path
  viewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists medical_results_patient_idx
  on public.medical_results (patient_id, result_date desc);

-- -----------------------------------------------------------------------------
-- medications + treatment_cycles (Module 5)
-- -----------------------------------------------------------------------------
create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  dosage text,
  instructions text,
  start_date date,
  end_date date,
  is_active boolean not null default true,
  reminder_times time[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists medications_patient_idx
  on public.medications (patient_id) where is_active;

create table if not exists public.treatment_cycles (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid references public.cancer_journeys (id) on delete cascade,
  patient_id uuid not null references public.profiles (id) on delete cascade,
  treatment_type text not null,                 -- chemo | radiation | surgery | other
  protocol text,
  cycle_number int,
  total_cycles int,
  status public.journey_step_status not null default 'todo',
  scheduled_at timestamptz,
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists treatment_cycles_patient_idx
  on public.treatment_cycles (patient_id);

-- -----------------------------------------------------------------------------
-- messages + notifications (Module 7 — Phase 1 in-app; LINE ใน Phase 2)
-- -----------------------------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  subject text,
  status text not null default 'open',          -- open | closed
  last_message_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id),
  body text not null,
  attachments jsonb default '[]'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_idx
  on public.messages (conversation_id, created_at);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text,
  link text,
  channel public.message_channel not null default 'in_app',
  status public.notification_status not null default 'queued',
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists notifications_user_idx
  on public.notifications (user_id, created_at desc);

-- notification_log สำหรับคิว LINE (knowledge 07) — ใช้ Phase 2
create table if not exists public.notification_log (
  id bigserial primary key,
  notification_id uuid references public.notifications (id) on delete set null,
  user_id uuid references public.profiles (id) on delete set null,
  channel text not null default 'line',
  status text not null default 'queued',
  payload jsonb,
  attempts int not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

-- -----------------------------------------------------------------------------
-- documents (Module 9)
-- -----------------------------------------------------------------------------
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  doc_type text not null,                       -- cert | referral | receipt | lab | treatment_summary | other
  title text not null,
  file_path text,                               -- Storage
  issued_at date,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists documents_patient_idx
  on public.documents (patient_id);

-- -----------------------------------------------------------------------------
-- payments (PromptPay — knowledge 03)
-- -----------------------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  amount_satang int not null check (amount_satang > 0),  -- เก็บเป็นสตางค์
  description text,
  status public.payment_status not null default 'pending',
  slip_path text,                               -- Storage รูปสลิป
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_patient_idx on public.payments (patient_id);
create index if not exists payments_status_idx on public.payments (status);

-- -----------------------------------------------------------------------------
-- caregiver_links (Module 8 — เปิดโครง Phase 1, ใช้จริง Phase 2)
-- -----------------------------------------------------------------------------
create table if not exists public.caregiver_links (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  caregiver_id uuid not null references public.profiles (id) on delete cascade,
  permission public.caregiver_permission not null default 'appointments_only',
  status text not null default 'pending',       -- pending | active | revoked
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  revoked_at timestamptz,
  unique (patient_id, caregiver_id)
);

-- -----------------------------------------------------------------------------
-- education_articles (Module 11 — เนื้อหาความรู้)
-- -----------------------------------------------------------------------------
create table if not exists public.education_articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_th text not null,
  title_en text,
  body_th text,
  body_en text,
  category text,                                -- chemo | nutrition | mental | caregiver | general
  cancer_types text[] default '{}',             -- กรองตามชนิดมะเร็ง
  is_published boolean not null default true,
  sort_order int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- audit_log (ความปลอดภัย / PDPA)
-- -----------------------------------------------------------------------------
create table if not exists public.audit_log (
  id bigserial primary key,
  actor_id uuid references public.profiles (id),
  action text not null,
  resource_type text,
  resource_id text,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_actor_idx on public.audit_log (actor_id, created_at desc);

-- -----------------------------------------------------------------------------
-- updated_at trigger
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$ begin
  create trigger profiles_updated_at before update on public.profiles
    for each row execute function public.set_updated_at();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger appointments_updated_at before update on public.appointments
    for each row execute function public.set_updated_at();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger medications_updated_at before update on public.medications
    for each row execute function public.set_updated_at();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger payments_updated_at before update on public.payments
    for each row execute function public.set_updated_at();
exception when duplicate_object then null;
end $$;

-- -----------------------------------------------------------------------------
-- Auto-create profile on signup
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email, ''),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'patient')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.feature_flags enable row level security;
alter table public.app_settings enable row level security;
alter table public.ai_settings enable row level security;
alter table public.ai_events enable row level security;
alter table public.cancer_journeys enable row level security;
alter table public.journey_steps enable row level security;
alter table public.appointments enable row level security;
alter table public.queue_tickets enable row level security;
alter table public.medical_results enable row level security;
alter table public.medications enable row level security;
alter table public.treatment_cycles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_log enable row level security;
alter table public.documents enable row level security;
alter table public.payments enable row level security;
alter table public.caregiver_links enable row level security;
alter table public.education_articles enable row level security;
alter table public.audit_log enable row level security;

-- Helper: role ของผู้ใช้ปัจจุบัน
create or replace function public.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('nurse', 'doctor', 'admin')
  );
$$;

-- profiles
create policy profiles_select_own on public.profiles
  for select using (
    id = auth.uid()
    or public.is_staff()
    or exists (
      select 1 from public.caregiver_links cl
      where cl.caregiver_id = auth.uid()
        and cl.patient_id = profiles.id
        and cl.status = 'active'
    )
  );

create policy profiles_update_own on public.profiles
  for update using (id = auth.uid() or public.current_role() = 'admin');

-- feature_flags / app_settings: อ่านได้ทุกคนที่ login, แก้ได้ admin
create policy feature_flags_select on public.feature_flags
  for select to authenticated using (true);
create policy feature_flags_admin on public.feature_flags
  for all using (public.current_role() = 'admin');

create policy app_settings_select on public.app_settings
  for select to authenticated using (true);
create policy app_settings_admin on public.app_settings
  for all using (public.current_role() = 'admin');

create policy ai_settings_select on public.ai_settings
  for select to authenticated using (public.current_role() = 'admin');
create policy ai_settings_admin on public.ai_settings
  for all using (public.current_role() = 'admin');

create policy ai_events_admin on public.ai_events
  for all using (public.current_role() = 'admin');

-- Patient-owned data: เจ้าของ + staff + caregiver (ตามสิทธิ)
create policy journeys_select on public.cancer_journeys
  for select using (
    patient_id = auth.uid() or public.is_staff()
    or exists (
      select 1 from public.caregiver_links cl
      where cl.caregiver_id = auth.uid() and cl.patient_id = cancer_journeys.patient_id
        and cl.status = 'active'
    )
  );

create policy journeys_staff_write on public.cancer_journeys
  for all using (public.is_staff());

create policy journey_steps_select on public.journey_steps
  for select using (
    exists (
      select 1 from public.cancer_journeys j
      where j.id = journey_steps.journey_id
        and (j.patient_id = auth.uid() or public.is_staff())
    )
  );

create policy appointments_select on public.appointments
  for select using (
    patient_id = auth.uid() or public.is_staff()
    or exists (
      select 1 from public.caregiver_links cl
      where cl.caregiver_id = auth.uid() and cl.patient_id = appointments.patient_id
        and cl.status = 'active'
    )
  );
create policy appointments_patient_insert on public.appointments
  for insert with check (patient_id = auth.uid() or public.is_staff());
create policy appointments_update on public.appointments
  for update using (patient_id = auth.uid() or public.is_staff());

create policy queue_select on public.queue_tickets
  for select using (patient_id = auth.uid() or public.is_staff());
create policy queue_staff_write on public.queue_tickets
  for all using (public.is_staff());

create policy results_select on public.medical_results
  for select using (
    patient_id = auth.uid() or public.is_staff()
    or exists (
      select 1 from public.caregiver_links cl
      where cl.caregiver_id = auth.uid() and cl.patient_id = medical_results.patient_id
        and cl.status = 'active'
        and cl.permission in ('appointments_and_results', 'full')
    )
  );
create policy results_staff_write on public.medical_results
  for all using (public.is_staff());

create policy meds_select on public.medications
  for select using (patient_id = auth.uid() or public.is_staff());
create policy meds_staff_write on public.medications
  for all using (public.is_staff());

create policy cycles_select on public.treatment_cycles
  for select using (patient_id = auth.uid() or public.is_staff());
create policy cycles_staff_write on public.treatment_cycles
  for all using (public.is_staff());

create policy conv_select on public.conversations
  for select using (patient_id = auth.uid() or public.is_staff());
create policy conv_insert on public.conversations
  for insert with check (patient_id = auth.uid() or public.is_staff());

create policy msg_select on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.patient_id = auth.uid() or public.is_staff())
    )
  );
create policy msg_insert on public.messages
  for insert with check (sender_id = auth.uid());

create policy notif_select on public.notifications
  for select using (user_id = auth.uid() or public.is_staff());
create policy notif_update_own on public.notifications
  for update using (user_id = auth.uid());

create policy docs_select on public.documents
  for select using (patient_id = auth.uid() or public.is_staff());
create policy docs_staff_write on public.documents
  for all using (public.is_staff());

create policy payments_select on public.payments
  for select using (patient_id = auth.uid() or public.is_staff());
create policy payments_insert on public.payments
  for insert with check (patient_id = auth.uid());
create policy payments_staff_update on public.payments
  for update using (public.is_staff());

create policy caregiver_select on public.caregiver_links
  for select using (
    patient_id = auth.uid() or caregiver_id = auth.uid() or public.is_staff()
  );
create policy caregiver_patient_manage on public.caregiver_links
  for all using (patient_id = auth.uid() or public.current_role() = 'admin');

create policy education_select on public.education_articles
  for select using (is_published = true or public.is_staff());
create policy education_admin on public.education_articles
  for all using (public.current_role() = 'admin');

create policy audit_staff on public.audit_log
  for select using (public.is_staff());

-- -----------------------------------------------------------------------------
-- Storage buckets (รันใน Dashboard หรือผ่าน storage API)
-- -----------------------------------------------------------------------------
-- buckets แนะนำ:
--   avatars          (public read)
--   result-files     (private)
--   documents        (private)
--   payment-slips    (private)
--
-- นโยบาย storage ตั้งใน Supabase Dashboard ให้สอดคล้อง RLS ด้านบน
