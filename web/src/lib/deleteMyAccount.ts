import {
  collection,
  getDocs,
  query,
  where,
  writeBatch,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { db, auth } from "./firebase";

async function deleteByField(col: string, field: string, uid: string) {
  const snap = await getDocs(query(collection(db, col), where(field, "==", uid)));
  const docs = snap.docs;
  for (let i = 0; i < docs.length; i += 400) {
    const batch = writeBatch(db);
    docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

/** PDPA: ลบข้อมูลผู้ใช้ใน Firestore แล้วลบ Firebase Auth account */
export async function deleteMyAccount(uid: string): Promise<void> {
  await deleteByField("appointments", "patientId", uid);
  await deleteByField("medicalResults", "patientId", uid);
  await deleteByField("medications", "patientId", uid);
  await deleteByField("documents", "patientId", uid);
  await deleteByField("notifications", "userId", uid);
  await deleteByField("conversations", "patientId", uid);
  await deleteByField("journeys", "patientId", uid);
  await deleteByField("treatmentCycles", "patientId", uid);
  await deleteByField("referrals", "patientId", uid);
  await deleteByField("payments", "patientId", uid);
  await deleteByField("caregiverLinks", "patientId", uid);
  await deleteByField("caregiverLinks", "caregiverId", uid);
  await deleteByField("eproEntries", "patientId", uid);
  await deleteByField("teleSessions", "patientId", uid);

  try {
    await deleteDoc(doc(db, "users", uid));
  } catch {
    /* ignore */
  }

  const user = auth.currentUser;
  if (user && user.uid === uid) {
    await deleteUser(user);
  }
}
