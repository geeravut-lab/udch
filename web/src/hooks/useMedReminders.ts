import { useEffect } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useMedications } from "./useMedications";
import { useAuth } from "./useAuth";

/**
 * ตรวจเวลา reminder ของยาทุกนาที
 * - ขอสิทธิ์ Notification ของเบราว์เซอร์
 * - สร้าง in-app notification เมื่อถึงเวลา (ช่วงนาทีเดียวกัน)
 */
export function useMedReminders(enabled = true) {
  const { user } = useAuth();
  const { medications } = useMedications(true);

  useEffect(() => {
    if (!enabled || !user || medications.length === 0) return;

    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }

    const fired = new Set<string>();

    const tick = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const key = `${hh}:${mm}`;

      for (const med of medications) {
        if (!med.reminderTimes?.includes(key)) continue;
        const stamp = `${med.id}-${key}-${now.toDateString()}`;
        if (fired.has(stamp)) continue;
        fired.add(stamp);

        const title = `ถึงเวลากินยา: ${med.name}`;
        const body = [med.dosage, med.instructions].filter(Boolean).join(" · ");

        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          try {
            new Notification(title, { body, tag: stamp });
          } catch {
            /* ignore */
          }
        }

        addDoc(collection(db, "notifications"), {
          userId: user.uid,
          title,
          body,
          link: "/medications",
          channel: "in_app",
          status: "sent",
          createdAt: serverTimestamp(),
        }).catch(() => {});
      }
    };

    tick();
    const id = window.setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [enabled, user, medications]);
}
