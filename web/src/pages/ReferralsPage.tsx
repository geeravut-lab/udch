import { useI18n } from "../i18n/context";
import { useReferrals } from "../hooks/useReferrals";

export function ReferralsPage() {
  const { t } = useI18n();
  const { referrals, loading } = useReferrals();

  const statusLabel: Record<string, string> = {
    pending: t.statusPending,
    accepted: t.statusActive,
    completed: t.statusDone,
    cancelled: t.statusRevoked,
  };

  return (
    <div className="page">
      <div className="page-header"><h2>🏥 {t.referralTitle}</h2></div>
      <p className="muted" style={{ marginBottom: 14, fontSize: "0.92rem" }}>{t.referralDesc}</p>
      {loading && <p className="muted">{t.loading}</p>}
      {!loading && referrals.length === 0 && (
        <div className="empty-state">
          <div className="emoji">📋</div>
          <p>{t.referralEmpty}</p>
          <p style={{ fontSize: "0.9rem" }}>{t.seedHint}</p>
        </div>
      )}
      {referrals.map((r) => (
        <div key={r.id} className="list-card">
          <b>{r.fromHospital || "—"} → {r.toHospital || "—"}</b>
          <div className="muted" style={{ fontSize: "0.9rem", marginTop: 4 }}>
            {r.reason || ""}
            {r.referredAt ? ` · ${r.referredAt}` : ""}
          </div>
          {r.notes && <p style={{ marginTop: 6, fontSize: "0.9rem" }}>{r.notes}</p>}
          <span className="chip" style={{ marginTop: 8 }}>{statusLabel[r.status] || r.status}</span>
        </div>
      ))}
    </div>
  );
}
