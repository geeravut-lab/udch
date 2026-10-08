import { useI18n } from "../i18n/context";
import { useAppointments } from "../hooks/useAppointments";
import { formatThaiDate } from "../lib/converters";

const borderByType: Record<string, string> = {
  blood_test: "var(--sky)",
  doctor: "var(--sun)",
  chemo: "var(--teal)",
  radiation: "var(--lilac)",
  imaging: "var(--mint)",
  follow_up: "var(--coral)",
};

export function AppointmentsPage() {
  const { t } = useI18n();
  const { appointments, loading, error } = useAppointments({ max: 50 });

  return (
    <div className="page">
      <h3 className="pf" style={{ marginBottom: 12 }}>
        📅 {t.apptTitle}
      </h3>

      {loading && <p className="muted">{t.loading}</p>}
      {error && (
        <div className="error-box">
          โหลดนัดหมายไม่สำเร็จ — ตรวจ Firestore rules / index
          <br />
          <small>{error}</small>
        </div>
      )}

      {!loading && !error && appointments.length === 0 && (
        <div className="empty">
          {t.apptEmpty}
          <br />
          <small>ไปหน้า “ของฉัน” → ใส่ข้อมูลตัวอย่าง เพื่อทดลอง</small>
        </div>
      )}

      {appointments.map((a) => (
        <div
          key={a.id}
          className="card"
          style={{
            borderLeft: `8px solid ${borderByType[a.appointmentType] ?? "var(--teal)"}`,
          }}
        >
          <b>{formatThaiDate(a.scheduledAt, true)}</b>
          <div className="pf">{a.title}</div>
          <small className="muted">
            {[a.location, a.department, a.preparation].filter(Boolean).join(" · ")}
          </small>
          <div style={{ marginTop: 6 }}>
            <span
              className="muted"
              style={{
                fontSize: "0.8rem",
                background: "#e6faf8",
                padding: "2px 8px",
                borderRadius: 8,
              }}
            >
              {a.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
