import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

/** PDPA: รวมข้อมูลของผู้ใช้แล้วดาวน์โหลดเป็น JSON */
export async function exportMyData(uid: string, profile: Record<string, unknown>) {
  async function col(name: string, field = "patientId") {
    const snap = await getDocs(query(collection(db, name), where(field, "==", uid)));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  const data = {
    exportedAt: new Date().toISOString(),
    profile,
    appointments: await col("appointments"),
    medicalResults: await col("medicalResults"),
    medications: await col("medications"),
    documents: await col("documents"),
    conversations: await col("conversations"),
    notifications: await col("notifications", "userId"),
    journeys: await col("journeys"),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `udch-my-data-${uid.slice(0, 8)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
