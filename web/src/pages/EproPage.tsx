import { useState, type FormEvent } from "react";
import { useI18n } from "../i18n/context";
import { useEpro } from "../hooks/useEpro";
import { formatThaiDate } from "../lib/converters";

function Slider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="field">
      <label>
        {label}: <b>{value}</b>/10
      </label>
      <input
        type="range"
        min={0}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%" }}
      />
    </div>
  );
}

export function EproPage() {
  const { t } = useI18n();
  const { entries, loading, submit } = useEpro();
  const [pain, setPain] = useState(0);
  const [nausea, setNausea] = useState(0);
  const [fatigue, setFatigue] = useState(0);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      await submit({ pain, nausea, fatigue, notes });
      setMsg(t.eproSaved);
      setPain(0);
      setNausea(0);
      setFatigue(0);
      setNotes("");
    } catch (err) {
      setMsg(String(err instanceof Error ? err.message : err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>📝 {t.eproTitle}</h2>
      </div>
      <p className="muted" style={{ marginBottom: 12, fontSize: "0.92rem" }}>
        {t.eproDesc}
      </p>

      <form className="card" onSubmit={onSubmit}>
        <Slider label={t.eproPain} value={pain} onChange={setPain} />
        <Slider label={t.eproNausea} value={nausea} onChange={setNausea} />
        <Slider label={t.eproFatigue} value={fatigue} onChange={setFatigue} />
        <div className="field">
          <label>{t.eproNotes}</label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <button className="btn" type="submit" disabled={busy}>
          {busy ? t.loading : t.eproSubmit}
        </button>
        {msg ? <p className="muted" style={{ marginTop: 10 }}>{msg}</p> : null}
      </form>

      <div className="section-label">{t.eproHistory}</div>
      {loading && <p className="muted">{t.loading}</p>}
      {entries.map((e) => (
        <div key={e.id} className="list-card" style={{ ["--accent" as string]: e.severity === "high" ? "var(--coral)" : "var(--teal)" }}>
          <b>
            {t.eproPain} {e.pain} · {t.eproNausea} {e.nausea} · {t.eproFatigue} {e.fatigue}
          </b>
          <div className="muted" style={{ fontSize: "0.85rem", marginTop: 4 }}>
            {formatThaiDate(e.createdAt, true)} · {e.severity}
          </div>
          {e.notes ? <p style={{ marginTop: 6, fontSize: "0.9rem" }}>{e.notes}</p> : null}
        </div>
      ))}
    </div>
  );
}
