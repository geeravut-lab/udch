import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/context";
import { useAuth } from "../hooks/useAuth";
import type { Lang } from "../i18n/dict";
import { seedDemoDataForPatient } from "../lib/seedDemoData";
import { exportMyData } from "../lib/exportMyData";
import { useHospitalInfo } from "../hooks/useHospitalInfo";

export function MePage() {
  const { t, lang, setLang } = useI18n();
  const { profile, user, signOut } = useAuth();
  const hospital = useHospitalInfo();
  const navigate = useNavigate();
  const [seedBusy, setSeedBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [exportBusy, setExportBusy] = useState(false);

  async function onSeed() {
    if (!user) return;
    if (!confirm(t.demoConfirm)) return;
    setSeedBusy(true);
    try {
      await seedDemoDataForPatient(user.uid);
      setToast(t.seedOk);
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      setToast(String(err instanceof Error ? err.message : err));
    } finally {
      setSeedBusy(false);
    }
  }

  async function onExport() {
    if (!user || !profile) return;
    setExportBusy(true);
    try {
      await exportMyData(user.uid, { ...profile });
      setToast(t.exportOk);
    } catch (err) {
      console.error(err);
      setToast(t.errorGeneric);
    } finally {
      setExportBusy(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header"><h2>👤 {t.meTitle}</h2></div>

      <div className="card">
        <h3>{t.meProfile}</h3>
        <p><b>{profile?.fullName || "—"}</b></p>
        <p className="muted">{profile?.email}</p>
        {profile?.hn ? <p className="muted">HN: {profile.hn}</p> : null}
      </div>

      <div className="card">
        <h3>{t.meSettings}</h3>
        <label className="muted" style={{ display: "block", marginBottom: 6 }}>{t.meLang}</label>
        <div style={{ display: "flex", gap: 8 }}>
          {(["th", "en"] as Lang[]).map((l) => (
            <button key={l} type="button" className={`btn sm ${lang === l ? "" : "secondary"}`} onClick={() => setLang(l)}>
              {l === "th" ? "ไทย" : "English"}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>{t.quickLinks}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Link to="/medications" className="btn secondary">{t.medsTitle}</Link>
          <Link to="/documents" className="btn secondary">{t.docsTitle}</Link>
          <Link to="/notifications" className="btn secondary">{t.notifTitle}</Link>
        </div>
      </div>

      <div className="card">
        <h3>{t.demoTitle}</h3>
        <p className="muted" style={{ fontSize: "0.9rem", marginBottom: 10 }}>{t.demoDesc}</p>
        <button className="btn secondary" type="button" disabled={seedBusy} onClick={onSeed}>
          {seedBusy ? t.loading : t.demoBtn}
        </button>
      </div>

      <div className="card">
        <h3>{t.meRights}</h3>
        <p className="muted" style={{ fontSize: "0.9rem", marginBottom: 10 }}>{t.pdpaNote}</p>
        <button className="btn secondary" type="button" style={{ marginBottom: 8 }} disabled={exportBusy} onClick={onExport}>
          {exportBusy ? t.loading : t.meExport}
        </button>
        <a className="btn secondary" style={{ display: "block", textAlign: "center" }} href={`tel:${hospital.phone}`}>
          {t.contactHospital}
        </a>
      </div>

      <button className="btn ghost" type="button" onClick={() => signOut()}>{t.logout}</button>
      {toast ? <div className="toast" role="status">{toast}</div> : null}
    </div>
  );
}
