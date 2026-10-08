import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { DEFAULT_FLAGS, type FeatureFlags } from "../types/models";

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, "settings", "featureFlags");
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setFlags({ ...DEFAULT_FLAGS, ...(snap.data() as Partial<FeatureFlags>) });
        } else {
          setFlags(DEFAULT_FLAGS);
        }
        setLoading(false);
      },
      () => {
        setFlags(DEFAULT_FLAGS);
        setLoading(false);
      },
    );
    return unsub;
  }, []);

  return { flags, loading };
}
