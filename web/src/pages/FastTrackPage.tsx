import { useI18n } from "../i18n/context";
import { useResults } from "../hooks/useResults";
import { useAppointments } from "../hooks/useAppointments";

export function FastTrackPage() {
  const { t } = useI18n();
  const { results, loading: lr } = useResults();
  const { appointments, loading: la } = useAppointments({ upcomingOnly: true, max: 10 });

  const labs = results.filter((r) => r.resultType === "lab");
  const labAppts = appointments.filter((a) => a.appointmentType === "blood_test" || a.appointmentType === "lab");

  return (
    <div className="page">
      <div className="page-header">
        <h2>⚡ {t.fastTitle}</h2>
      </div>
      <p className="muted" style={{ marginBottom: 12 }}>{t.fastDesc}</p>

      <div className="card">
        <h3>{t.fastLabAppt}</h3>
        {(la || lr) && <p className="muted">{t.loading}</p>}
        {!la && labAppts.length === 0 && <p className="muted">{t.fastNoLabAppt}</p>}
        {labAppts.map((a) => (
          <div key={a.id} style={{ marginBottom: 8 }}>
            <b>{a.title}</b>
            <div className="muted" style={{ fontSize: "0.85rem" }}>{a.preparation || a.location}</div>
          </div>
        ))}
      </div>

      <div className="section-label">{t.fastLabResults}</div>
      {labs.length === 0 && !lr && <p className="muted">{t.resultsEmpty}</p>}
      {labs.map((r) => (
        <div key={r.id} className="list-card">
          <b>{r.title}</b>
          <div className="muted" style={{ fontSize: "0.9rem" }}>
            {r.resultDate} · {r.summary || r.status}
          </div>
          <span className={`chip ${r.status === "final" ? "status-completed" : "warn"}`} style={{ marginTop: 8 }}>
            {r.status === "final" ? t.fastReady : t.fastPending}
          </span>
        </div>
      ))}
    </div>
  );
}
