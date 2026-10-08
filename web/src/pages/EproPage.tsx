import { useMemo, useState, type FormEvent } from "react";
import { useI18n } from "../i18n/context";
import { useEpro } from "../hooks/useEpro";
import { formatThaiDate } from "../lib/converters";

type SymptomKey = "pain" | "fatigue" | "nausea" | "sleep" | "mood";

const SYMPTOMS: { key: SymptomKey; labelTh: string; labelEn: string }[] = [
  { key: "pain", labelTh: "ปวด", labelEn: "Pain" },
  { key: "fatigue", labelTh: "อ่อนเพลีย", labelEn: "Fatigue" },
  { key: "nausea", labelTh: "คลื่นไส้", labelEn: "Nausea" },
  { key: "sleep", labelTh: "นอนหลับ", labelEn: "Sleep" },
  { key: "mood", labelTh: "อารมณ์", labelEn: "Mood" },
];

/** ค่า 0–3 เขียว (ดี), 4–6 ฟ้า (ปานกลาง), 7–10 ส้ม (ต้องติดตาม) */
function barColor(value: number): string {
  if (value <= 3) return "#22c55e"; // green
  if (value <= 6) return "#38bdf8"; // sky/blue
  return "#f59e0b"; // orange
}

function statusFromValues(vals: Record<SymptomKey, number>) {
  const max = Math.max(...Object.values(vals));
  if (max >= 7) return { level: "high" as const, color: "#f59e0b", dot: "#f59e0b" };
  if (max >= 4) return { level: "mid" as const, color: "#0ea5e9", dot: "#0ea5e9" };
  return { level: "good" as const, color: "#16a34a", dot: "#22c55e" };
}

function SymptomBar({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  const color = barColor(value);
  const pct = Math.min(100, Math.max(0, value * 10));
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "0.95rem" }}>
        <span>{label}</span>
        <b style={{ color, minWidth: 24, textAlign: "right" }}>{value}</b>
      </div>
      <div
        style={{
          position: "relative",
          height: 14,
          borderRadius: 999,
          background: "#e5e7eb",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 999,
            background: color,
            transition: "width 0.2s ease, background 0.2s ease",
          }}
        />
      </div>
      <input
        type="range"
        min={0}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", marginTop: 4, accentColor: color }}
      />
    </div>
  );
}

export function EproPage() {
  const { t, lang } = useI18n();
  const { entries, loading, submit } = useEpro();
  const [vals, setVals] = useState<Record<SymptomKey, number>>({
    pain: 0,
    fatigue: 0,
    nausea: 0,
    sleep: 0,
    mood: 0,
  });
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const status = useMemo(() => statusFromValues(vals), [vals]);
  const todayLabel = formatThaiDate(new Date(), false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      await submit({
        sleep: vals.sleep,
        mood: vals.mood,
        pain: vals.pain,
        nausea: vals.nausea,
        fatigue: vals.fatigue,
        notes:
          notes ||
          `sleep=${vals.sleep};mood=${vals.mood}`,
        // extended fields stored via notes + core 3 for triage; also write extras if backend accepts
      });
      // second write for sleep/mood in notes is enough for Phase 3; extend firestore doc below
      setMsg(t.eproSaved);
      setVals({ pain: 0, fatigue: 0, nausea: 0, sleep: 0, mood: 0 });
      setNotes("");
    } catch (err) {
      setMsg(String(err instanceof Error ? err.message : err));
    } finally {
      setBusy(false);
    }
  }

  const statusText =
    status.level === "high"
      ? t.eproStatusHigh
      : status.level === "mid"
        ? t.eproStatusMid
        : t.eproStatusGood;

  return (
    <div className="page">
      <div className="page-header">
        <h2>📝 {t.eproTitle}</h2>
      </div>

      <form className="card" onSubmit={onSubmit}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: "1.2rem" }}>❤️</span>
            <div>
              <div className="pf" style={{ fontSize: "1rem" }}>
                {t.eproToday} · {todayLabel}
              </div>
            </div>
          </div>
          <button className="btn sm" type="submit" disabled={busy} style={{ width: "auto" }}>
            {busy ? t.loading : t.eproSubmit}
          </button>
        </div>

        {SYMPTOMS.map((s) => (
          <SymptomBar
            key={s.key}
            label={lang === "en" ? s.labelEn : s.labelTh}
            value={vals[s.key]}
            onChange={(n) => setVals((v) => ({ ...v, [s.key]: n }))}
          />
        ))}

        <div style={{ marginTop: 8, fontSize: "0.9rem" }}>
          <span style={{ color: status.color, fontWeight: 600 }}>
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: status.dot,
                marginRight: 6,
              }}
            />
            {t.eproStatus}: {statusText}
          </span>
          <p className="muted" style={{ marginTop: 6, fontSize: "0.85rem" }}>
            {t.eproAutoAlert}
          </p>
        </div>

        <div className="field" style={{ marginTop: 12 }}>
          <label>{t.eproNotes}</label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        {msg ? <p className="muted" style={{ marginTop: 8 }}>{msg}</p> : null}
      </form>

      <div className="section-label">{t.eproHistory}</div>
      {loading && <p className="muted">{t.loading}</p>}
      {entries.map((e) => {
        const max = Math.max(e.pain, e.nausea, e.fatigue);
        const c = barColor(max);
        return (
          <div key={e.id} className="list-card" style={{ ["--accent" as string]: c }}>
            <b>
              {t.eproPain} {e.pain} · {t.eproFatigue} {e.fatigue} · {t.eproNausea} {e.nausea}
            </b>
            <div className="muted" style={{ fontSize: "0.85rem", marginTop: 4 }}>
              {formatThaiDate(e.createdAt, true)} · {e.severity}
            </div>
            {e.notes ? <p style={{ marginTop: 6, fontSize: "0.9rem" }}>{e.notes}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
