import { useState } from "react";
import { Link } from "react-router-dom";
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
  const [seedBusy, setSeedBusy] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");
  const [exportBusy, setExportBusy] = useState(false);

  async function onSeed() {
    if (!user) return;
    setSeedBusy(true);
    setSeedMsg("");
    try {
      await seedDemoDataForPatient(user.uid);
      setSeedMsg(t.seedOk);
    } catch (err) {
      setSeedMsg(String(err instanceof Error ? err.message : err));
    } finally {
      setSeedBusy(false);
    }
  }

  async function onExport() {
    if (!user || !profile) return;
    setExportBusy(true);
    try {
      await exportMyData(user.uid, { ...profile });
    } catch (err) {
      console.error(err);
      alert(t.errorGeneric);
    } finally {
      setExportBusy(false);
    }
  }

  return (
    <div className="page">
      <h3 className="pf" style={{ marginBottom: 12 }}>👤 {t.meTitle}</h3>

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
        {seedMsg ? <p className="muted" style={{ marginTop: 10, fontSize: "0.9rem" }}>{seedMsg}</p> : null}
      </div>

      <div className="card">
        <h3>{t.meRights}</h3>
        <p className="muted" style={{ fontSize: "0.9rem", marginBottom: 10 }}>{t.pdpaNote}</p>
        <button className="btn secondary" type="button" style={{ marginBottom: 8 }} disabled={exportBusy} onClick={onExport}>
          {exportBusy ? t.loading : t.meExport}
        </button>
        <a className="btn secondary" style={{ marginBottom: 8, display: "block", textAlign: "center" }} href={`tel:${hospital.phone}`}>
          {t.contactHospital}
        </a>
      </div>

      <button className="btn ghost" type="button" onClick={() => signOut()}>{t.logout}</button>
    </div>
  );
}
