import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  limit,
} from "firebase/firestore";
import type { Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "./useAuth";

export type EproEntry = {
  id: string;
  patientId: string;
  pain: number;
  nausea: number;
  fatigue: number;
  notes?: string;
  severity: "low" | "medium" | "high";
  createdAt: Date;
};

function severityOf(pain: number, nausea: number, fatigue: number): EproEntry["severity"] {
  const max = Math.max(pain, nausea, fatigue);
  if (max >= 7) return "high";
  if (max >= 4) return "medium";
  return "low";
}

export function useEpro(patientId?: string | null) {
  const { user } = useAuth();
  const pid = patientId ?? user?.uid;
  const [entries, setEntries] = useState<EproEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pid) {
      setEntries([]);
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, "eproEntries"),
      where("patientId", "==", pid),
      limit(40),
    );
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => {
          const x = d.data();
          const createdAt =
            x.createdAt && typeof x.createdAt === "object" && "toDate" in x.createdAt
              ? (x.createdAt as Timestamp).toDate()
              : new Date();
          return {
            id: d.id,
            patientId: x.patientId,
            pain: x.pain ?? 0,
            nausea: x.nausea ?? 0,
            fatigue: x.fatigue ?? 0,
            notes: x.notes,
            severity: x.severity ?? "low",
            createdAt,
          } as EproEntry;
        });
        list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setEntries(list);
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, [pid]);

  async function submit(input: {
    pain: number;
    nausea: number;
    fatigue: number;
    notes?: string;
  }) {
    if (!user) throw new Error("not signed in");
    const severity = severityOf(input.pain, input.nausea, input.fatigue);
    await addDoc(collection(db, "eproEntries"), {
      patientId: user.uid,
      pain: input.pain,
      nausea: input.nausea,
      fatigue: input.fatigue,
      notes: input.notes || "",
      severity,
      createdAt: serverTimestamp(),
    });
    if (severity === "high") {
      await addDoc(collection(db, "notifications"), {
        userId: user.uid,
        title: "บันทึกอาการระดับสูง",
        body: "ทีมดูแลจะได้รับสัญญาณ triage — หากฉุกเฉินโทร รพ.ทันที",
        link: "/epro",
        channel: "in_app",
        status: "sent",
        createdAt: serverTimestamp(),
      });
    }
  }

  return { entries, loading, submit };
}

/** Nurse: รายการ ePRO severity สูงล่าสุด (อ่านทั้งหมดที่ staff เห็นได้ตาม rules) */
export function useEproTriage() {
  const [entries, setEntries] = useState<EproEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "eproEntries"),
      where("severity", "==", "high"),
      limit(30),
    );
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => {
          const x = d.data();
          const createdAt =
            x.createdAt && typeof x.createdAt === "object" && "toDate" in x.createdAt
              ? (x.createdAt as Timestamp).toDate()
              : new Date();
          return {
            id: d.id,
            patientId: x.patientId,
            pain: x.pain ?? 0,
            nausea: x.nausea ?? 0,
            fatigue: x.fatigue ?? 0,
            notes: x.notes,
            severity: x.severity ?? "high",
            createdAt,
          } as EproEntry;
        });
        list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setEntries(list);
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, []);

  return { entries, loading };
}
