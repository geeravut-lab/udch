import { useI18n } from "../i18n/context";
import { useQueue } from "../hooks/useQueue";
import { useHospitalInfo } from "../hooks/useHospitalInfo";

export function QueuePage() {
  const { t } = useI18n();
  const { waitInfo, myTicket, meta, loading, servicePoint } = useQueue("opd");
  const hospital = useHospitalInfo();

  return (
    <div className="page">
      <div className="page-header"><h2>🎫 {t.queueTitle}</h2></div>
      <p className="muted" style={{ marginBottom: 12, fontSize: "0.9rem" }}>
        {t.queueDesc} ({servicePoint})
      </p>

      {loading && <p className="muted">{t.loading}</p>}

      {!loading && !myTicket && (
        <div className="empty-state">
          <div className="emoji">🎫</div>
          <p>{t.queueEmpty}</p>
          <p style={{ fontSize: "0.9rem" }}>{t.queueEmptyHint}</p>
        </div>
      )}

      {waitInfo && (
        <div className="hero-next">
          <div className="label">{t.queueYours}</div>
          <div className="title">
            {t.queueNumber} {waitInfo.myNumber}
          </div>
          <div className="meta">
            {t.queueNowServing}: {waitInfo.nowServing}
            <br />
            {waitInfo.ahead > 0
              ? t.queueAhead.replace("{n}", String(waitInfo.ahead))
              : t.queueYourTurn}
            {waitInfo.estimatedWaitMinutes != null
              ? ` · ~${waitInfo.estimatedWaitMinutes} ${t.minutes}`
              : ""}
          </div>
          <div className="bar" style={{ background: "#ffffff44", marginTop: 14 }}>
            <i
              style={{
                width: `${Math.min(95, meta && meta.totalWaiting ? ((meta.nowServing / Math.max(waitInfo.myNumber, 1)) * 100) : 20)}%`,
                background: "#fff",
              }}
            />
          </div>
        </div>
      )}

      <div className="card">
        <h3>🏥 {hospital.nameTh}</h3>
        <p className="muted" style={{ fontSize: "0.9rem" }}>{hospital.hours}</p>
        <a className="btn sm" href={`tel:${hospital.phone}`} style={{ marginTop: 10, width: "auto" }}>
          📞 {t.callHospital}
        </a>
      </div>
    </div>
  );
}
