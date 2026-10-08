import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { CaregiverLink } from "../types/models";
import { useAuth } from "./useAuth";

/** ลิงก์ที่ฉันเป็นผู้ดูแล (active) + คำเชิญค้างที่ตรงอีเมล */
export function useCaregiverMode() {
  const { user, profile } = useAuth();
  const [asCaregiver, setAsCaregiver] = useState<CaregiverLink[]>([]);
  const [pendingForMe, setPendingForMe] = useState<CaregiverLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setAsCaregiver([]);
      setPendingForMe([]);
      setLoading(false);
      return;
    }

    const unsubs: Array<() => void> = [];

    const qActive = query(
      collection(db, "caregiverLinks"),
      where("caregiverId", "==", user.uid),
      where("status", "==", "active"),
      limit(20),
    );
    unsubs.push(
      onSnapshot(
        qActive,
        (snap) => {
          setAsCaregiver(
            snap.docs.map((d) => {
              const x = d.data();
              return {
                id: d.id,
                patientId: x.patientId,
                caregiverId: x.caregiverId,
                caregiverEmail: x.caregiverEmail,
                permission: x.permission ?? "appointments_only",
                status: x.status,
              };
            }),
          );
          setLoading(false);
        },
        () => setLoading(false),
      ),
    );

    // หาคำเชิญ pending ที่อีเมลตรง
    const email = (profile?.email || user.email || "").toLowerCase();
    if (email) {
      const qPend = query(
        collection(db, "caregiverLinks"),
        where("caregiverEmail", "==", email),
        where("status", "==", "pending"),
        limit(10),
      );
      unsubs.push(
        onSnapshot(qPend, (snap) => {
          setPendingForMe(
            snap.docs.map((d) => {
              const x = d.data();
              return {
                id: d.id,
                patientId: x.patientId,
                caregiverId: x.caregiverId ?? "",
                caregiverEmail: x.caregiverEmail,
                permission: x.permission ?? "appointments_only",
                status: x.status,
              };
            }),
          );
        }),
      );
    }

    return () => unsubs.forEach((u) => u());
  }, [user, profile?.email]);

  async function acceptInvite(linkId: string) {
    if (!user) return;
    await updateDoc(doc(db, "caregiverLinks", linkId), {
      caregiverId: user.uid,
      status: "active",
      acceptedAt: serverTimestamp(),
    });
  }

  async function declineInvite(linkId: string) {
    await updateDoc(doc(db, "caregiverLinks", linkId), {
      status: "revoked",
      revokedAt: serverTimestamp(),
    });
  }

  /** one-shot: ยอมรับทุกคำเชิญที่ค้างตามอีเมล */
  async function acceptAllPending() {
    if (!user) return;
    const email = (user.email || "").toLowerCase();
    if (!email) return;
    const snap = await getDocs(
      query(
        collection(db, "caregiverLinks"),
        where("caregiverEmail", "==", email),
        where("status", "==", "pending"),
      ),
    );
    for (const d of snap.docs) {
      await updateDoc(d.ref, {
        caregiverId: user.uid,
        status: "active",
        acceptedAt: serverTimestamp(),
      });
    }
  }

  return {
    asCaregiver,
    pendingForMe,
    loading,
    acceptInvite,
    declineInvite,
    acceptAllPending,
  };
}
