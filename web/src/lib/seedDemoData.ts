import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function seedDemoDataForPatient(patientId: string): Promise<void> {
  const now = new Date();

  const day = (offset: number, hour: number, minute = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    d.setHours(hour, minute, 0, 0);
    return Timestamp.fromDate(d);
  };

  for (const a of [
    {
      appointmentType: "blood_test",
      title: "ตรวจเลือด (CBC)",
      scheduledAt: day(1, 8, 0),
      location: "ห้องเจาะเลือด ชั้น 1",
      department: "Lab",
      preparation: "งดอาหาร 8 ชั่วโมง",
    },
    {
      appointmentType: "doctor",
      title: "พบแพทย์ ออนโคโลยี",
      scheduledAt: day(2, 9, 30),
      location: "คลินิกมะเร็ง ชั้น 2",
      department: "OPD",
      preparation: "นำผลเลือดมาด้วย",
    },
    {
      appointmentType: "chemo",
      title: "เคมีบำบัด รอบที่ 3",
      scheduledAt: day(4, 9, 0),
      location: "หน่วยเคมีบำบัด ชั้น 3",
      department: "Chemo",
      preparation: "ใช้เวลาประมาณ 3–4 ชม.",
    },
  ]) {
    await addDoc(collection(db, "appointments"), {
      patientId,
      status: "scheduled",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...a,
    });
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

  await addDoc(collection(db, "medications"), {
    patientId,
    name: "Dexamethasone",
    dosage: "4 mg",
    instructions: "หลังเคมี ตามแพทย์สั่ง",
    isActive: true,
    reminderTimes: ["08:00", "20:00"],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(db, "documents"), {
    patientId,
    docType: "cert",
    title: "ใบรับรองแพทย์ (ตัวอย่าง)",
    issuedAt: new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10),
    createdAt: serverTimestamp(),
  });

  await addDoc(collection(db, "documents"), {
    patientId,
    docType: "referral",
    title: "ใบส่งตัว (ตัวอย่าง)",
    issuedAt: new Date(now.getTime() - 60 * 86400000).toISOString().slice(0, 10),
    createdAt: serverTimestamp(),
  });

  await addDoc(collection(db, "notifications"), {
    userId: patientId,
    title: "นัดหมายพรุ่งนี้",
    body: "ตรวจเลือด 08:00 น. · งดอาหาร 8 ชั่วโมง",
    link: "/appointments",
    channel: "in_app",
    status: "sent",
    createdAt: serverTimestamp(),
  });

  await addDoc(collection(db, "notifications"), {
    userId: patientId,
    title: "ผลตรวจพร้อมแล้ว",
    body: "CBC · กดดูที่เมนูผลตรวจ",
    link: "/results",
    channel: "in_app",
    status: "sent",
    createdAt: serverTimestamp(),
  });

  const conv = await addDoc(collection(db, "conversations"), {
    patientId,
    subject: "สอบถามอาการหลังเคมี",
    status: "open",
    participantIds: [patientId],
    lastMessageAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });

  await addDoc(collection(db, "conversations", conv.id, "messages"), {
    senderId: patientId,
    body: "หลังได้เคมีรอบที่ 2 มีอาการคลื่นไส้เล็กน้อย ควรกินยาเมาตอนไหนครับ",
    createdAt: serverTimestamp(),
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

  for (const s of [
    { sortOrder: 1, title: "วินิจฉัย", status: "done" },
    { sortOrder: 2, title: "วางแผน", status: "done" },
    { sortOrder: 3, title: "เคมีบำบัด", status: "active", meta: { cycle: "3/6" } },
    { sortOrder: 4, title: "ประเมินผล", status: "todo" },
    { sortOrder: 5, title: "ติดตาม", status: "todo" },
  ]) {
    await addDoc(collection(db, "journeys", journeyRef.id, "steps"), {
      ...s,
      createdAt: serverTimestamp(),
    });
  }
}
