import { useI18n } from "../i18n/context";

const JOURNEY = [
  { n: 1, label: "วินิจฉัย", status: "done" as const },
  { n: 2, label: "วางแผน", status: "done" as const },
  { n: 3, label: "เคมีบำบัด", status: "active" as const },
  { n: 4, label: "ประเมินผล", status: "todo" as const },
  { n: 5, label: "ติดตาม", status: "todo" as const },
];

export function HomePage() {
  const { t } = useI18n();

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
        <div className="act">
          <div className="dt">
            12
            <br />
            ต.ค.
          </div>
          <div>
            ตรวจเลือด 08:00 น.
            <br />
            <small className="muted">งดอาหาร 8 ชั่วโมง</small>
          </div>
        </div>
        <div className="act">
          <div className="dt">
            13
            <br />
            ต.ค.
          </div>
          <div>
            พบแพทย์ 09:30 น.
            <br />
            <small className="muted">คลินิกมะเร็ง ชั้น 2</small>
          </div>
        </div>
        <div className="act">
          <div className="dt">
            15
            <br />
            ต.ค.
          </div>
          <div>
            รับเคมีบำบัด รอบที่ 3
            <br />
            <small className="muted">ใช้เวลาประมาณ 3–4 ชม.</small>
          </div>
        </div>
      </div>

      <div
        className="card"
        style={{ background: "linear-gradient(135deg,#D9F7F0,#DCEEFF)" }}
      >
        <h3>🎫 {t.dashQueue}</h3>
        <div className="pf" style={{ fontSize: "1.25rem" }}>
          อีก 3 คิวถึงคุณ · ประมาณ 15 นาที
        </div>
        <div className="bar">
          <i style={{ width: "70%" }} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn sm secondary" type="button" style={{ flex: 1 }}>
            เช็คอินด้วย QR
          </button>
        </div>
      </div>

      <div className="grid2">
        <button className="tile" type="button" style={{ ["--c" as string]: "var(--coral)" }}>
          <span>💊</span>
          {t.dashMeds}
          <small>กินแล้วแตะติ๊ก</small>
        </button>
        <button className="tile" type="button" style={{ ["--c" as string]: "var(--lilac)" }}>
          <span>💬</span>
          {t.dashChat}
          <small>ตอบจากข้อมูลจริง</small>
        </button>
        <button className="tile" type="button" style={{ ["--c" as string]: "var(--sun)" }}>
          <span>📚</span>
          {t.dashEdu}
          <small>อ่านง่าย ไม่เครียด</small>
        </button>
        <button className="tile" type="button" style={{ ["--c" as string]: "var(--sky)" }}>
          <span>🚗</span>
          {t.dashPrep}
          <small>เดินทางวันเดียวจบ</small>
        </button>
      </div>

      <button className="sos" type="button">
        🆘 {t.dashSos}
      </button>
    </div>
  );
}
