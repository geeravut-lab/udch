import { useState } from "react";
import { useI18n } from "../i18n/context";
import { useResults } from "../hooks/useResults";
import type { MedicalResult } from "../types/models";

export function ResultsPage() {
  const { t } = useI18n();
  const { results, loading, error } = useResults();
  const [open, setOpen] = useState<MedicalResult | null>(null);

  return (
    <div className="page">
      <h3 className="pf" style={{ marginBottom: 12 }}>🧪 {t.resultsTitle}</h3>
      {loading && <p className="muted">{t.loading}</p>}
      {error && <div className="error-box">{error}</div>}
      {!loading && !error && results.length === 0 && (
        <div className="empty">{t.resultsEmpty}<br /><small>{t.seedHint}</small></div>
      )}
      {results.map((r) => (
        <button key={r.id} type="button" className="card" style={{ width: "100%", textAlign: "left", cursor: "pointer" }} onClick={() => setOpen(r)}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <b>{r.title}</b>
            <small className="muted">{r.resultDate}</small>
          </div>
          <small className="muted">{r.summary || r.resultType}{r.isAbnormal ? " · ผิดปกติ" : ""}</small>
        </button>
      ))}

      {open && (
        <div className="card" style={{ border: "2px solid var(--teal)" }}>
          <h3>{open.title}</h3>
          <p className="muted">{open.resultDate} · {open.status}</p>
          <p>{open.summary}</p>
          {open.values && (
            <pre style={{ background: "#f0f9ff", padding: 12, borderRadius: 12, overflow: "auto", fontSize: "0.85rem" }}>
              {JSON.stringify(open.values, null, 2)}
            </pre>
          )}
          <button type="button" className="btn sm secondary" style={{ marginTop: 8 }} onClick={() => setOpen(null)}>{t.back}</button>
        </div>
      )}
    </div>
  );
}
