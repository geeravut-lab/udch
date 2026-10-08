import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  doc,
  where,
  limit,
} from "firebase/firestore";
import type { Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { CaregiverLink } from "../types/models";
import { useAuth } from "./useAuth";

function toDate(v: unknown): Date | null {
  if (!v) return null;
  if (typeof v === "object" && v && "toDate" in v) return (v as Timestamp).toDate();
  return null;
}

export function useCaregivers() {
  const { user } = useAuth();
  const [links, setLinks] = useState<CaregiverLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLinks([]);
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, "caregiverLinks"),
      where("patientId", "==", user.uid),
      limit(20),
    );
    return onSnapshot(
      q,
      (snap) => {
        setLinks(
          snap.docs.map((d) => {
            const x = d.data();
            return {
              id: d.id,
              patientId: x.patientId,
              caregiverId: x.caregiverId ?? "",
              caregiverEmail: x.caregiverEmail,
              permission: x.permission ?? "appointments_only",
              status: x.status ?? "pending",
              invitedAt: toDate(x.invitedAt),
              acceptedAt: toDate(x.acceptedAt),
            };
          }),
        );
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, [user]);

  async function invite(email: string, permission: CaregiverLink["permission"]) {
    if (!user) throw new Error("not signed in");
    // Phase 2: เก็บ email ไว้ก่อน — ผูก caregiverId ตอนผู้ดูแลยอมรับ (ภายหลัง)
    await addDoc(collection(db, "caregiverLinks"), {
      patientId: user.uid,
      caregiverId: "", // ว่างจนกว่าจะ accept
      caregiverEmail: email.trim().toLowerCase(),
      permission,
      status: "pending",
      invitedAt: serverTimestamp(),
    });
  }

  async function revoke(linkId: string) {
    await updateDoc(doc(db, "caregiverLinks", linkId), {
      status: "revoked",
      revokedAt: serverTimestamp(),
    });
  }

  async function updatePermission(linkId: string, permission: CaregiverLink["permission"]) {
    await updateDoc(doc(db, "caregiverLinks", linkId), { permission });
  }

  return { links, loading, invite, revoke, updatePermission };
}
