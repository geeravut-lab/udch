import { useRef, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useI18n } from "../i18n/context";
import { useAuth } from "../hooks/useAuth";
import { useDocuments } from "../hooks/useDocuments";
import { getDocumentDownloadUrl, uploadPatientDocument } from "../lib/documentStorage";

export function DocumentsPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { documents, loading, error } = useDocuments();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function onUpload(file: File) {
    if (!user) return;
    setBusy(true);
    setMsg("");
    try {
      const path = await uploadPatientDocument(user.uid, file);
      await addDoc(collection(db, "documents"), {
        patientId: user.uid,
        docType: "upload",
        title: file.name,
        filePath: path,
        issuedAt: new Date().toISOString().slice(0, 10),
        createdAt: serverTimestamp(),
      });
      setMsg(t.docUploaded);
    } catch (err) {
      setMsg(String(err instanceof Error ? err.message : err));
    } finally {
      setBusy(false);
    }
  }

  async function onDownload(filePath?: string) {
    if (!filePath) return;
    try {
      const url = await getDocumentDownloadUrl(filePath);
      window.open(url, "_blank");
    } catch (err) {
      setMsg(String(err instanceof Error ? err.message : err));
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>📄 {t.docsTitle}</h2>
      </div>

      <div className="card">
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(f);
            e.target.value = "";
          }}
        />
        <button
          className="btn secondary"
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? t.loading : t.docUpload}
        </button>
        {msg ? <p className="muted" style={{ marginTop: 10, fontSize: "0.9rem" }}>{msg}</p> : null}
      </div>

      {loading && <p className="muted">{t.loading}</p>}
      {error && <div className="error-box">{error}</div>}
      {!loading && documents.length === 0 && (
        <div className="empty-state">
          <div className="emoji">📄</div>
          <p>{t.docsEmpty}</p>
        </div>
      )}
      {documents.map((d) => (
        <div className="list-card" key={d.id}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <b>{d.title}</b>
            <small className="muted">{d.issuedAt || d.docType}</small>
          </div>
          <small className="muted">{d.docType}</small>
          {d.filePath ? (
            <button
              type="button"
              className="btn sm secondary"
              style={{ marginTop: 10, width: "auto" }}
              onClick={() => onDownload(d.filePath)}
            >
              {t.docDownload}
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
