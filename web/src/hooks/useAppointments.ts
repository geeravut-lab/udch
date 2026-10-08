import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  limit,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { appointmentFromDoc } from "../lib/converters";
import type { Appointment } from "../types/models";
import { useAuth } from "./useAuth";

/**
 * ดึงนัดหมายของผู้ป่วย
 * ใช้ where(patientId) อย่างเดียว แล้วเรียงฝั่ง client
 * เพื่อไม่บังคับ composite index ตอนเริ่มต้น
 * (production scale ใหญ่ค่อยใช้ orderBy + index)
 */
export function useAppointments(options?: { upcomingOnly?: boolean; max?: number }) {
  const { user } = useAuth();
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, "appointments"),
      where("patientId", "==", user.uid),
      limit(options?.max ?? 50),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        let list = snap.docs.map(appointmentFromDoc);
        list.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());

        if (options?.upcomingOnly) {
          const now = new Date();
          list = list.filter(
            (a) =>
              a.scheduledAt >= now &&
              a.status !== "cancelled" &&
              a.status !== "completed",
          );
        }

        setItems(list);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("[useAppointments]", err);
        setError(err.message);
        setLoading(false);
      },
    );

    return unsub;
  }, [user, options?.upcomingOnly, options?.max]);

  return { appointments: items, loading, error };
}
