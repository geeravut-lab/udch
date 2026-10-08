import { useI18n } from "../i18n/context";
import { useAuth } from "../hooks/useAuth";
import type { Lang } from "../i18n/dict";

export function MePage() {
  const { t, lang, setLang } = useI18n();
  const { profile, signOut } = useAuth();

  return (
    <div className="page">
      <h3 className="pf" style={{ marginBottom: 12 }}>
        👤 {t.meTitle}
      </h3>

      <div className="card">
        <h3>{t.meProfile}</h3>
        <p>
          <b>{profile?.fullName || "—"}</b>
        </p>
        <p className="muted">{profile?.email}</p>
        {profile?.hn ? <p className="muted">HN: {profile.hn}</p> : null}
      </div>

      <div className="card">
        <h3>{t.meSettings}</h3>
        <label className="muted" style={{ display: "block", marginBottom: 6 }}>
          {t.meLang}
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          {(["th", "en"] as Lang[]).map((l) => (
            <button
              key={l}
              type="button"
              className={`btn sm ${lang === l ? "" : "secondary"}`}
              onClick={() => setLang(l)}
            >
              {l === "th" ? "ไทย" : "English"}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>{t.meRights}</h3>
        <p className="muted" style={{ fontSize: "0.9rem", marginBottom: 10 }}>
          ตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
        </p>
        <button className="btn secondary" type="button" style={{ marginBottom: 8 }}>
          {t.meExport}
        </button>
        <button className="btn secondary" type="button" style={{ marginBottom: 8 }}>
          {t.mePolicy}
        </button>
        <button className="btn ghost" type="button" style={{ color: "var(--danger)" }}>
          {t.meDelete}
        </button>
      </div>

      <button className="btn ghost" type="button" onClick={() => signOut()}>
        {t.logout}
      </button>
    </div>
  );
}
