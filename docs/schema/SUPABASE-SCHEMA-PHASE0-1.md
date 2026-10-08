# Supabase Schema — Phase 0–1

เอกสารนี้อธิบาย schema ที่ออกแบบสำหรับ Phase 0–1  
ไฟล์ migration จริง: `supabase/migrations/20261008000000_phase0_foundation.sql`

---

## วิธีสร้าง Project (สำหรับเจ้าของโครงการ)

1. ไปที่ [https://supabase.com](https://supabase.com) → New project  
   - ชื่อแนะนำ: `udch`  
   - Region: `Southeast Asia (Singapore)` หรือใกล้ที่สุด  
   - ตั้งรหัสผ่าน DB ให้แข็งแรง เก็บไว้ในที่ปลอดภัย

2. หลังสร้างเสร็จ คัดลอกค่าเหล่านี้เก็บไว้ (จะใส่ใน `.env` ฝั่งแอป):
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...   # ใช้เฉพาะ server / local ห้ามใส่ client
   ```

3. เปิด **SQL Editor** ใน Dashboard → วางเนื้อหาทั้งไฟล์  
   `supabase/migrations/20261008000000_phase0_foundation.sql` → Run

4. ไปที่ **Storage** → สร้าง buckets:
   | Bucket | Public |
   |--------|--------|
   | `avatars` | Yes |
   | `result-files` | No |
   | `documents` | No |
   | `payment-slips` | No |

5. (ทางเลือก) เปิด **Authentication → Providers**:
   - Email เปิดไว้สำหรับ staff/admin
   - ภายหลังเพิ่ม LINE / Phone OTP ตามต้องการ

6. ส่ง `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` ให้ผู้พัฒนา  
   (service role เก็บเองหรือใส่ Netlify env แบบ secret)

---

## แผนภาพตารางหลัก

```
auth.users
    │
    ▼
profiles ────────────┬──────────────┬──────────────┐
    │                │              │              │
    ▼                ▼              ▼              ▼
cancer_journeys   appointments   medical_results  medications
    │                │
    ▼                ▼
journey_steps     queue_tickets
    │
    ▼
treatment_cycles

profiles ◄── caregiver_links ──► profiles (caregiver)

conversations ──► messages
notifications / notification_log
documents / payments
education_articles
feature_flags / app_settings / ai_settings / ai_events
audit_log
```

---

## ตารางและหน้าที่ (Phase 0–1)

| ตาราง | ใช้กับ Module | หมายเหตุ |
|-------|---------------|----------|
| `profiles` | My Health, Auth | ผูก auth.users, มี HN, สิทธิ, consent |
| `feature_flags` | ทั้งระบบ (09) | ปิดฟีเจอร์จริงที่ server |
| `app_settings` | Manual URL, ข้อมูลรพ., PromptPay ID | key/value JSON |
| `ai_settings` / `ai_events` | Admin AI (11) | เตรียมไว้ Phase 4; schema พร้อม |
| `cancer_journeys` + `journey_steps` | Cancer Journey | โครง Phase 1, UI เต็ม Phase 2 |
| `appointments` + `queue_tickets` | นัด + คิว | Phase 1 |
| `medical_results` | Results Center | values เป็น JSONB |
| `medications` + `treatment_cycles` | ยา + รอบเคมี/รังสี | |
| `conversations` + `messages` | Communication | in-app Phase 1 |
| `notifications` + `notification_log` | แจ้งเตือน | LINE ใช้ log ใน Phase 2 |
| `documents` | เอกสาร | ไฟล์ใน Storage |
| `payments` | PromptPay | สถานะรอตรวจสลิป |
| `caregiver_links` | Caregiver | consent + permission |
| `education_articles` | Education | i18n th/en ในคอลัมน์ |
| `audit_log` | PDPA / security | |

---

## Roles

| role | ความหมาย |
|------|----------|
| `patient` | ผู้ป่วย |
| `caregiver` | ผู้ดูแล (เข้าผ่าน caregiver_links) |
| `nurse` | พยาบาล |
| `doctor` | แพทย์ |
| `admin` | ผู้ดูแลระบบ |

ฟังก์ชันช่วย: `current_role()`, `is_staff()`

---

## RLS สรุป

- ผู้ป่วยเห็น/แก้ข้อมูลของตัวเอง
- Staff (`nurse`/`doctor`/`admin`) เห็นข้อมูลผู้ป่วยที่เกี่ยวข้องกับงาน
- Caregiver เห็นตาม `permission` ที่ผู้ป่วยให้
- `feature_flags` / `app_settings` อ่านได้ทุกคนที่ login; เขียนได้เฉพาะ admin
- `ai_settings` / `ai_events` เฉพาะ admin

---

## สิ่งที่ยังไม่รวมใน Phase 0–1 (มา Phase 3+)

- ตาราง ePRO / symptom_logs + alert rules แยก
- Telemedicine sessions
- Referral tracking แบบละเอียด (อาจเพิ่มคอลัมน์หรือตารางใหม่)
- Integration mapping กับ HIS (HN external keys ฯลฯ)

เมื่อถึง Phase นั้นจะมี migration แยก

---

## หลังรัน migration แล้วตรวจอะไรบ้าง

ใน SQL Editor:

```sql
select tablename from pg_tables where schemaname = 'public' order by 1;
select * from public.feature_flags;
select * from public.ai_settings;
```

ควรเห็นตารางครบและ feature_flags มีแถวเริ่มต้น
