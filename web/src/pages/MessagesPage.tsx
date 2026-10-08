import { useState, type FormEvent } from "react";
import { useI18n } from "../i18n/context";
import { useAuth } from "../hooks/useAuth";
import { useConversationMessages, useConversations } from "../hooks/useMessages";
import { formatThaiDate } from "../lib/converters";

export function MessagesPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { conversations, loading, startConversation } = useConversations();
  const [activeId, setActiveId] = useState<string | null>(null);
  const { messages, send } = useConversationMessages(activeId);
  const [draft, setDraft] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [firstMsg, setFirstMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function onStart(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const id = await startConversation(subject || "ข้อความถึงทีมดูแล", firstMsg);
      setActiveId(id);
      setNewOpen(false);
      setSubject("");
      setFirstMsg("");
    } finally {
      setBusy(false);
    }
  }

  async function onSend(e: FormEvent) {
    e.preventDefault();
    await send(draft);
    setDraft("");
  }

  if (activeId) {
    return (
      <div className="page" style={{ display: "flex", flexDirection: "column", minHeight: "60vh" }}>
        <button type="button" className="btn sm ghost" style={{ width: "auto", marginBottom: 10 }} onClick={() => setActiveId(null)}>
          ← {t.back}
        </button>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {messages.map((m) => {
            const mine = m.senderId === user?.uid;
            return (
              <div
                key={m.id}
                style={{
                  alignSelf: mine ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  background: mine ? "#d9f7f0" : "var(--card)",
                  padding: "10px 12px",
                  borderRadius: 14,
                  boxShadow: "var(--shadow)",
                }}
              >
                <div>{m.body}</div>
                <small className="muted">{formatThaiDate(m.createdAt, true)}</small>
              </div>
            );
          })}
        </div>
        <form onSubmit={onSend} style={{ display: "flex", gap: 8 }}>
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t.msgPlaceholder} style={{ flex: 1 }} />
          <button className="btn sm" type="submit" style={{ width: "auto" }}>{t.msgSend}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 className="pf">💬 {t.messagesTitle}</h3>
        <button type="button" className="btn sm" style={{ width: "auto" }} onClick={() => setNewOpen((v) => !v)}>{t.msgNew}</button>
      </div>
      {newOpen && (
        <form className="card" onSubmit={onStart}>
          <div className="field">
            <label>{t.msgSubject}</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="field">
            <label>{t.msgFirst}</label>
            <input value={firstMsg} onChange={(e) => setFirstMsg(e.target.value)} required />
          </div>
          <button className="btn" type="submit" disabled={busy}>{busy ? t.loading : t.msgSend}</button>
        </form>
      )}
      {loading && <p className="muted">{t.loading}</p>}
      {!loading && conversations.length === 0 && !newOpen && <div className="empty">{t.messagesEmpty}</div>}
      {conversations.map((c) => (
        <button key={c.id} type="button" className="card" style={{ width: "100%", textAlign: "left", cursor: "pointer" }} onClick={() => setActiveId(c.id)}>
          <div className="pf" style={{ fontSize: "1rem" }}>{c.subject || t.messagesTitle}</div>
          <small className="muted">{c.lastMessageAt ? formatThaiDate(c.lastMessageAt, true) : c.status}</small>
        </button>
      ))}
    </div>
  );
}
