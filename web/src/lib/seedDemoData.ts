import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

async function clearPatientCollection(name: string, field: string, uid: string) {
  const snap = await getDocs(query(collection(db, name), where(field, "==", uid)));
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs.slice(0, 40).forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

export async function seedDemoDataForPatient(patientId: string): Promise<void> {
  await clearPatientCollection("appointments", "patientId", patientId);
  await clearPatientCollection("medicalResults", "patientId", patientId);
  await clearPatientCollection("medications", "patientId", patientId);
  await clearPatientCollection("documents", "patientId", patientId);
  await clearPatientCollection("notifications", "userId", patientId);
  await clearPatientCollection("conversations", "patientId", patientId);
  await clearPatientCollection("journeys", "patientId", patientId);
  await clearPatientCollection("treatmentCycles", "patientId", patientId);
  await clearPatientCollection("referrals", "patientId", patientId);

  const now = new Date();
  const day = (offset: number, hour: number, minute = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    d.setHours(hour, minute, 0, 0);
    return Timestamp.fromDate(d);
  };

  for (const a of [
    { appointmentType: "blood_test", title: "ตรวจเลือด (CBC)", scheduledAt: day(1, 8, 0), location: "ห้องเจาะเลือด ชั้น 1", department: "Lab", preparation: "งดอาหาร 8 ชั่วโมง" },
    { appointmentType: "doctor", title: "พบแพทย์ ออนโคโลยี", scheduledAt: day(2, 9, 30), location: "คลินิกมะเร็ง ชั้น 2", department: "OPD", preparation: "นำผลเลือดมาด้วย" },
    { appointmentType: "chemo", title: "เคมีบำบัด รอบที่ 3", scheduledAt: day(4, 9, 0), location: "หน่วยเคมีบำบัด ชั้น 3", department: "Chemo", preparation: "ใช้เวลาประมาณ 3–4 ชม." },
  ]) {
    await addDoc(collection(db, "appointments"), {
      patientId, status: "scheduled", createdAt: serverTimestamp(), updatedAt: serverTimestamp(), ...a,
    });
  }

  await addDoc(collection(db, "medicalResults"), {
    patientId, resultType: "lab", title: "CBC",
    resultDate: new Date(now.getTime() - 3 * 86400000).toISOString().slice(0, 10),
    summary: "ผลอยู่ในเกณฑ์ปกติ", status: "final", isAbnormal: false,
    values: { wbc: 6.2, hb: 12.4, plt: 210 }, createdAt: serverTimestamp(),
  });
  await addDoc(collection(db, "medicalResults"), {
    patientId, resultType: "imaging", title: "CT ช่องอก",
    resultDate: new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10),
    summary: "มีรายงานแพทย์แล้ว", status: "final", isAbnormal: false, createdAt: serverTimestamp(),
  });

  for (const m of [
    { name: "Ondansetron", dosage: "8 mg", instructions: "กินก่อนเคมีบำบัด 1 ชั่วโมง", reminderTimes: ["07:00"] },
    { name: "Dexamethasone", dosage: "4 mg", instructions: "หลังเคมี ตามแพทย์สั่ง", reminderTimes: ["08:00", "20:00"] },
  ]) {
    await addDoc(collection(db, "medications"), {
      patientId, isActive: true, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), ...m,
    });
  }

  await addDoc(collection(db, "documents"), {
    patientId, docType: "cert", title: "ใบรับรองแพทย์ (ตัวอย่าง)",
    issuedAt: new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10), createdAt: serverTimestamp(),
  });
  await addDoc(collection(db, "documents"), {
    patientId, docType: "referral", title: "ใบส่งตัว (ตัวอย่าง)",
    issuedAt: new Date(now.getTime() - 60 * 86400000).toISOString().slice(0, 10), createdAt: serverTimestamp(),
  });

  await addDoc(collection(db, "notifications"), {
    userId: patientId, title: "นัดหมายพรุ่งนี้", body: "ตรวจเลือด 08:00 น. · งดอาหาร 8 ชั่วโมง",
    link: "/appointments", channel: "in_app", status: "sent", createdAt: serverTimestamp(),
  });
  await addDoc(collection(db, "notifications"), {
    userId: patientId, title: "ผลตรวจพร้อมแล้ว", body: "CBC · กดดูที่เมนูผลตรวจ",
    link: "/results", channel: "in_app", status: "sent", createdAt: serverTimestamp(),
  });

  const conv = await addDoc(collection(db, "conversations"), {
    patientId, subject: "สอบถามอาการหลังเคมี", status: "open",
    participantIds: [patientId], lastMessageAt: serverTimestamp(), createdAt: serverTimestamp(),
  });
  await addDoc(collection(db, "conversations", conv.id, "messages"), {
    senderId: patientId,
    body: "หลังได้เคมีรอบที่ 2 มีอาการคลื่นไส้เล็กน้อย ควรกินยาเมาตอนไหนครับ",
    createdAt: serverTimestamp(),
  });

  const journeyRef = await addDoc(collection(db, "journeys"), {
    patientId, diagnosis: "มะเร็งตัวอย่าง (Demo)", stage: "II", protocol: "AC-T", status: "active",
    startedAt: new Date(now.getTime() - 60 * 86400000).toISOString().slice(0, 10),
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
  for (const s of [
    { sortOrder: 1, title: "วินิจฉัย", status: "done" },
    { sortOrder: 2, title: "วางแผน", status: "done" },
    { sortOrder: 3, title: "เคมีบำบัด", status: "active", meta: { cycle: "3/6" } },
    { sortOrder: 4, title: "ประเมินผล", status: "todo" },
    { sortOrder: 5, title: "ติดตาม", status: "todo" },
  ]) {
    await addDoc(collection(db, "journeys", journeyRef.id, "steps"), { ...s, createdAt: serverTimestamp() });
  }

  for (const c of [
    { treatmentType: "chemo", protocol: "AC-T", cycleNumber: 1, totalCycles: 6, status: "done", scheduledAt: day(-40, 9, 0) },
    { treatmentType: "chemo", protocol: "AC-T", cycleNumber: 2, totalCycles: 6, status: "done", scheduledAt: day(-20, 9, 0) },
    { treatmentType: "chemo", protocol: "AC-T", cycleNumber: 3, totalCycles: 6, status: "active", scheduledAt: day(4, 9, 0) },
    { treatmentType: "chemo", protocol: "AC-T", cycleNumber: 4, totalCycles: 6, status: "todo", scheduledAt: day(25, 9, 0) },
  ]) {
    await addDoc(collection(db, "treatmentCycles"), {
      patientId, journeyId: journeyRef.id, createdAt: serverTimestamp(), ...c,
    });
  }

  await addDoc(collection(db, "referrals"), {
    patientId,
    fromHospital: "รพ.สต. ตัวอย่าง",
    toHospital: "โรงพยาบาลศูนย์มะเร็ง จ.อุดรธานี",
    status: "accepted",
    reason: "ส่งต่อเพื่อรักษามะเร็ง",
    referredAt: new Date(now.getTime() - 90 * 86400000).toISOString().slice(0, 10),
    notes: "นำใบส่งตัวและผลตรวจเดิมมาด้วย",
    createdAt: serverTimestamp(),
  });

  for (const a of [
    {
      slug: "chemo-side-effects",
      titleTh: "อาการข้างเคียงหลังเคมีบำบัด",
      titleEn: "Side effects after chemotherapy",
      bodyTh: "อาการคลื่นไส้ อ่อนเพลีย ผมร่วง เป็นเรื่องที่พบบ่อย\n\n• พักผ่อนให้เพียงพอ\n• ดื่มน้ำมาก ๆ\n• ถ้าอาเจียนมากหรือไข้สูง ให้ติดต่อ รพ.ทันที",
      bodyEn: "Nausea, fatigue and hair loss are common.\n\n• Rest well\n• Stay hydrated\n• Call the hospital if severe vomiting or high fever",
      category: "เคมีบำบัด",
      sortOrder: 1,
    },
    {
      slug: "nutrition",
      titleTh: "กินอย่างไรระหว่างรักษา",
      titleEn: "Eating during treatment",
      bodyTh: "เลือกอาหารสุก สะอาด โปรตีนเพียงพอ\nหลีกเลี่ยงของดิบ ของหมักดอง หากเม็ดเลือดขาวต่ำ",
      bodyEn: "Choose cooked clean food with enough protein.\nAvoid raw foods if white blood cells are low.",
      category: "โภชนาการ",
      sortOrder: 2,
    },
    {
      slug: "caregiver-tips",
      titleTh: "คำแนะนำสำหรับผู้ดูแล",
      titleEn: "Tips for caregivers",
      bodyTh: "การอยู่ข้าง ๆ ฟัง และช่วยจดคำถามก่อนพบแพทย์ มีประโยชน์มาก\nดูแลสุขภาพตัวเองด้วย เพื่อจะได้ดูแลผู้ป่วยได้นาน",
      bodyEn: "Being present, listening, and noting questions before visits helps a lot.\nTake care of yourself too.",
      category: "ผู้ดูแล",
      sortOrder: 3,
    },
  ]) {
    await addDoc(collection(db, "educationArticles"), {
      ...a, isPublished: true, cancerTypes: [], createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    });
  }
}
