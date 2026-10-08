import { useI18n } from "../i18n/context";
import { useDocuments } from "../hooks/useDocuments";

export function DocumentsPage() {
  const { t } = useI18n();
  const { documents, loading, error } = useDocuments();

  return (
    <div className="page">
      <h3 className="pf" style={{ marginBottom: 12 }}>
        📄 {t.docsTitle}
      </h3>
      {loading && <p className="muted">{t.loading}</p>}
      {error && <div className="error-box">{error}</div>}
      {!loading && documents.length === 0 && (
        <div className="empty">
          {t.docsEmpty}
          <br />
          <small>{t.seedHint}</small>
        </div>
      )}
      {documents.map((d) => (
        <div className="card" key={d.id}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <b>{d.title}</b>
            <small className="muted">{d.issuedAt || d.docType}</small>
          </div>
          <small className="muted">{d.docType}</small>
        </div>
      ))}
    </div>
  );
}
