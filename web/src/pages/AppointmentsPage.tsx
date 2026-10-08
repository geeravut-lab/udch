import { useI18n } from "../i18n/context";

export function AppointmentsPage() {
  const { t } = useI18n();
  return (
    <div className="page">
      <h3 className="pf" style={{ marginBottom: 12 }}>
        📅 {t.apptTitle}
      </h3>
      <div className="card" style={{ borderLeft: "8px solid var(--sky)" }}>
        <b>จ. 12 ต.ค. · 08:00</b>
        <div className="pf">ตรวจเลือด (CBC)</div>
        <small className="muted">ห้องเจาะเลือด ชั้น 1</small>
      </div>
      <div className="card" style={{ borderLeft: "8px solid var(--sun)" }}>
        <b>อ. 13 ต.ค. · 09:30</b>
        <div className="pf">พบแพทย์ ออนโคโลยี</div>
        <small className="muted">คลินิกมะเร็ง ชั้น 2 · นำผลเลือดมาด้วย</small>
      </div>
      <div className="card" style={{ borderLeft: "8px solid var(--teal)" }}>
        <b>พ. 15 ต.ค. · 09:00</b>
        <div className="pf">เคมีบำบัด รอบที่ 3</div>
        <small className="muted">หน่วยเคมีบำบัด ชั้น 3</small>
      </div>
    </div>
  );
}
