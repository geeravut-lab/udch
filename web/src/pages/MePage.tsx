import { useState } from "react";
import { useI18n } from "../i18n/context";
import { useAuth } from "../hooks/useAuth";
import type { Lang } from "../i18n/dict";
import { seedDemoDataForPatient } from "../lib/seedDemoData";

export function MePage() {
  const { t, lang, setLang } = useI18n();
  const { profile, user, signOut } = useAuth();
  const [seedBusy, setSeedBusy] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");

  async function onSeed() {
    if (!user) return;
    setSeedBusy(true);
    setSeedMsg("");
    try {
      await seedDemoDataForPatient(user.uid);
      setSeedMsg("ใส่ข้อมูลตัวอย่างแล้ว — กลับหน้าหลักหรือนัดหมายเพื่อดู");
    } catch (err) {
      console.error(err);
      setSeedMsg("ไม่สำเร็จ: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSeedBusy(false);
    }
  }

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
        <p className="muted" style={{ fontSize: "0.85rem" }}>
          role: {profile?.role ?? "—"}
        </p>
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
        <h3>ข้อมูลตัวอย่าง (Demo)</h3>
        <p className="muted" style={{ fontSize: "0.9rem", marginBottom: 10 }}>
          สร้างนัดหมาย / ผลตรวจ / ยา / journey ตัวอย่างในบัญชีนี้ เพื่อทดลอง Phase 1
        </p>
        <button className="btn secondary" type="button" disabled={seedBusy} onClick={onSeed}>
          {seedBusy ? t.loading : "ใส่ข้อมูลตัวอย่าง"}
        </button>
        {seedMsg ? (
          <p className="muted" style={{ marginTop: 10, fontSize: "0.9rem" }}>
            {seedMsg}
          </p>
        ) : null}
      </div>

      <div className="card">
        <h3>{t.meRights}</h3>
        <p className="muted" style={{ fontSize: "0.9rem", marginBottom: 10 }}>
          ตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
        </p>
        <button className="btn secondary" type="button" style={{ marginBottom: 8 }} disabled>
          {t.meExport} (เร็ว ๆ นี้)
        </button>
        <button className="btn secondary" type="button" style={{ marginBottom: 8 }} disabled>
          {t.mePolicy} (เร็ว ๆ นี้)
        </button>
        <button className="btn ghost" type="button" style={{ color: "var(--danger)" }} disabled>
          {t.meDelete} (เร็ว ๆ นี้)
        </button>
      </div>

      <button className="btn ghost" type="button" onClick={() => signOut()}>
        {t.logout}
      </button>
    </div>
  );
}
