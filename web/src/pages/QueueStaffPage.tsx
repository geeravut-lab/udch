import { useState } from "react";
import { ref, set, update, get } from "firebase/database";
import { rtdb } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import { useI18n } from "../i18n/context";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function QueueStaffPage() {
  const { t } = useI18n();
  const { user, profile } = useAuth();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const role = profile?.role || "patient";
  const canStaff = ["nurse", "doctor", "admin"].includes(role);

  async function seedDemoQueue() {
    if (!user) return;
    setBusy(true);
    setMsg("");
    try {
      const date = todayKey();
      const sp = "opd";
      const ticketId = `t_${user.uid.slice(0, 8)}`;
      await set(ref(rtdb, `queue/${date}/${sp}/${ticketId}`), {
        patientId: user.uid,
        queueNumber: 15,
        status: "waiting",
        estimatedWaitMinutes: 25,
        displayName: profile?.fullName || "Demo",
        updatedAt: Date.now(),
      });
      await set(ref(rtdb, `queueMeta/${date}/${sp}`), {
        nowServing: 10,
        totalWaiting: 8,
        updatedAt: Date.now(),
      });
      setMsg(t.queueSeedOk);
    } catch (err) {
      setMsg(String(err instanceof Error ? err.message : err));
    } finally {
      setBusy(false);
    }
  }

  async function callNext() {
    setBusy(true);
    try {
      const date = todayKey();
      const metaRef = ref(rtdb, `queueMeta/${date}/opd`);
      const snap = await get(metaRef);
      const cur = (snap.val()?.nowServing as number) || 0;
      await update(metaRef, { nowServing: cur + 1, updatedAt: Date.now() });
      setMsg(t.queueCalled.replace("{n}", String(cur + 1)));
    } catch (err) {
      setMsg(String(err instanceof Error ? err.message : err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>🎫 {t.queueStaffTitle}</h2>
      </div>
      <p className="muted" style={{ marginBottom: 12 }}>{t.queueStaffDesc}</p>

      <div className="card">
        <h3>{t.queueDemo}</h3>
        <p className="muted" style={{ fontSize: "0.9rem", marginBottom: 10 }}>{t.queueDemoHint}</p>
        <button className="btn secondary" type="button" disabled={busy} onClick={seedDemoQueue}>
          {busy ? t.loading : t.queueSeedBtn}
        </button>
      </div>

      {canStaff && (
        <div className="card">
          <h3>{t.queueStaffActions}</h3>
          <button className="btn" type="button" disabled={busy} onClick={callNext}>
            {t.queueCallNext}
          </button>
        </div>
      )}

      {msg ? <div className="toast" role="status">{msg}</div> : null}
    </div>
  );
}
