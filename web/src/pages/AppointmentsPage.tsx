import { useI18n } from "../i18n/context";
import { useAppointments } from "../hooks/useAppointments";
import { formatThaiDate } from "../lib/converters";
import { appointmentStatusLabel } from "../lib/statusLabels";

const borderByType: Record<string, string> = {
  blood_test: "var(--sky)",
  doctor: "var(--sun)",
  chemo: "var(--teal)",
  radiation: "var(--lilac)",
  imaging: "var(--mint)",
  follow_up: "var(--coral)",
};

export function AppointmentsPage() {
  const { t, lang } = useI18n();
  const { appointments, loading, error } = useAppointments({ max: 50 });

  return (
    <div className="page">
      <div className="page-header">
        <h2>📅 {t.apptTitle}</h2>
      </div>
      {loading && <p className="muted">{t.loading}</p>}
      {error && <div className="error-box">{error}</div>}
      {!loading && !error && appointments.length === 0 && (
        <div className="empty-state">
          <div className="emoji">📅</div>
          <p>{t.apptEmpty}</p>
          <p style={{ fontSize: "0.9rem" }}>{t.seedHint}</p>
        </div>
      )}
      {appointments.map((a) => (
        <div key={a.id} className="list-card" style={{ ["--accent" as string]: borderByType[a.appointmentType] ?? "var(--teal)" }}>
          <b>{formatThaiDate(a.scheduledAt, true)}</b>
          <div className="pf" style={{ marginTop: 4 }}>{a.title}</div>
          <small className="muted">{[a.location, a.department, a.preparation].filter(Boolean).join(" · ")}</small>
          <div style={{ marginTop: 8 }}>
            <span className={`chip status-${a.status}`}>{appointmentStatusLabel(a.status, lang)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
