import { useI18n } from "../i18n/context";
import { useMedications } from "../hooks/useMedications";

export function MedicationsPage() {
  const { t } = useI18n();
  const { medications, loading, error } = useMedications(true);

  return (
    <div className="page">
      <h3 className="pf" style={{ marginBottom: 12 }}>
        💊 {t.medsTitle}
      </h3>
      {loading && <p className="muted">{t.loading}</p>}
      {error && <div className="error-box">{error}</div>}
      {!loading && medications.length === 0 && (
        <div className="empty">
          {t.medsEmpty}
          <br />
          <small>{t.seedHint}</small>
        </div>
      )}
      {medications.map((m) => (
        <div className="card" key={m.id} style={{ borderLeft: "8px solid var(--coral)" }}>
          <div className="pf">{m.name}</div>
          <small className="muted">
            {[m.dosage, m.instructions].filter(Boolean).join(" · ")}
          </small>
          {m.reminderTimes && m.reminderTimes.length > 0 && (
            <div style={{ marginTop: 8, fontSize: "0.85rem" }}>
              ⏰ {m.reminderTimes.join(", ")}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
