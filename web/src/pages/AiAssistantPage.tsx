import { useState, type FormEvent } from "react";
import { useI18n } from "../i18n/context";
import { useAiSettings } from "../hooks/useAiSettings";
import { localAssist } from "../lib/aiAssistant";

type Msg = { role: "user" | "assistant"; text: string };

/** ค่าเริ่มต้น: Netlify Function ในโปรเจกต์นี้ */
const DEFAULT_FN = "/.netlify/functions/ai-chat";

export function AiAssistantPage() {
  const { t, lang } = useI18n();
  const { settings, resolveModel } = useAiSettings();
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "assistant", text: t.aiWelcome }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"netlify" | "local" | "custom">("netlify");
  const resolved = resolveModel("chat");

  const endpoint = (settings.edgeFunctionUrl || "").trim() || DEFAULT_FN;

  async function onSend(e: FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q || busy) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setBusy(true);
    try {
      const history = msgs
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-8)
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: q,
          provider: resolved.provider,
          model: resolved.model,
          lang,
          history,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as { reply?: string; provider?: string };
        const answer = data.reply?.trim();
        if (answer) {
          setMode(settings.edgeFunctionUrl ? "custom" : "netlify");
          setMsgs((m) => [...m, { role: "assistant", text: answer }]);
          return;
        }
      }

      // fallback local knowledge
      const status = res.status;
      let hint = "";
      try {
        const errBody = (await res.json()) as { error?: string; hint?: string };
        hint = errBody.error || errBody.hint || "";
      } catch {
        /* ignore */
      }
      console.warn("[ai]", status, hint);
      setMode("local");
      const local = localAssist(q, lang);
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          text:
            local +
            (status === 503
              ? `\n\n_(${t.aiFallbackLocal}: ยังไม่มี API key บน Netlify)_`
              : ""),
        },
      ]);
    } catch (err) {
      setMode("local");
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          text:
            localAssist(q, lang) +
            `\n\n_(${t.aiFallbackLocal}: ${err instanceof Error ? err.message : String(err)})_`,
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", minHeight: "65vh" }}>
      <div className="page-header">
        <h2>🤖 {t.aiTitle}</h2>
      </div>
      <p className="muted" style={{ fontSize: "0.85rem", marginBottom: 10 }}>
        {t.aiUsing}: {resolved.provider} / {resolved.model}
        {" · "}
        {mode === "local" ? t.aiLocalMode : mode === "custom" ? endpoint : t.aiNetlifyMode}
      </p>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
        {msgs.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "90%",
              background: m.role === "user" ? "#d9f7f0" : "var(--card)",
              padding: "10px 12px",
              borderRadius: 14,
              boxShadow: "var(--shadow)",
              whiteSpace: "pre-wrap",
              lineHeight: 1.5,
            }}
          >
            {m.text}
          </div>
        ))}
      </div>

      <form onSubmit={onSend} style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.aiPlaceholder}
          style={{ flex: 1 }}
          disabled={busy}
        />
        <button className="btn sm" type="submit" style={{ width: "auto" }} disabled={busy}>
          {busy ? "…" : t.msgSend}
        </button>
      </form>
    </div>
  );
}
