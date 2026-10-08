import { Link } from "react-router-dom";
import { useI18n } from "../i18n/context";
import { useAppointments } from "../hooks/useAppointments";
import { dayMonthParts, formatThaiDate } from "../lib/converters";

const FALLBACK_JOURNEY = [
  { n: 1, label: "วินิจฉัย", status: "done" as const },
  { n: 2, label: "วางแผน", status: "done" as const },
  { n: 3, label: "เคมีบำบัด", status: "active" as const },
  { n: 4, label: "ประเมินผล", status: "todo" as const },
  { n: 5, label: "ติดตาม", status: "todo" as const },
];

export function HomePage() {
  const { t } = useI18n();
  const { appointments, loading } = useAppointments({ upcomingOnly: true, max: 5 });

  return (
    <div className="page">
      <div className="card">
        <h3>🛤️ {t.dashJourney}</h3>
        <div className="journey">
          {FALLBACK_JOURNEY.map((s) => (
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
          <p className="muted">
            ยังไม่มีนัดหมาย — ไปที่หน้าของฉัน กด “ใส่ข้อมูลตัวอย่าง” เพื่อทดลอง
          </p>
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
                    {a.location ? ` · ${a.location}` : ""}
                  </small>
                </div>
              </div>
            );
          })
        )}
        <div style={{ marginTop: 10 }}>
          <Link to="/appointments" className="btn sm secondary">
            ดูนัดทั้งหมด
          </Link>
        </div>
      </div>

      <div
        className="card"
        style={{ background: "linear-gradient(135deg,#D9F7F0,#DCEEFF)" }}
      >
        <h3>🎫 {t.dashQueue}</h3>
        <div className="pf" style={{ fontSize: "1.15rem" }}>
          ยังไม่เปิดคิวสด — จะเชื่อม Realtime Database ในรอบถัดไป
        </div>
        <div className="bar">
          <i style={{ width: "20%" }} />
        </div>
      </div>

      <div className="grid2">
        <Link to="/appointments" className="tile" style={{ ["--c" as string]: "var(--sky)" }}>
          <span>📅</span>
          {t.navAppointments}
          <small>นัดถัดไปของคุณ</small>
        </Link>
        <Link to="/results" className="tile" style={{ ["--c" as string]: "var(--mint)" }}>
          <span>🧪</span>
          {t.navResults}
          <small>ผลแล็บ / ภาพถ่าย</small>
        </Link>
        <button className="tile" type="button" style={{ ["--c" as string]: "var(--coral)" }}>
          <span>💊</span>
          {t.dashMeds}
          <small>เร็ว ๆ นี้</small>
        </button>
        <Link to="/messages" className="tile" style={{ ["--c" as string]: "var(--lilac)" }}>
          <span>💬</span>
          {t.dashChat}
          <small>{t.navMessages}</small>
        </Link>
      </div>

      <button className="sos" type="button">
        🆘 {t.dashSos}
      </button>
    </div>
  );
}
