import { useI18n } from "../i18n/context";
import { useAuth } from "../hooks/useAuth";
import { useEproTriage } from "../hooks/useEpro";
import { formatThaiDate } from "../lib/converters";

export function NursePage() {
  const { t } = useI18n();
  const { profile } = useAuth();
  const { entries, loading } = useEproTriage();
  const role = profile?.role || "patient";
  const isStaff = ["nurse", "doctor", "admin"].includes(role);

  if (!isStaff) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="emoji">🔒</div>
          <p>{t.staffOnly}</p>
          <p className="muted" style={{ fontSize: "0.9rem" }}>{t.staffOnlyHint}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>👩‍⚕️ {t.nurseTitle}</h2>
      </div>
      <p className="muted" style={{ marginBottom: 12 }}>{t.nurseDesc}</p>
      {loading && <p className="muted">{t.loading}</p>}
      {!loading && entries.length === 0 && (
        <div className="empty-state">
          <div className="emoji">✅</div>
          <p>{t.nurseEmpty}</p>
        </div>
      )}
      {entries.map((e) => (
        <div key={e.id} className="list-card" style={{ ["--accent" as string]: "var(--coral)" }}>
          <b>Patient: {e.patientId.slice(0, 8)}…</b>
          <div style={{ marginTop: 6 }}>
            Pain {e.pain} · Nausea {e.nausea} · Fatigue {e.fatigue}
          </div>
          <div className="muted" style={{ fontSize: "0.85rem" }}>
            {formatThaiDate(e.createdAt, true)}
          </div>
          {e.notes ? <p style={{ marginTop: 6 }}>{e.notes}</p> : null}
        </div>
      ))}
    </div>
  );
}
