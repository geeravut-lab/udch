import { useEffect, useState } from "react";
import { useI18n } from "../i18n/context";
import { useAiSettings } from "../hooks/useAiSettings";
import { PROVIDERS, type AiSettings, type ProviderId, type TaskKind } from "../lib/aiConfig";

const TASKS: TaskKind[] = ["chat", "document", "reasoning"];

export function AdminAiPage() {
  const { t } = useI18n();
  const { settings, loading, save, isAdmin } = useAiSettings();
  const [form, setForm] = useState<AiSettings>(settings);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  if (!isAdmin) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="emoji">🔒</div>
          <p>{t.adminOnly}</p>
          <p className="muted" style={{ fontSize: "0.9rem" }}>{t.adminOnlyHint}</p>
        </div>
      </div>
    );
  }

  async function onSave() {
    setBusy(true);
    setMsg("");
    try {
      await save(form);
      setMsg(t.aiSaved);
    } catch (err) {
      setMsg(String(err instanceof Error ? err.message : err));
    } finally {
      setBusy(false);
    }
  }

  function setModel(provider: ProviderId, task: TaskKind, model: string) {
    setForm((f) => ({
      ...f,
      modelOverrides: {
        ...f.modelOverrides,
        [provider]: {
          ...(f.modelOverrides?.[provider] || {}),
          [task]: model,
        },
      },
    }));
  }

  const active = PROVIDERS.find((p) => p.id === form.defaultProvider);

  return (
    <div className="page">
      <div className="page-header">
        <h2>🤖 {t.aiAdminTitle}</h2>
      </div>
      <p className="muted" style={{ marginBottom: 12, fontSize: "0.9rem" }}>{t.aiAdminDesc}</p>

      {loading ? (
        <p className="muted">{t.loading}</p>
      ) : (
        <>
          <div className="card">
            <h3>{t.aiDefaultProvider}</h3>
            <select
              value={form.defaultProvider}
              onChange={(e) =>
                setForm((f) => ({ ...f, defaultProvider: e.target.value as ProviderId }))
              }
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid var(--line)", font: "inherit" }}
            >
              {PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="card">
            <h3>{t.aiFallback}</h3>
            <select
              value={form.fallbackProvider}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  fallbackProvider: e.target.value as AiSettings["fallbackProvider"],
                }))
              }
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid var(--line)", font: "inherit" }}
            >
              <option value="none">{t.aiFallbackNone}</option>
              {PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {active && (
            <div className="card">
              <h3>
                {t.aiModels} ({active.label})
              </h3>
              {TASKS.map((task) => {
                const options = active.models[task];
                const current =
                  form.modelOverrides?.[active.id]?.[task] || options[0];
                return (
                  <div className="field" key={task}>
                    <label>
                      {task === "chat"
                        ? t.aiTaskChat
                        : task === "document"
                          ? t.aiTaskDoc
                          : t.aiTaskReason}
                    </label>
                    <select
                      value={current}
                      onChange={(e) => setModel(active.id, task, e.target.value)}
                      style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid var(--line)", font: "inherit" }}
                    >
                      {options.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          )}

          <div className="card">
            <h3>{t.aiEdgeUrl}</h3>
            <input
              value={form.edgeFunctionUrl || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, edgeFunctionUrl: e.target.value || null }))
              }
              placeholder="ว่างไว้ = ใช้ /.netlify/functions/ai-chat"
            />
            <p className="muted" style={{ fontSize: "0.8rem", marginTop: 8 }}>
              {t.aiEdgeHint}
              <br />Default: <code>/.netlify/functions/ai-chat</code>
            </p>
          </div>

          <button className="btn" type="button" disabled={busy} onClick={onSave}>
            {busy ? t.loading : t.save}
          </button>
          {settings.updatedBy ? (
            <p className="muted" style={{ marginTop: 10, fontSize: "0.85rem" }}>
              {t.aiUpdatedBy}: {settings.updatedBy.slice(0, 8)}… · {settings.updatedAt}
            </p>
          ) : null}
          {msg ? <p className="muted" style={{ marginTop: 10 }}>{msg}</p> : null}
        </>
      )}
    </div>
  );
}
