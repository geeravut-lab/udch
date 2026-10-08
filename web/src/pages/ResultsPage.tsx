import { useI18n } from "../i18n/context";

export function ResultsPage() {
  const { t } = useI18n();
  return (
    <div className="page">
      <h3 className="pf" style={{ marginBottom: 12 }}>
        🧪 {t.resultsTitle}
      </h3>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <b>CBC</b>
          <small className="muted">10 ต.ค. 2569</small>
        </div>
        <small className="muted">ผลปกติ · กดเพื่อดูรายละเอียด</small>
      </div>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <b>CT ช่องอก</b>
          <small className="muted">2 ก.ย. 2569</small>
        </div>
        <small className="muted">มีรายงานแพทย์แล้ว</small>
      </div>
      <p className="empty" style={{ paddingTop: 8 }}>
        {t.resultsEmpty} (ข้อมูลตัวอย่าง Phase 0)
      </p>
    </div>
  );
}
