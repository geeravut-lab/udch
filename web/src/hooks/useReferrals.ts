import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Referral } from "../types/models";
import { useAuth } from "./useAuth";

export function useReferrals() {
  const { user } = useAuth();
  const [items, setItems] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, "referrals"),
      where("patientId", "==", user.uid),
      limit(20),
    );
    return onSnapshot(
      q,
      (snap) => {
        setItems(
          snap.docs.map((d) => {
            const x = d.data();
            return {
              id: d.id,
              patientId: x.patientId,
              fromHospital: x.fromHospital,
              toHospital: x.toHospital,
              status: x.status ?? "pending",
              reason: x.reason,
              referredAt: x.referredAt,
              notes: x.notes,
            };
          }),
        );
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, [user]);

  return { referrals: items, loading };
}
