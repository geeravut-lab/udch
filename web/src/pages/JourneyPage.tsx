import { Link } from "react-router-dom";
import { useI18n } from "../i18n/context";
import { useJourney } from "../hooks/useJourney";
import { useTreatmentCycles } from "../hooks/useTreatmentCycles";
import { formatThaiDate } from "../lib/converters";

export function JourneyPage() {
  const { t } = useI18n();
  const { journey, loading } = useJourney();
  const { cycles } = useTreatmentCycles();

  return (
    <div className="page">
      <div className="page-header"><h2>🛤️ {t.journeyTitle}</h2></div>

      {loading && <p className="muted">{t.loading}</p>}

      {!loading && !journey && (
        <div className="empty-state">
          <div className="emoji">🛤️</div>
          <p>{t.journeyEmpty}</p>
          <p style={{ fontSize: "0.9rem" }}>{t.seedHint}</p>
          <Link to="/me" className="btn secondary" style={{ width: "auto", margin: "12px auto 0" }}>{t.demoBtn}</Link>
        </div>
      )}

      {journey && (
        <>
          <div className="card">
            <div className="pf" style={{ fontSize: "1.1rem" }}>{journey.diagnosis || t.journeyTitle}</div>
            <p className="muted" style={{ fontSize: "0.9rem", marginTop: 6 }}>
              {[journey.stage && `Stage ${journey.stage}`, journey.protocol, journey.status].filter(Boolean).join(" · ")}
            </p>
            {journey.startedAt && <small className="muted">เริ่ม {journey.startedAt}</small>}
          </div>

          <div className="card">
            <h3>{t.journeySteps}</h3>
            <div className="journey" style={{ flexWrap: "wrap" }}>
              {journey.steps.map((s, i) => (
                <div key={s.id} className={`st ${s.status}`} style={{ minWidth: 72 }}>
                  <i>{i + 1}</i>
                  {s.title}
                  {s.meta && typeof s.meta.cycle === "string" ? (
                    <div style={{ fontSize: "0.7rem", marginTop: 2 }}>{s.meta.cycle as string}</div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {journey.steps.filter((s) => s.status === "active").map((s) => (
            <div key={s.id} className="hero-next" style={{ marginBottom: 12 }}>
              <div className="label">{t.journeyCurrent}</div>
              <div className="title">{s.title}</div>
              {s.description && <div className="meta">{s.description}</div>}
            </div>
          ))}
        </>
      )}

      <div className="section-label">{t.treatmentTitle}</div>
      {cycles.length === 0 ? (
        <p className="muted" style={{ padding: "0 4px 12px" }}>{t.treatmentEmpty}</p>
      ) : (
        cycles.map((c) => (
          <div key={c.id} className="list-card" style={{ ["--accent" as string]: c.status === "active" ? "var(--teal)" : "var(--line)" }}>
            <b>
              {c.treatmentType === "chemo" ? "เคมีบำบัด" : c.treatmentType === "radiation" ? "รังสี" : c.treatmentType}
              {c.cycleNumber != null ? ` · รอบ ${c.cycleNumber}${c.totalCycles ? `/${c.totalCycles}` : ""}` : ""}
            </b>
            <div className="muted" style={{ fontSize: "0.9rem", marginTop: 4 }}>
              {c.protocol || ""}
              {c.scheduledAt ? ` · ${formatThaiDate(c.scheduledAt, true)}` : ""}
            </div>
            <span className={`chip status-${c.status === "done" ? "completed" : "scheduled"}`} style={{ marginTop: 8 }}>
              {c.status === "done" ? t.statusDone : c.status === "active" ? t.statusActive : t.statusTodo}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
