import { useState, type FormEvent } from "react";
import { useI18n } from "../i18n/context";
import { useCaregivers } from "../hooks/useCaregivers";
import type { CaregiverLink } from "../types/models";

const perms: CaregiverLink["permission"][] = [
  "appointments_only",
  "appointments_and_results",
  "full",
];

export function CaregiversPage() {
  const { t } = useI18n();
  const { links, loading, invite, revoke, updatePermission } = useCaregivers();
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<CaregiverLink["permission"]>("appointments_only");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function onInvite(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      await invite(email, permission);
      setEmail("");
      setMsg(t.caregiverInvited);
    } catch (err) {
      setMsg(String(err instanceof Error ? err.message : err));
    } finally {
      setBusy(false);
    }
  }

  function permLabel(p: CaregiverLink["permission"]) {
    if (p === "full") return t.permFull;
    if (p === "appointments_and_results") return t.permApptResults;
    return t.permApptOnly;
  }

  return (
    <div className="page">
      <div className="page-header"><h2>👨‍👩‍👧 {t.caregiverTitle}</h2></div>
      <p className="muted" style={{ marginBottom: 14, fontSize: "0.92rem" }}>{t.caregiverDesc}</p>

      <form className="card" onSubmit={onInvite}>
        <h3>{t.caregiverInvite}</h3>
        <div className="field">
          <label>{t.loginEmail}</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="family@email.com" />
        </div>
        <div className="field">
          <label>{t.caregiverPerm}</label>
          <select
            value={permission}
            onChange={(e) => setPermission(e.target.value as CaregiverLink["permission"])}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid var(--line)", font: "inherit" }}
          >
            {perms.map((p) => (
              <option key={p} value={p}>{permLabel(p)}</option>
            ))}
          </select>
        </div>
        <button className="btn" type="submit" disabled={busy}>{busy ? t.loading : t.caregiverSend}</button>
        {msg ? <p className="muted" style={{ marginTop: 10, fontSize: "0.9rem" }}>{msg}</p> : null}
      </form>

      <div className="section-label">{t.caregiverList}</div>
      {loading && <p className="muted">{t.loading}</p>}
      {!loading && links.length === 0 && <div className="empty-state"><p>{t.caregiverEmpty}</p></div>}
      {links.map((l) => (
        <div key={l.id} className="list-card">
          <b>{l.caregiverEmail || l.caregiverId || "—"}</b>
          <div className="muted" style={{ fontSize: "0.9rem", marginTop: 4 }}>
            {permLabel(l.permission)} · {l.status === "active" ? t.statusActive : l.status === "pending" ? t.statusPending : t.statusRevoked}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {l.status !== "revoked" && (
              <>
                <select
                  value={l.permission}
                  onChange={(e) => updatePermission(l.id, e.target.value as CaregiverLink["permission"])}
                  style={{ padding: "8px 10px", borderRadius: 10, border: "1.5px solid var(--line)", font: "inherit", flex: 1 }}
                >
                  {perms.map((p) => (
                    <option key={p} value={p}>{permLabel(p)}</option>
                  ))}
                </select>
                <button type="button" className="btn sm ghost" style={{ color: "var(--coral)" }} onClick={() => revoke(l.id)}>
                  {t.caregiverRevoke}
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
