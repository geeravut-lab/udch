import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  limit,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { CancerJourney, JourneyStep } from "../types/models";
import { useAuth } from "./useAuth";

export function useJourney() {
  const { user } = useAuth();
  const [journey, setJourney] = useState<CancerJourney | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setJourney(null);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "journeys"),
      where("patientId", "==", user.uid),
      limit(5),
    );

    let stepsUnsub: (() => void) | undefined;

    const unsub = onSnapshot(
      q,
      (snap) => {
        stepsUnsub?.();
        stepsUnsub = undefined;

        if (snap.empty) {
          setJourney(null);
          setLoading(false);
          return;
        }

        // pick active first, else first doc
        const docs = snap.docs;
        const active =
          docs.find((d) => d.data().status === "active") ?? docs[0];
        const d = active.data();
        const base: CancerJourney = {
          id: active.id,
          patientId: d.patientId,
          diagnosis: d.diagnosis,
          stage: d.stage,
          protocol: d.protocol,
          status: d.status ?? "active",
          startedAt: d.startedAt,
          steps: [],
        };

        stepsUnsub = onSnapshot(
          collection(db, "journeys", active.id, "steps"),
          (stepSnap) => {
            const steps: JourneyStep[] = stepSnap.docs.map((s) => {
              const x = s.data();
              return {
                id: s.id,
                sortOrder: x.sortOrder ?? 0,
                title: x.title ?? "",
                description: x.description,
                status: x.status ?? "todo",
                completedAt: x.completedAt,
                meta: x.meta,
              };
            });
            steps.sort((a, b) => a.sortOrder - b.sortOrder);
            setJourney({ ...base, steps });
            setLoading(false);
          },
          () => {
            setJourney(base);
            setLoading(false);
          },
        );
      },
      () => setLoading(false),
    );

    return () => {
      unsub();
      stepsUnsub?.();
    };
  }, [user]);

  return { journey, loading };
}
