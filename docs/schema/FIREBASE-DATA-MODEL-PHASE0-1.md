# Firebase Data Model — Phase 0–1

> แทนที่ Supabase schema  
> Stack: **Firebase Authentication + Cloud Firestore + Realtime Database + Cloud Storage**  
> อัปเดต: 2026-10-09

---

## 1. บริการ Firebase ที่ใช้

| บริการ | ใช้ทำอะไรใน UDCH |
|--------|------------------|
| **Authentication** | Login ผู้ป่วย / caregiver / staff / admin (Email ก่อน; LINE ภายหลัง) |
| **Cloud Firestore** | ข้อมูลหลักแบบ document: โปรไฟล์, นัด, ผลตรวจ, ยา, journey, ข้อความ, เอกสาร, ตั้งค่า |
| **Realtime Database** | สถานะที่ต้อง sync เร็ว: คิวสด, typing/presence แชท, online staff (optional) |
| **Cloud Storage** | ไฟล์ผลตรวจ, เอกสาร, สลิปชำระเงิน, รูปโปรไฟล์ |
| **Cloud Functions** (ภายหลัง) | Admin SDK งานหลังบ้าน, LINE deliver (Phase 2), scheduled ticks |

**หลักการแบ่ง Firestore vs RTDB**

- **Firestore** = ข้อมูลที่ต้อง query / กรอง / เก็บถาวร / กฎซับซ้อน
- **RTDB** = ข้อมูลที่เปลี่ยนบ่อยและต้องการ latency ต่ำ (คิววันนี้, presence)

อย่าเก็บ medical record ทั้งก้อนใน RTDB

---

## 2. Authentication & Roles

### Custom Claims (ตั้งด้วย Admin SDK เท่านั้น)

```json
{
  "role": "patient" | "caregiver" | "nurse" | "doctor" | "admin",
  "hn": "46908537"
}
```

| role | ความหมาย |
|------|----------|
| `patient` | ผู้ป่วย |
| `caregiver` | ผู้ดูแล (สิทธิ์จริงดูจาก `caregiverLinks`) |
| `nurse` | พยาบาล |
| `doctor` | แพทย์ |
| `admin` | ผู้ดูแลระบบ |

ฟังก์ชันช่วยใน Rules: `isStaff()`, `isAdmin()`, `isOwner(uid)`

### Auth providers Phase 0–1
- Email / Password (staff + admin + ผู้ป่วยช่วงแรก)
- (Phase 2+) LINE Login / Phone OTP ตามต้องการ

---

## 3. Cloud Firestore — โครงสร้าง Collection

```text
users/{uid}
journeys/{journeyId}
  └─ steps/{stepId}
appointments/{appointmentId}
medicalResults/{resultId}
medications/{medicationId}
treatmentCycles/{cycleId}
conversations/{conversationId}
  └─ messages/{messageId}
notifications/{notificationId}
documents/{documentId}
payments/{paymentId}
caregiverLinks/{linkId}
educationArticles/{articleId}
settings/featureFlags
settings/app
settings/ai
settings/hospital
aiEvents/{eventId}
auditLog/{logId}
```

### 3.1 `users/{uid}`

```ts
{
  uid: string;                    // = auth uid
  role: "patient" | "caregiver" | "nurse" | "doctor" | "admin";
  hn?: string;                    // Hospital Number (ผู้ป่วย)
  fullName: string;
  fullNameEn?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;           // YYYY-MM-DD
  bloodGroup?: string;
  gender?: string;
  nationalIdMasked?: string;
  rightsType?: string;            // บัตรทอง | ประกันสังคม | ...
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  lineUserId?: string;
  preferredLang: "th" | "en";
  consent?: { version: string; acceptedAt: string };
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 3.2 `journeys/{journeyId}` + `steps/{stepId}`

```ts
// journeys/{id}
{
  patientId: string;
  diagnosis?: string;
  diagnosisCode?: string;
  stage?: string;
  protocol?: string;              // เช่น AC-T
  status: "active" | "completed" | "paused";
  startedAt?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// journeys/{id}/steps/{stepId}
{
  sortOrder: number;
  title: string;
  description?: string;
  status: "done" | "active" | "todo";
  completedAt?: string;
  meta?: { cycle?: string; [k: string]: unknown };
  createdAt: Timestamp;
}
```

### 3.3 `appointments/{appointmentId}`

```ts
{
  patientId: string;
  appointmentType: string;        // blood_test | doctor | chemo | radiation | imaging | follow_up | other
  title: string;
  scheduledAt: Timestamp;
  location?: string;
  department?: string;
  status: "scheduled" | "checked_in" | "in_progress" | "completed" | "cancelled" | "no_show";
  preparation?: string;
  notes?: string;
  createdBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 3.4 `medicalResults/{resultId}`

```ts
{
  patientId: string;
  resultType: "lab" | "imaging" | "pathology" | "other";
  title: string;
  resultDate: string;             // YYYY-MM-DD
  summary?: string;
  status: "preliminary" | "final";
  isAbnormal?: boolean;
  values?: Record<string, unknown>;
  filePath?: string;              // Storage path
  viewedAt?: Timestamp;
  createdAt: Timestamp;
}
```

### 3.5 `medications/{medicationId}`

```ts
{
  patientId: string;
  name: string;
  dosage?: string;
  instructions?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  reminderTimes?: string[];       // "08:00", "20:00"
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 3.6 `treatmentCycles/{cycleId}`

```ts
{
  journeyId?: string;
  patientId: string;
  treatmentType: "chemo" | "radiation" | "surgery" | "other";
  protocol?: string;
  cycleNumber?: number;
  totalCycles?: number;
  status: "done" | "active" | "todo";
  scheduledAt?: Timestamp;
  completedAt?: Timestamp;
  notes?: string;
  createdAt: Timestamp;
}
```

### 3.7 `conversations/{id}` + `messages/{messageId}`

```ts
// conversations/{id}
{
  patientId: string;
  subject?: string;
  status: "open" | "closed";
  participantIds: string[];       // patient + staff ที่เกี่ยวข้อง
  lastMessageAt?: Timestamp;
  createdAt: Timestamp;
}

// messages/{messageId}
{
  senderId: string;
  body: string;
  attachments?: { name: string; path: string; contentType?: string }[];
  readAt?: Timestamp;
  createdAt: Timestamp;
}
```

### 3.8 `notifications/{notificationId}`

```ts
{
  userId: string;
  title: string;
  body?: string;
  link?: string;
  channel: "in_app" | "line" | "sms" | "email";
  status: "queued" | "sent" | "failed" | "read";
  meta?: Record<string, unknown>;
  createdAt: Timestamp;
  readAt?: Timestamp;
}
```

### 3.9 `documents/{documentId}`

```ts
{
  patientId: string;
  docType: string;                // cert | referral | receipt | lab | treatment_summary | other
  title: string;
  filePath?: string;
  issuedAt?: string;
  meta?: Record<string, unknown>;
  createdAt: Timestamp;
}
```

### 3.10 `payments/{paymentId}` (PromptPay)

```ts
{
  patientId: string;
  amountSatang: number;           // จำนวนเงินเป็นสตางค์
  description?: string;
  status: "pending" | "awaiting_review" | "paid" | "rejected" | "cancelled";
  slipPath?: string;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  reviewNote?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**กฎ:** ห้ามให้ client ตั้ง `status` เป็น `paid` เอง — เฉพาะ staff/admin ผ่าน Admin SDK หรือ Rules ที่ตรวจ role

### 3.11 `caregiverLinks/{linkId}`

```ts
{
  patientId: string;
  caregiverId: string;
  permission: "appointments_only" | "appointments_and_results" | "full";
  status: "pending" | "active" | "revoked";
  invitedAt: Timestamp;
  acceptedAt?: Timestamp;
  revokedAt?: Timestamp;
}
```

### 3.12 `educationArticles/{articleId}`

```ts
{
  slug: string;
  titleTh: string;
  titleEn?: string;
  bodyTh?: string;
  bodyEn?: string;
  category?: string;
  cancerTypes?: string[];
  isPublished: boolean;
  sortOrder: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 3.13 `settings/*` (document คงที่)

```ts
// settings/featureFlags
{
  epro: boolean;
  telemedicine: boolean;
  ai_assistant: boolean;
  fast_track: boolean;
  caregiver: boolean;
  line_notify: boolean;
  promptpay: boolean;
  education: boolean;
  updatedAt: Timestamp;
  updatedBy?: string;
}

// settings/app
{
  manualUrl: { th: string; en: string };
  promptpayId: string;
  updatedAt: Timestamp;
  updatedBy?: string;
}

// settings/hospital
{
  nameTh: string;
  nameEn: string;
  phone: string;
  mobile?: string;
  lineId?: string;
  hours?: string;
}

// settings/ai  (knowledge 11 — Admin dropdown โมเดล)
{
  defaultProvider: string | null;
  fallbackProvider: string | null;  // "none" = ปิด
  modelOverrides: {
    anthropic?: { chat?: string; document?: string; reasoning?: string };
    openai?: { chat?: string; document?: string; reasoning?: string };
    google?: { chat?: string; document?: string; reasoning?: string };
  };
  updatedAt: Timestamp;
  updatedBy?: string;
}
```

### 3.14 `aiEvents/{eventId}` / `auditLog/{logId}`

```ts
// aiEvents — บันทึกเฉพาะ fallback / error
{
  provider: string;
  task: string;
  status: "fallback" | "error";
  errorCode?: string;
  message?: string;
  createdAt: Timestamp;
}

// auditLog
{
  actorId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  meta?: Record<string, unknown>;
  createdAt: Timestamp;
}
```

---

## 4. Realtime Database — โครงสร้าง

ใช้ path แยกจากข้อมูลถาวร เน้น **คิวสด** และ **presence**

```text
/queue/{yyyy-mm-dd}/{servicePoint}/{ticketId}
/queueMeta/{yyyy-mm-dd}/{servicePoint}
/presence/{uid}
/chatTyping/{conversationId}/{uid}
```

### 4.1 คิวสด `/queue/{date}/{servicePoint}/{ticketId}`

```json
{
  "patientId": "uid...",
  "appointmentId": "optional",
  "queueNumber": 12,
  "status": "waiting | called | serving | done | skipped",
  "estimatedWaitMinutes": 45,
  "displayName": "นายจ***",
  "updatedAt": 1728...
}
```

### 4.2 `/queueMeta/{date}/{servicePoint}`

```json
{
  "nowServing": 10,
  "totalWaiting": 8,
  "updatedAt": 1728...
}
```

ผู้ป่วย subscribe เฉพาะ `servicePoint` ของตัวเองในวันนั้น  
Staff subscribe ทั้งจุดบริการที่รับผิดชอบ

### 4.3 `/presence/{uid}`

```json
{
  "state": "online | offline",
  "lastChanged": 1728...,
  "role": "nurse"
}
```

### 4.4 `/chatTyping/{conversationId}/{uid}`

```json
true
```

ค่านี้ควรมี TTL / ลบเมื่อหยุดพิมพ์ (client หรือ onDisconnect)

---

## 5. Cloud Storage — Buckets / Paths

Firebase Storage ใช้ bucket เดียว แยกด้วย path:

```text
avatars/{uid}/profile.jpg
results/{patientId}/{resultId}/file.pdf
documents/{patientId}/{documentId}/file.pdf
payment-slips/{patientId}/{paymentId}/slip.jpg
```

Rules: อ่านได้เฉพาะเจ้าของหรือ staff; เขียนสลิปได้เฉพาะผู้ป่วยของ payment นั้น

---

## 6. Indexes ที่ควรสร้างใน Firestore

| Collection | Fields |
|------------|--------|
| appointments | patientId ASC, scheduledAt ASC |
| medicalResults | patientId ASC, resultDate DESC |
| medications | patientId ASC, isActive ASC |
| notifications | userId ASC, createdAt DESC |
| payments | patientId ASC, status ASC |
| payments | status ASC, createdAt DESC (staff review queue) |
| caregiverLinks | patientId ASC, status ASC |
| caregiverLinks | caregiverId ASC, status ASC |
| journeys | patientId ASC, status ASC |
| conversations | patientId ASC, lastMessageAt DESC |

สร้างผ่าน Firebase Console → Firestore → Indexes หรือ `firestore.indexes.json`

---

## 7. วิธีสร้าง Firebase Project (สำหรับเจ้าของโครงการ)

1. [Firebase Console](https://console.firebase.google.com) → Add project → ชื่อ `udch` (หรือ `udch-care`)
2. เปิด **Authentication** → Sign-in method → Email/Password
3. สร้าง **Firestore Database** (production mode แล้ววาง Rules จากไฟล์ `firestore.rules`)
4. สร้าง **Realtime Database** (region ที่ใกล้ เช่น `asia-southeast1`) แล้ววาง Rules จาก `database.rules.json`
5. เปิด **Storage** แล้ววาง Rules จาก `storage.rules`
6. Project settings → General → Your apps → เพิ่ม Web app → คัดลอก config
7. Project settings → Service accounts → Generate new private key (เก็บเป็น secret ฝั่ง server เท่านั้น)

ส่งให้ผู้พัฒนา (client-safe เท่านั้น):

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_DATABASE_URL=   # RTDB URL
```

Service account JSON → Netlify env secret / local เท่านั้น **ห้าม commit**

---

## 8. ของเก่า (Supabase) จัดการอย่างไร

| ไฟล์ | การจัดการ |
|------|-----------|
| `supabase/migrations/*.sql` | ย้ายไป `docs/archive/supabase/` หรือเก็บเป็นประวัติ — ไม่ใช้ใน runtime |
| `docs/schema/SUPABASE-SCHEMA-PHASE0-1.md` | เก็บใน `docs/archive/` ทำเครื่องหมาย deprecated |

แหล่งความจริงของ data layer ตั้งแต่นี้ = **เอกสารนี้ + Rules ใน `firebase/`**

---

## 9. Mapping กลับไป Modules Phase 0–1

| Module | Firestore | RTDB |
|--------|-----------|------|
| My Health / Dashboard | `users`, `journeys`, `appointments` | — |
| Cancer Journey | `journeys` + `steps` | — |
| Appointment | `appointments` | — |
| Smart Queue | อ้างอิง appointment | `/queue`, `/queueMeta` |
| Results | `medicalResults` + Storage | — |
| Medication | `medications`, `treatmentCycles` | — |
| Communication | `conversations` / `messages`, `notifications` | `/chatTyping`, `/presence` |
| Documents & Rights | `documents`, `payments` + Storage | — |
| Caregiver | `caregiverLinks` | — |
| Education | `educationArticles` | — |
| Admin flags / AI / hospital | `settings/*`, `aiEvents` | — |
| PDPA | export จาก collections ของ uid + Storage list | — |
