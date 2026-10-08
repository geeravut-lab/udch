import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, limit } from "firebase/firestore";
import type { Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { TreatmentCycle } from "../types/models";
import { useAuth } from "./useAuth";

function toDate(v: unknown): Date | null {
  if (!v) return null;
  if (typeof v === "object" && v && "toDate" in v) return (v as Timestamp).toDate();
  if (typeof v === "string" || typeof v === "number") return new Date(v);
  return null;
}

export function useTreatmentCycles() {
  const { user } = useAuth();
  const [cycles, setCycles] = useState<TreatmentCycle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCycles([]);
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, "treatmentCycles"),
      where("patientId", "==", user.uid),
      limit(30),
    );
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => {
          const x = d.data();
          return {
            id: d.id,
            patientId: x.patientId,
            journeyId: x.journeyId,
            treatmentType: x.treatmentType ?? "other",
            protocol: x.protocol,
            cycleNumber: x.cycleNumber,
            totalCycles: x.totalCycles,
            status: x.status ?? "todo",
            scheduledAt: toDate(x.scheduledAt),
            completedAt: toDate(x.completedAt),
            notes: x.notes,
          } as TreatmentCycle;
        });
        list.sort((a, b) => (a.cycleNumber ?? 0) - (b.cycleNumber ?? 0));
        setCycles(list);
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, [user]);

  return { cycles, loading };
}
