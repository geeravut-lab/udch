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
  const { appointments, loading } = useAppointments({ upcomingOnly: true, max: 5 });
  const { unread } = useNotifications();
  const hospital = useHospitalInfo();

  return (
    <div className="page">
      <div className="card">
        <h3>🛤️ {t.dashJourney}</h3>
        <div className="journey">
          {JOURNEY.map((s) => (
            <div key={s.n} className={`st ${s.status}`}>
              <i>{s.n}</i>
              {s.label}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>📌 {t.dashNextActions}</h3>
        {loading ? (
          <p className="muted">{t.loading}</p>
        ) : appointments.length === 0 ? (
          <p className="muted">{t.seedHint}</p>
        ) : (
          appointments.slice(0, 3).map((a) => {
            const { day, month } = dayMonthParts(a.scheduledAt);
            return (
              <div className="act" key={a.id}>
                <div className="dt">
                  {day}
                  <br />
                  {month}
                </div>
                <div>
                  {a.title}
                  <br />
                  <small className="muted">
                    {formatThaiDate(a.scheduledAt, true)}
                    {a.preparation ? ` · ${a.preparation}` : ""}
                  </small>
                </div>
              </div>
            );
          })
        )}
        <div style={{ marginTop: 10 }}>
          <Link to="/appointments" className="btn sm secondary">
            {t.navAppointments}
          </Link>
        </div>
      </div>

      <div className="card" style={{ background: "linear-gradient(135deg,#D9F7F0,#DCEEFF)" }}>
        <h3>🎫 {t.dashQueue}</h3>
        <div className="pf" style={{ fontSize: "1.05rem" }}>{t.queueSoon}</div>
        <div className="bar"><i style={{ width: "15%" }} /></div>
      </div>

      <div className="grid2">
        <Link to="/medications" className="tile" style={{ ["--c" as string]: "var(--coral)" }}>
          <span>💊</span>{t.dashMeds}<small>{t.medsTitle}</small>
        </Link>
        <Link to="/messages" className="tile" style={{ ["--c" as string]: "var(--lilac)" }}>
          <span>💬</span>{t.dashChat}<small>{t.navMessages}</small>
        </Link>
        <Link to="/documents" className="tile" style={{ ["--c" as string]: "var(--sun)" }}>
          <span>📄</span>{t.docsTitle}<small>{t.meDocuments}</small>
        </Link>
        <Link to="/notifications" className="tile" style={{ ["--c" as string]: "var(--sky)" }}>
          <span>🔔</span>{t.notifTitle}<small>{unread > 0 ? `${unread} ใหม่` : "—"}</small>
        </Link>
      </div>

      <div className="card">
        <h3>🏥 {hospital.nameTh}</h3>
        <p className="muted" style={{ fontSize: "0.9rem" }}>
          โทร {hospital.phone}{hospital.mobile ? ` · ${hospital.mobile}` : ""}
          <br />{hospital.hours}
          {hospital.lineId ? <><br />LINE {hospital.lineId}</> : null}
        </p>
      </div>

      <a className="sos" href={`tel:${hospital.phone}`}>🆘 {t.dashSos}</a>
    </div>
  );
}
