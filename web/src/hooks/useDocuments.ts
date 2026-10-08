import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { documentFromDoc } from "../lib/converters";
import type { AppDocument } from "../types/models";
import { useAuth } from "./useAuth";

export function useDocuments() {
  const { user } = useAuth();
  const [items, setItems] = useState<AppDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, "documents"),
      where("patientId", "==", user.uid),
      limit(50),
    );
    return onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map(documentFromDoc));
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
  }, [user]);

  return { documents: items, loading, error };
}
