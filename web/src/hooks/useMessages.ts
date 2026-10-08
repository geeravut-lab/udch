import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  limit,
  addDoc,
  serverTimestamp,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { conversationFromDoc, messageFromDoc } from "../lib/converters";
import type { ChatMessage, Conversation } from "../types/models";
import { useAuth } from "./useAuth";

export function useConversations() {
  const { user } = useAuth();
  const [items, setItems] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, "conversations"),
      where("patientId", "==", user.uid),
      limit(20),
    );
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map(conversationFromDoc);
        list.sort(
          (a, b) =>
            (b.lastMessageAt?.getTime() ?? 0) - (a.lastMessageAt?.getTime() ?? 0),
        );
        setItems(list);
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, [user]);

  async function startConversation(subject: string, firstMessage: string) {
    if (!user) throw new Error("not signed in");
    const ref = await addDoc(collection(db, "conversations"), {
      patientId: user.uid,
      subject,
      status: "open",
      participantIds: [user.uid],
      lastMessageAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
    await addDoc(collection(db, "conversations", ref.id, "messages"), {
      senderId: user.uid,
      body: firstMessage,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  }

  return { conversations: items, loading, startConversation };
}

export function useConversationMessages(conversationId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!conversationId || !user) {
      setMessages([]);
      return;
    }
    setLoading(true);
    // messages subcollection — orderBy createdAt needs single-field index (auto)
    const q = query(
      collection(db, "conversations", conversationId, "messages"),
      orderBy("createdAt", "asc"),
      limit(100),
    );
    return onSnapshot(
      q,
      (snap) => {
        setMessages(snap.docs.map(messageFromDoc));
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, [conversationId, user]);

  async function send(body: string) {
    if (!user || !conversationId || !body.trim()) return;
    await addDoc(collection(db, "conversations", conversationId, "messages"), {
      senderId: user.uid,
      body: body.trim(),
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, "conversations", conversationId), {
      lastMessageAt: serverTimestamp(),
    });
  }

  return { messages, loading, send };
}
