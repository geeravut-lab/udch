import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { resultFromDoc } from "../lib/converters";
import type { MedicalResult } from "../types/models";
import { useAuth } from "./useAuth";

/**
 * ดึงผลตรวจ — where(patientId) อย่างเดียว เรียงฝั่ง client
 * ไม่ต้องรอ composite index
 */
export function useResults(max = 30) {
  const { user } = useAuth();
  const [items, setItems] = useState<MedicalResult[]>([]);
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
      collection(db, "medicalResults"),
      where("patientId", "==", user.uid),
      limit(max),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map(resultFromDoc);
        list.sort((a, b) => (a.resultDate < b.resultDate ? 1 : a.resultDate > b.resultDate ? -1 : 0));
        setItems(list);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("[useResults]", err);
        setError(err.message);
        setLoading(false);
      },
    );

    return unsub;
  }, [user, max]);

  return { results: items, loading, error };
}
