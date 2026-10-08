import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { medicationFromDoc } from "../lib/converters";
import type { Medication } from "../types/models";
import { useAuth } from "./useAuth";

export function useMedications(activeOnly = true) {
  const { user } = useAuth();
  const [items, setItems] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(
      collection(db, "medications"),
      where("patientId", "==", user.uid),
      limit(50),
    );
    return onSnapshot(
      q,
      (snap) => {
        let list = snap.docs.map(medicationFromDoc);
        if (activeOnly) list = list.filter((m) => m.isActive);
        setItems(list);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
  }, [user, activeOnly]);

  return { medications: items, loading, error };
}
