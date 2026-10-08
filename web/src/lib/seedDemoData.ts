/**
 * ใส่ข้อมูลตัวอย่างให้อุปกรณ์ทดสอบ / demo ผู้บริหาร
 * เรียกจากหน้า Me (เฉพาะตอน dev หรือกดปุ่ม) — เขียนเฉพาะของ user ปัจจุบัน
 */
import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export async function seedDemoDataForPatient(patientId: string): Promise<void> {
  const now = new Date();

  // settings/* ต้องเป็น admin — ข้ามใน seed ฝั่งผู้ป่วย

  const day = (offset: number, hour: number, minute = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    d.setHours(hour, minute, 0, 0);
    return Timestamp.fromDate(d);
  };

  const appointments = [
    {
      patientId,
      appointmentType: "blood_test",
      title: "ตรวจเลือด (CBC)",
      scheduledAt: day(1, 8, 0),
      location: "ห้องเจาะเลือด ชั้น 1",
      department: "Lab",
      status: "scheduled",
      preparation: "งดอาหาร 8 ชั่วโมง",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      patientId,
      appointmentType: "doctor",
      title: "พบแพทย์ ออนโคโลยี",
      scheduledAt: day(2, 9, 30),
      location: "คลินิกมะเร็ง ชั้น 2",
      department: "OPD",
      status: "scheduled",
      preparation: "นำผลเลือดมาด้วย",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      patientId,
      appointmentType: "chemo",
      title: "เคมีบำบัด รอบที่ 3",
      scheduledAt: day(4, 9, 0),
      location: "หน่วยเคมีบำบัด ชั้น 3",
      department: "Chemo",
      status: "scheduled",
      preparation: "ใช้เวลาประมาณ 3–4 ชม.",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  ];

  for (const a of appointments) {
    await addDoc(collection(db, "appointments"), a);
  }

  await addDoc(collection(db, "medicalResults"), {
    patientId,
    resultType: "lab",
    title: "CBC",
    resultDate: new Date(now.getTime() - 3 * 86400000).toISOString().slice(0, 10),
    summary: "ผลอยู่ในเกณฑ์ปกติ",
    status: "final",
    isAbnormal: false,
    values: { wbc: 6.2, hb: 12.4, plt: 210 },
    createdAt: serverTimestamp(),
  });

  await addDoc(collection(db, "medicalResults"), {
    patientId,
    resultType: "imaging",
    title: "CT ช่องอก",
    resultDate: new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10),
    summary: "มีรายงานแพทย์แล้ว",
    status: "final",
    isAbnormal: false,
    createdAt: serverTimestamp(),
  });

  await addDoc(collection(db, "medications"), {
    patientId,
    name: "Ondansetron",
    dosage: "8 mg",
    instructions: "กินก่อนเคมีบำบัด 1 ชั่วโมง",
    isActive: true,
    reminderTimes: ["07:00"],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const journeyRef = await addDoc(collection(db, "journeys"), {
    patientId,
    diagnosis: "มะเร็งตัวอย่าง (Demo)",
    stage: "II",
    protocol: "AC-T",
    status: "active",
    startedAt: new Date(now.getTime() - 60 * 86400000).toISOString().slice(0, 10),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const steps = [
    { sortOrder: 1, title: "วินิจฉัย", status: "done" },
    { sortOrder: 2, title: "วางแผน", status: "done" },
    { sortOrder: 3, title: "เคมีบำบัด", status: "active", meta: { cycle: "3/6" } },
    { sortOrder: 4, title: "ประเมินผล", status: "todo" },
    { sortOrder: 5, title: "ติดตาม", status: "todo" },
  ];
  for (const s of steps) {
    await addDoc(collection(db, "journeys", journeyRef.id, "steps"), {
      ...s,
      createdAt: serverTimestamp(),
    });
  }
}
