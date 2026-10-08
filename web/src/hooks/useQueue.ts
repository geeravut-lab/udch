import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { rtdb } from "../lib/firebase";
import type { QueueMeta, QueueTicket } from "../types/models";
import { useAuth } from "./useAuth";

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** คิวสดจาก Realtime Database: /queue/{date}/{servicePoint}/{ticketId} */
export function useQueue(servicePoint = "opd") {
  const { user } = useAuth();
  const [myTicket, setMyTicket] = useState<QueueTicket | null>(null);
  const [meta, setMeta] = useState<QueueMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setMyTicket(null);
      setMeta(null);
      setLoading(false);
      return;
    }

    const date = todayKey();
    const queueRef = ref(rtdb, `queue/${date}/${servicePoint}`);
    const metaRef = ref(rtdb, `queueMeta/${date}/${servicePoint}`);

    const unsubQ = onValue(
      queueRef,
      (snap) => {
        const val = snap.val() as Record<string, Omit<QueueTicket, "ticketId">> | null;
        if (!val) {
          setMyTicket(null);
        } else {
          const mine = Object.entries(val).find(([, t]) => t.patientId === user.uid);
          if (mine) {
            setMyTicket({ ticketId: mine[0], ...mine[1] });
          } else {
            setMyTicket(null);
          }
        }
        setLoading(false);
      },
      () => setLoading(false),
    );

    const unsubM = onValue(metaRef, (snap) => {
      const v = snap.val() as QueueMeta | null;
      setMeta(v);
    });

    return () => {
      unsubQ();
      unsubM();
    };
  }, [user, servicePoint]);

  const waitInfo =
    myTicket && meta
      ? {
          ahead: Math.max(0, myTicket.queueNumber - (meta.nowServing || 0)),
          nowServing: meta.nowServing,
          myNumber: myTicket.queueNumber,
          status: myTicket.status,
          estimatedWaitMinutes: myTicket.estimatedWaitMinutes,
        }
      : null;

  return { myTicket, meta, waitInfo, loading, servicePoint, dateKey: todayKey() };
}
