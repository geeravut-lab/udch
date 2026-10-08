import { useEffect, useState, type FormEvent } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  limit,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import { useI18n } from "../i18n/context";

type Session = {
  id: string;
  title: string;
  status: string;
  scheduledAt?: string;
  meetUrl?: string;
};

export function TelemedPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [rows, setRows] = useState<Session[]>([]);
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "teleSessions"),
      where("patientId", "==", user.uid),
      limit(20),
    );
    return onSnapshot(q, (snap) => {
      setRows(
        snap.docs.map((d) => {
          const x = d.data();
          return {
            id: d.id,
            title: x.title ?? "Telemedicine",
            status: x.status ?? "requested",
            scheduledAt: x.scheduledAt,
            meetUrl: x.meetUrl,
          };
        }),
      );
    });
  }, [user]);

  async function onRequest(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      await addDoc(collection(db, "teleSessions"), {
        patientId: user.uid,
        title: title || t.teleDefaultTitle,
        scheduledAt: when || null,
        status: "requested",
        meetUrl: null,
        createdAt: serverTimestamp(),
      });
      setTitle("");
      setWhen("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>📹 {t.teleTitle}</h2>
      </div>
      <p className="muted" style={{ marginBottom: 12, fontSize: "0.92rem" }}>{t.teleDesc}</p>

      <form className="card" onSubmit={onRequest}>
        <div className="field">
          <label>{t.teleTopic}</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.teleDefaultTitle} />
        </div>
        <div className="field">
          <label>{t.teleWhen}</label>
          <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
        </div>
        <button className="btn" type="submit" disabled={busy}>
          {busy ? t.loading : t.teleRequest}
        </button>
      </form>

      {rows.map((r) => (
        <div key={r.id} className="list-card">
          <b>{r.title}</b>
          <div className="muted" style={{ fontSize: "0.9rem", marginTop: 4 }}>
            {r.scheduledAt || "—"} · {r.status}
          </div>
          {r.meetUrl ? (
            <a className="btn sm" href={r.meetUrl} target="_blank" rel="noreferrer" style={{ marginTop: 10, width: "auto" }}>
              {t.teleJoin}
            </a>
          ) : (
            <span className="chip" style={{ marginTop: 8 }}>{t.teleWaiting}</span>
          )}
        </div>
      ))}
    </div>
  );
}
