import { Link } from "react-router-dom";
import { useI18n } from "../i18n/context";
import { useAppointments } from "../hooks/useAppointments";
import { useNotifications } from "../hooks/useNotifications";
import { useHospitalInfo } from "../hooks/useHospitalInfo";
import { dayMonthParts, formatThaiDate } from "../lib/converters";

const JOURNEY = [
  { n: 1, label: "วินิจฉัย", status: "done" as const },
  { n: 2, label: "วางแผน", status: "done" as const },
  { n: 3, label: "เคมีบำบัด", status: "active" as const },
  { n: 4, label: "ประเมินผล", status: "todo" as const },
  { n: 5, label: "ติดตาม", status: "todo" as const },
];

export function HomePage() {
  const { t } = useI18n();
  const { appointments, loading } = useAppointments({ upcomingOnly: true, max: 8 });
  const { unread } = useNotifications();
  const hospital = useHospitalInfo();
  const next = appointments[0];
  const rest = appointments.slice(1, 3);

  return (
    <div className="page">
      {loading ? (
        <div className="card"><p className="muted">{t.loading}</p></div>
      ) : next ? (
        <div className="hero-next">
          <div className="label">{t.nextAppt}</div>
          <div className="title">{next.title}</div>
          <div className="meta">
            {formatThaiDate(next.scheduledAt, true)}
            {next.location ? ` · ${next.location}` : ""}
            {next.preparation ? <><br />⚠️ {next.preparation}</> : null}
          </div>
          <div className="actions">
            <Link to="/appointments" className="btn">{t.viewAllAppt}</Link>
            <a className="btn ghost-light" href={`tel:${hospital.phone}`}>{t.callHospital}</a>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="empty-state" style={{ padding: "20px 8px" }}>
            <div className="emoji">📅</div>
            <p>{t.noUpcoming}</p>
            <Link to="/me" className="btn secondary" style={{ width: "auto", margin: "0 auto" }}>{t.demoBtn}</Link>
          </div>
        </div>
      )}

      <div className="card">
        <h3>🛤️ {t.dashJourney}</h3>
        <div className="journey">
          {JOURNEY.map((s) => (
            <div key={s.n} className={`st ${s.status}`}>
              <i>{s.n}</i>{s.label}
            </div>
          ))}
        </div>
      </div>

      {rest.length > 0 && (
        <>
          <div className="section-label">{t.upcomingMore}</div>
          {rest.map((a) => {
            const { day, month } = dayMonthParts(a.scheduledAt);
            return (
              <div className="act card" key={a.id} style={{ marginBottom: 8 }}>
                <div className="dt">{day}<br />{month}</div>
                <div>
                  <b>{a.title}</b><br />
                  <small className="muted">{formatThaiDate(a.scheduledAt, true)}</small>
                </div>
              </div>
            );
          })}
        </>
      )}

      <div className="section-label">{t.quickLinks}</div>
      <div className="grid2">
        <Link to="/results" className="tile" style={{ ["--c" as string]: "var(--mint)" }}>
          <span>🧪</span>{t.navResults}<small>{t.resultsTitle}</small>
        </Link>
        <Link to="/medications" className="tile" style={{ ["--c" as string]: "var(--coral)" }}>
          <span>💊</span>{t.dashMeds}<small>{t.medsTitle}</small>
        </Link>
        <Link to="/messages" className="tile" style={{ ["--c" as string]: "var(--lilac)" }}>
          <span>💬</span>{t.navMessages}
          <small>{unread > 0 ? t.unreadCount.replace("{n}", String(unread)) : t.messagesTitle}</small>
        </Link>
        <Link to="/notifications" className="tile" style={{ ["--c" as string]: "var(--sky)" }}>
          <span>🔔</span>{t.notifTitle}
          <small>{unread > 0 ? t.unreadCount.replace("{n}", String(unread)) : "—"}</small>
        </Link>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h3>🏥 {hospital.nameTh}</h3>
        <p className="muted" style={{ fontSize: "0.9rem" }}>
          {hospital.hours}<br />
          {hospital.phone}{hospital.mobile ? ` · ${hospital.mobile}` : ""}
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <a className="btn sm" href={`tel:${hospital.phone}`} style={{ flex: 1 }}>📞 {t.callHospital}</a>
          <Link to="/documents" className="btn sm secondary" style={{ flex: 1 }}>📄 {t.docsTitle}</Link>
        </div>
      </div>

      <a className="sos" href={`tel:${hospital.phone}`}>🆘 {t.dashSos}</a>
    </div>
  );
}
