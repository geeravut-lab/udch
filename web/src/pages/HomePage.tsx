import { Link } from "react-router-dom";
import { useI18n } from "../i18n/context";
import { useAppointments } from "../hooks/useAppointments";
import { useNotifications } from "../hooks/useNotifications";
import { useHospitalInfo } from "../hooks/useHospitalInfo";
import { useJourney } from "../hooks/useJourney";
import { useQueue } from "../hooks/useQueue";
import { dayMonthParts, formatThaiDate } from "../lib/converters";

export function HomePage() {
  const { t } = useI18n();
  const { appointments, loading } = useAppointments({ upcomingOnly: true, max: 8 });
  const { unread } = useNotifications();
  const hospital = useHospitalInfo();
  const { journey } = useJourney();
  const { waitInfo } = useQueue("opd");
  const next = appointments[0];
  const rest = appointments.slice(1, 3);
  const steps = journey?.steps?.length
    ? journey.steps
    : [
        { id: "1", sortOrder: 1, title: "วินิจฉัย", status: "done" as const },
        { id: "2", sortOrder: 2, title: "วางแผน", status: "done" as const },
        { id: "3", sortOrder: 3, title: "เคมีบำบัด", status: "active" as const },
        { id: "4", sortOrder: 4, title: "ประเมินผล", status: "todo" as const },
        { id: "5", sortOrder: 5, title: "ติดตาม", status: "todo" as const },
      ];

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
            <Link to="/queue" className="btn ghost-light">{t.queueTitle}</Link>
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

      {waitInfo && (
        <div className="card" style={{ background: "linear-gradient(135deg,#D9F7F0,#DCEEFF)" }}>
          <h3>🎫 {t.queueTitle}</h3>
          <div className="pf" style={{ fontSize: "1.15rem" }}>
            {t.queueNumber} {waitInfo.myNumber}
            {waitInfo.ahead > 0
              ? ` · ${t.queueAhead.replace("{n}", String(waitInfo.ahead))}`
              : ` · ${t.queueYourTurn}`}
          </div>
          <Link to="/queue" className="btn sm secondary" style={{ marginTop: 10, width: "auto" }}>{t.viewQueue}</Link>
        </div>
      )}

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>🛤️ {t.dashJourney}</h3>
          <Link to="/journey" className="btn sm secondary" style={{ width: "auto" }}>{t.viewAll}</Link>
        </div>
        {journey?.diagnosis && (
          <p className="muted" style={{ fontSize: "0.9rem", marginBottom: 8 }}>
            {journey.diagnosis}
            {journey.protocol ? ` · ${journey.protocol}` : ""}
          </p>
        )}
        <div className="journey">
          {steps.map((s, i) => (
            <div key={s.id || i} className={`st ${s.status}`}>
              <i>{i + 1}</i>
              {s.title}
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
        <Link to="/education" className="tile" style={{ ["--c" as string]: "var(--sun)" }}>
          <span>📚</span>{t.eduTitle}<small>{t.eduShort}</small>
        </Link>
        <Link to="/caregivers" className="tile" style={{ ["--c" as string]: "var(--lilac)" }}>
          <span>👨‍👩‍👧</span>{t.caregiverTitle}<small>{t.caregiverShort}</small>
        </Link>
        <Link to="/referrals" className="tile" style={{ ["--c" as string]: "var(--sky)" }}>
          <span>🏥</span>{t.referralTitle}<small>{t.referralShort}</small>
        </Link>
        <Link to="/payments" className="tile" style={{ ["--c" as string]: "var(--teal)" }}>
          <span>💳</span>{t.payTitle}<small>PromptPay</small>
        </Link>
        <Link to="/epro" className="tile" style={{ ["--c" as string]: "var(--coral)" }}>
          <span>📝</span>{t.eproTitle}<small>{t.eproShort}</small>
        </Link>
        <Link to="/telemed" className="tile" style={{ ["--c" as string]: "var(--sky)" }}>
          <span>📹</span>{t.teleTitle}<small>{t.teleShort}</small>
        </Link>
        <Link to="/ai" className="tile" style={{ ["--c" as string]: "var(--lilac)" }}>
          <span>🤖</span>{t.aiTitle}<small>{t.aiShort}</small>
        </Link>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h3>🏥 {hospital.nameTh}</h3>
        <p className="muted" style={{ fontSize: "0.9rem" }}>
          {hospital.hours}<br />
          {hospital.phone}{hospital.mobile ? ` · ${hospital.mobile}` : ""}
        </p>
        <a className="btn sm" href={`tel:${hospital.phone}`} style={{ marginTop: 10, width: "auto" }}>📞 {t.callHospital}</a>
      </div>

      <a className="sos" href={`tel:${hospital.phone}`}>🆘 {t.dashSos}</a>
    </div>
  );
}
