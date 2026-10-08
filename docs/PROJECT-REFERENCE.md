# UDCH Digital Cancer Care Platform — Project Reference

> เอกสารอ้างอิงหลักสำหรับสร้างระบบ UDCH จนเสร็จสมบูรณ์  
> อัปเดตล่าสุด: 2026-10-09  
> เก็บไว้ใน repo ที่ `docs/PROJECT-REFERENCE.md` เมื่อเริ่มพัฒนา

---

## 1. วิสัยทัศน์และ Concept

| รายการ | ค่า |
|--------|-----|
| ชื่อระบบ | **UDCH Digital Cancer Care Platform** (ชื่อแสดงผล: **UDCH Care+**) |
| Concept | One Patient · One Journey · One Connected Care |
| วิสัยทัศน์ | จาก “ระบบจองคิว + ดูผลตรวจ” → “Digital Companion ที่อยู่เคียงข้างผู้ป่วยตลอดเส้นทางมะเร็ง” |
| กลุ่มผู้ใช้ | ผู้ป่วยมะเร็ง, ผู้ดูแล (Caregiver), พยาบาล/แพทย์ (Staff), Admin |
| โรงพยาบาล | โรงพยาบาลศูนย์มะเร็ง จ.อุดรธานี |

### เป้าหมายหลัก 4 ข้อ
1. ลด Time Toxicity (เวลาที่เสียไปกับการมารพ. โดยไม่จำเป็น)
2. เพิ่ม Patient Engagement และคุณภาพชีวิตระหว่างรักษา
3. ลดภาระงานตอบคำถามพื้นฐานของเจ้าหน้าที่
4. สร้าง Digital Care Continuum ตั้งแต่ Referral → Treatment → Home/Palliative

---

## 2. แหล่งข้อกำหนด (Sources of Truth)

| ลำดับ | แหล่ง | ใช้ทำอะไร |
|------|--------|-----------|
| 1 | `docs` / Blueprint PDF — **UDCH Digital Cancer Care Platform Blueprint.pdf** | โครง Modules 12 ตัว, Priority, Roadmap 4 Phases, Architecture |
| 2 | ChatGPT design text | รายละเอียด Modules 1–18, Staff Portal, Killer Features, Security |
| 3 | Gemini design text | Clinical & Care, Patient Experience, Billing, Architecture เน้น real-time |
| 4 | Grok design text | Core Clinical, Queue Intelligence, Supportive Care, Practical/Financial |
| 5 | `docs/01`–`13` + `PDPA-RIGHTS-SECTION-KNOWLEDGE.md` | ความสามารถเทคนิค/แพลตฟอร์มที่ต้องฝังในระบบ |
| 6 | `docs/UDCH Care+ Mock-up.html` | Theme สี, UI pattern, หน้าจอตัวอย่าง |
| 7 | `docs/UDCH Logo.png` | Logo ระบบ |

**กฎ:** Blueprint เป็นหลักในการจัด Modules; ไฟล์ .txt ทั้ง 3 ใช้เติมรายละเอียด; knowledge 01–13 + PDPA กำหนดวิธี implement ข้าม feature

---

## 3. Tech Stack (บังคับ)

| ชั้น | เทคโนโลยี | หมายเหตุ |
|------|-----------|----------|
| Framework | **TanStack Start** (React 19 + Vite) | ตาม knowledge base (createServerFn, middleware) |
| UI | **Tailwind CSS v4** + **shadcn/ui** | Theme จาก Mock-up (Teal primary) |
| Auth | **Firebase Authentication** | Email ก่อน; Custom Claims สำหรับ role |
| Database | **Cloud Firestore** + **Realtime Database** | Firestore = ข้อมูลหลัก; RTDB = คิวสด / presence / typing |
| Storage | **Firebase Cloud Storage** | ผลตรวจ, เอกสาร, สลิป, avatar |
| Deploy | **Netlify** | Production URL: `https://udch.netlify.app/` |
| Source | **GitHub** `https://github.com/geeravut-lab/udch` | branch หลัก `main` |
| AI | Vercel AI SDK หลาย provider (Anthropic / OpenAI / Google) | ตาม `11-ai-provider-settings.md` |
| แจ้งเตือน | LINE Messaging API + Web Push / in-app | ตาม `07-line-notifications.md` (LINE เริ่ม Phase 2) |
| ชำระเงิน | PromptPay QR (ไม่มี gateway ใน phase แรก) | ตาม `03-promptpay-qr.md` |

### Production URL
- Production: `https://udch.netlify.app/`
- Deploy ผ่าน Netlify ผูกกับ GitHub repo นี้

---

## 4. กฎการทดสอบและ Deploy (สำคัญมาก)

1. **ทดสอบบน test / local / preview environment ของผู้พัฒนาเท่านั้น**
2. **ห้าม deploy หรือทดสอบบน Production โดยอัตโนมัติ** เพื่อประหยัด Netlify credits
3. ถ้าจำเป็นต้องทดสอบบน Production จริง ต้อง:
   - แจ้งขออนุญาตจากเจ้าของโครงการก่อนทุกครั้ง **หรือ**
   - แจ้งให้เจ้าของโครงการทดสอบเอง
4. Preview deploy (Netlify Deploy Preview จาก PR) อนุญาตได้ โดยไม่ถือว่าเป็น production
5. การ push ขึ้น `main` ที่ trigger production deploy ต้องได้รับอนุญาตชัดเจนก่อน

---

## 5. Theme และ Branding

อ้างอิงจาก `docs/UDCH Care+ Mock-up.html`:

| Token | ค่า (โดยประมาณ) | ใช้ทำ |
|-------|-----------------|--------|
| Primary | `#0D9488` (Teal) | ปุ่มหลัก, header, active state |
| Primary dark | `#0F766E` | Header gradient, ข้อความสำคัญ |
| Primary light | `#14B8A6` | Accent |
| Accent / Warning | `#F59E0B` (Amber) | แจ้งเตือน, badge |
| Background | `#F0FDFA` | พื้นหลังอ่อน |
| Success | `#10B981` | สถานะเสร็จ / เขียว |
| Danger | `#EF4444` | SOS, error |
| Font | Sarabun (หรือ Prompt) | รองรับภาษาไทย |

- Logo: `docs/UDCH Logo.png`
- โทนสีสดใส สงบ ลดความเครียดผู้ป่วย
- Mobile-first, ตัวอักษรใหญ่, ปุ่มชัด (ตาม knowledge 01)

---

## 6. Modules ของระบบ (จาก Blueprint — 12 Modules หลัก)

| # | Module | Priority | Phase แนะนำ |
|---|--------|----------|-------------|
| 1 | My Health / Dashboard | ★★★★★ | 1 |
| 2 | Cancer Journey | ★★★★★ | 1–2 |
| 3 | Smart Appointment & Queue | ★★★★★ | 1 |
| 4 | Results Center | ★★★★★ | 1 |
| 5 | Medication & Treatment | ★★★★★ | 1–2 |
| 6 | ePRO / Symptom Tracker | ★★★★ | 2–3 |
| 7 | Communication Center | ★★★★★ | 1–2 |
| 8 | Caregiver Mode | ★★★★ | 2 |
| 9 | Documents & Rights | ★★★★ | 1–2 |
| 10 | Hospital Navigation | ★★★ | 2–3 |
| 11 | Education & Support | ★★★★ | 2 |
| 12 | Referral & Regional Care | ★★★★★ | 2 |

**Killer Features:** Cancer Journey, ePRO + Alert Engine, Smart Queue + Fast-track, Caregiver Consent, Referral Tracking

**อย่าทำใน Version แรก:** AI Diagnosis, AI แนะนำการรักษา, Social Network ผู้ป่วย, Feature เยอะจนหน้าจอรก

---

## 7. การนำ Knowledge 01–13 + PDPA มาใช้กับ UDCH

| Knowledge | ความสามารถ | นำไปใช้กับ Feature UDCH |
|-----------|------------|-------------------------|
| **01 Responsive layout** | Mobile-first, breakpoint เดียว `md`, กัน bottom bar ทับเนื้อหา, 100dvh | ทุกหน้า Patient + Staff + Admin |
| **02 Navigation** | Desktop sidebar + Mobile bottom bar + sheet, nav list เดียว | โครง AppShell: หน้าหลัก / นัดหมาย / อาการ / ข้อความ / ของฉัน (+ Admin) |
| **03 PromptPay QR** | QR ไม่มี gateway, สถานะรอตรวจสลิป, ห้าม mark จ่ายเอง | Module 9 Documents & Rights — ชำระส่วนเกินสิทธิ / ค่าบริการ |
| **04 Subscriptions** | Premium / Family / PAYG + loop ตรวจสลิป | ถ้ามีบริการเสริม (เช่น Telemedicine พิเศษ) หรือข้ามไปก่อนถ้าเป็นรพ.รัฐล้วน |
| **05 Usage analytics** | DAU/WAU/MAU, เมนูที่ใช้บ่อย | Admin Dashboard — ติดตาม engagement ผู้ป่วย |
| **06 Automation rules** | Rules engine ปรับได้โดยไม่ deploy | ePRO Alert thresholds, แจ้งเตือนนัด, escalation พยาบาล |
| **07 LINE notifications** | คิว LINE + Flex card + retry | นัดหมาย, ผลตรวจพร้อม, คิวใกล้ถึง, Symptom alert, ยา |
| **08 Manual URL** | ลิงก์คู่มือที่ admin ตั้งได้ | หน้าช่วยเหลือ / คู่มือผู้ป่วย / คู่มือผู้ดูแล |
| **09 Feature flags** | ปิดฟีเจอร์จริงที่ server ไม่ใช่แค่ซ่อนปุ่ม | เปิด/ปิด ePRO, Telemedicine, AI Assistant, Fast-track ฯลฯ |
| **10 Billing & quota** | โควตาฟรี, fair-use, ต้นทุน | โควตา AI Assistant, Telemedicine ต่อสิทธิ |
| **11 AI provider settings** | Provider หลัก/สำรอง, โมเดลแยกตามงาน (chat/document/reasoning), dropdown + ปุ่มทดสอบ | **Admin: เลือกโมเดลแบบ drop-down ต่อ task**; AI Patient Assistant |
| **12 i18n TH/EN** | Dictionary compile-time, สลับภาษา | ทั้งแอป ไทยเป็นหลัก + อังกฤษ |
| **13 Data export & deletion** | ขอสำเนาข้อมูล + ลบบัญชี | ตั้งค่าผู้ป่วย + PDPA |
| **PDPA-RIGHTS** | สิทธิทันที (ดาวน์โหลด/นโยบาย/ลบ), ไม่รอแอดมิน | หน้าตั้งค่า — การ์ด “สิทธิของคุณตามกฎหมาย” |

### จุดโฟกัสพิเศษจากข้อ 6 ของผู้ว่าจ้าง
- **Admin เลือก “รุ่นโมเดล” ของแต่ละ AI Provider เป็น drop-down**
- ดึงรายการโมเดลจาก API จริงของเจ้า (cache) + ปุ่ม “ทดสอบ” ข้างทุกช่อง
- โครงสร้างตาม `11-ai-provider-settings.md`:  
  `ai_settings` (แถวเดียว) + `ai_events` + `withProviderFallback` + สามชั้น DB → env → โค้ด

---

## 8. บทบาทผู้ใช้ (Roles)

| Role | สิทธิหลัก |
|------|-----------|
| **patient** | ดู/จัดการข้อมูลตัวเอง, จองคิว, บันทึกอาการ, แชท, เอกสาร |
| **caregiver** | ตาม consent ที่ผู้ป่วยให้ (ดูนัด / ดูผล / เต็ม) |
| **nurse** | Nurse Dashboard, Symptom alerts, ตอบข้อความ, จัดการคิว |
| **doctor** | ดู Patient Timeline, แผนการรักษา, ข้อความ |
| **admin** | Feature flags, AI settings, Billing/quota, Analytics, Manual URL, Users |

Authentication: Supabase Auth (HN + OTP / LINE Login / Email ตามที่ออกแบบใน Phase 1)

---

## 9. Development Roadmap (เสนอเพื่อตัดสินใจ)

### Phase 0 — Foundation (ประมาณ 1–2 สัปดาห์)
- Scaffold TanStack Start + Tailwind + shadcn
- Supabase project: schema เริ่มต้น, RLS, Storage buckets
- AppShell (01+02): responsive + nav
- i18n TH/EN (12)
- Auth flow (login / session)
- Theme + Logo
- Feature flags skeleton (09)
- Deploy pipeline: local + Netlify Deploy Preview เท่านั้น (ไม่ auto-prod)

### Phase 1 — Patient Portal 2.0
- Dashboard + My Health
- Appointment + Smart Queue (พื้นฐาน)
- Results Center (list + detail; trend graph พื้นฐาน)
- Medication list + reminders โครงสร้าง
- Documents (view/download)
- Notification in-app + LINE พื้นฐาน (07)
- Secure Messaging พื้นฐาน
- PDPA การ์ดสิทธิ (13 + PDPA knowledge)
- Hospital info / ติดต่อ

**เป้าหมาย Phase 1:** ผู้ป่วยไม่ต้องโทรถามเรื่องพื้นฐาน

### Phase 2 — Digital Cancer Journey
- Cancer Journey timeline + Next Actions
- Treatment schedule (Chemo/RT cycles)
- Caregiver invite + consent permissions
- Referral tracking UI
- Personalized education library
- PromptPay QR สำหรับส่วนเกิน (03) ถ้าต้องการ
- Manual URL คู่มือ (08)

**เป้าหมาย:** ผู้ป่วยรู้ว่าอยู่ขั้นตอนไหนและต้องทำอะไรต่อ

### Phase 3 — Digital Oncology Care
- ePRO daily/weekly + Alert Engine (ผูก 06 automation)
- Nurse Dashboard + alerts
- Telemedicine / video (feature-flagged)
- Symptom self-management content
- Home / Palliative module โครง

### Phase 4 — Intelligent Platform
- AI Patient Assistant (ห่อด้วย 11)
- Admin AI provider settings UI (dropdown โมเดลต่อ task)
- Analytics (05)
- Survivorship, Health ID / หมอพร้อม integration (ถ้ามี API)

---

## 10. สิ่งที่ยังไม่ทำ / ข้อจำกัด Phase แรก

- ไม่เชื่อม HIS/LIS/RIS จริงใน Phase 0–1 → ใช้ mock / seed data หรือ API stub
- ไม่มี AI วินิจฉัยหรือแนะนำการรักษา
- ไม่มี Social network ผู้ป่วย
- Production deploy เฉพาะเมื่อได้รับอนุญาต

---

## 11. โครงสร้างโฟลเดอร์เป้าหมาย (ร่าง)

```text
udch/
├── docs/                    # knowledge + blueprint + mock-up + logo + PROJECT-REFERENCE.md
├── src/
│   ├── routes/              # TanStack Router
│   ├── components/          # UI + AppShell
│   ├── lib/                 # supabase, ai-provider, flags, i18n, queue…
│   ├── server/              # createServerFn, scheduled ticks
│   └── styles.css           # Tailwind v4 @theme
├── supabase/
│   ├── migrations/
│   └── seed/
├── netlify.toml
├── package.json
└── README.md
```

---

## 12. Checklist ก่อนเริ่มเขียนโค้ด (รอการอนุมัติ)

- [ ] เจ้าของโครงการอนุมัติแผน Phase 0 → 1 นี้
- [x] ตัดสินใจใช้ Firebase (Auth + Firestore + RTDB + Storage) แทน Supabase
- [ ] มี Firebase project (web config + databaseURL + service account สำหรับ server)
- [ ] มี Netlify site ผูก repo (deploy preview เปิด, production deploy ล็อกไว้ก่อน)
- [ ] มี LINE OA / Messaging API (ถ้าจะทำแจ้งเตือนใน Phase 1)
- [ ] ยืนยันว่า mock data พอสำหรับ demo ผู้บริหาร โดยยังไม่ต้องต่อ HIS

---

## 13. ประวัติการตัดสินใจ

| วันที่ | รายการ |
|--------|--------|
| 2026-10-08 | กำหนด stack, กฎทดสอบ, mapping knowledge → features, roadmap 4 phases |
| 2026-10-08 | Repo GitHub พร้อมใช้งาน (public), docs knowledge อัปโหลดแล้ว |
| 2026-10-08 | รออนุมัติแผนจากเจ้าของโครงการก่อน scaffold |

---

*จบเอกสารอ้างอิง — ใช้ไฟล์นี้เป็นสัญญาการทำงานร่วมกันตลอดโครงการ*

---

## 14. การตัดสินใจที่อนุมัติแล้ว (2026-10-08)

| ข้อ | การตัดสินใจ |
|-----|-------------|
| แผน Phase 0 → 1 | **อนุมัติ** |
| Supabase | ยังไม่มี project — ออกแบบ schema ก่อน แล้วเจ้าของโครงการสร้างตามเอกสาร |
| Netlify | ผูก repo แล้ว · เปิดแค่ Deploy Preview · ล็อก production deploy |
| LINE OA | ใช้แจ้งเตือนใน **Phase 2** (Phase 1 ใช้ in-app เท่านั้น) |
| PROJECT-REFERENCE.md | Commit ขึ้น `docs/` ใน GitHub |

### ไฟล์ schema ที่เกี่ยวข้อง
- `supabase/migrations/20261008000000_phase0_foundation.sql`
- `docs/schema/SUPABASE-SCHEMA-PHASE0-1.md` (คู่มือสร้าง project + อธิบายตาราง)

---

## 15. การตัดสินใจเปลี่ยน Data Stack (2026-10-09)

| ข้อ | การตัดสินใจ |
|-----|-------------|
| Backend data | **เปลี่ยนจาก Supabase → Firebase** |
| บริการที่ใช้ | Authentication + **Cloud Firestore** + **Realtime Database** + Cloud Storage |
| RTDB ใช้ทำอะไร | คิวสด (`/queue`, `/queueMeta`), presence, chat typing |
| Firestore ใช้ทำอะไร | โปรไฟล์, นัด, ผลตรวจ, ยา, journey, ข้อความ, เอกสาร, ตั้งค่า, AI settings |
| Schema เอกสาร | `docs/schema/FIREBASE-DATA-MODEL-PHASE0-1.md` |
| Security Rules | `firebase/firestore.rules`, `firebase/database.rules.json`, `firebase/storage.rules` |
| ของเก่า Supabase | เก็บใน `docs/archive/` เป็นประวัติ — ไม่ใช้ runtime |

### ผลกระทบต่อ Phase 0
- Scaffold ใช้ Firebase JS SDK แทน `@supabase/supabase-js`
- Knowledge 01–13 ยังใช้แนวคิดได้ ต้องแปล data access layer
- รอเจ้าของโครงการสร้าง Firebase project แล้วส่ง web config + RTDB URL

---

---

## สถานะล่าสุด (Phase 0–4)

**อัปเดตเมื่อ:** 2026-10-09 04:21 +0700

### ครบแล้ว
- Phase 0 Foundation ✅
- Phase 1 Patient Portal ✅ (รวม PDPA ลบ, เอกสาร Storage, med reminder)
- Phase 2 Journey ✅ (รวม caregiver accept, queue staff/demo)
- Phase 3 Advanced ✅ (ePRO สีตามค่า, nurse triage, fast-track, telemed)
- Phase 4 AI ✅ (ผู้ช่วยผู้ป่วย + หน้า admin เลือก provider/model ตามงาน)

### ยังไม่ทำ (ก่อน production ตามที่ขอ)
- LINE OA แจ้งเตือนจริง
- Manual URL คู่มือ (08)
- Custom claims ตั้ง role อัตโนมัติ
- Edge Function เรียก LLM จริง (โครง edgeFunctionUrl พร้อม)
- HIS integration

### ePRO สีแถบ
| ค่า | สี | ความหมาย |
|-----|-----|----------|
| 0–3 | เขียว | ดี |
| 4–6 | ฟ้า | เฝ้าระวัง |
| 7–10 | ส้ม | ต้องติดตาม |

### AI
- หน้า `/ai` — ผู้ช่วย (local FAQ หรือ edge function)
- หน้า `/admin/ai` — admin เลือก provider + model dropdown แยก chat/document/reasoning
- เก็บที่ `settings/aiSettings`

### Netlify AI Function (2026-10-09 04:34 +0700)
- Path: `web/netlify/functions/ai-chat.mjs`
- Endpoint: `/.netlify/functions/ai-chat`
- Env: `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GOOGLE_AI_API_KEY`
- แอปเรียกอัตโนมัติ; ถ้าไม่มี key ถอยไปความรู้ท้องถิ่น
- ดูรายละเอียด: `docs/NETLIFY-AI-FUNCTION.md`
