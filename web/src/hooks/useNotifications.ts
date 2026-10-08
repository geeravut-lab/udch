import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  limit,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { notificationFromDoc } from "../lib/converters";
import type { AppNotification } from "../types/models";
import { useAuth } from "./useAuth";

export function useNotifications() {
  const { user } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      limit(40),
    );
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map(notificationFromDoc);
        list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setItems(list);
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, [user]);

  async function markRead(id: string) {
    await updateDoc(doc(db, "notifications", id), {
      status: "read",
      readAt: serverTimestamp(),
    });
  }

  const unread = items.filter((n) => n.status !== "read").length;

  return { notifications: items, loading, unread, markRead };
}
