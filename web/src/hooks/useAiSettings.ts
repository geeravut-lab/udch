import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  DEFAULT_AI_SETTINGS,
  type AiSettings,
  type ProviderId,
  type TaskKind,
} from "../lib/aiConfig";
import { useAuth } from "./useAuth";

export function useAiSettings() {
  const { user, profile } = useAuth();
  const [settings, setSettings] = useState<AiSettings>(DEFAULT_AI_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onSnapshot(
      doc(db, "settings", "aiSettings"),
      (snap) => {
        if (snap.exists()) {
          setSettings({ ...DEFAULT_AI_SETTINGS, ...(snap.data() as AiSettings) });
        } else {
          setSettings(DEFAULT_AI_SETTINGS);
        }
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, []);

  async function save(next: AiSettings) {
    await setDoc(
      doc(db, "settings", "aiSettings"),
      {
        ...next,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.uid ?? null,
        updatedAtServer: serverTimestamp(),
      },
      { merge: true },
    );
  }

  function resolveModel(task: TaskKind): { provider: ProviderId; model: string } {
    const provider = settings.defaultProvider || "openai";
    const override = settings.modelOverrides?.[provider]?.[task];
    const fromCatalog =
      provider === "openai"
        ? "gpt-4o-mini"
        : provider === "anthropic"
          ? "claude-3-5-haiku-latest"
          : "gemini-2.0-flash";
    return { provider, model: override || fromCatalog };
  }

  const isAdmin = profile?.role === "admin";

  return { settings, loading, save, resolveModel, isAdmin };
}
