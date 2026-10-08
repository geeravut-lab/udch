import { useI18n } from "../i18n/context";
import { useResults } from "../hooks/useResults";

export function ResultsPage() {
  const { t } = useI18n();
  const { results, loading, error } = useResults();

  return (
    <div className="page">
      <h3 className="pf" style={{ marginBottom: 12 }}>
        🧪 {t.resultsTitle}
      </h3>

      {loading && <p className="muted">{t.loading}</p>}
      {error && (
        <div className="error-box">
          โหลดผลตรวจไม่สำเร็จ
          <br />
          <small>{error}</small>
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <div className="empty">
          {t.resultsEmpty}
          <br />
          <small>ไปหน้า “ของฉัน” → ใส่ข้อมูลตัวอย่าง เพื่อทดลอง</small>
        </div>
      )}

      {results.map((r) => (
        <div className="card" key={r.id}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <b>{r.title}</b>
            <small className="muted">{r.resultDate}</small>
          </div>
          <small className="muted">
            {r.summary || r.resultType}
            {r.isAbnormal ? " · มีค่าผิดปกติ" : ""}
          </small>
        </div>
      ))}
    </div>
  );
}
