import { useState } from "react";
import { useI18n } from "../i18n/context";
import { useEducation } from "../hooks/useEducation";
import type { EducationArticle } from "../types/models";

export function EducationPage() {
  const { t, lang } = useI18n();
  const { articles, loading } = useEducation();
  const [open, setOpen] = useState<EducationArticle | null>(null);

  if (open) {
    const title = lang === "en" && open.titleEn ? open.titleEn : open.titleTh;
    const body = lang === "en" && open.bodyEn ? open.bodyEn : open.bodyTh;
    return (
      <div className="page">
        <button type="button" className="btn sm ghost" style={{ width: "auto", marginBottom: 12 }} onClick={() => setOpen(null)}>
          ← {t.back}
        </button>
        <div className="card">
          <h2 className="pf" style={{ fontSize: "1.2rem", marginBottom: 8 }}>{title}</h2>
          {open.category && <span className="chip">{open.category}</span>}
          <div style={{ marginTop: 14, whiteSpace: "pre-wrap", lineHeight: 1.65 }}>{body || "—"}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header"><h2>📚 {t.eduTitle}</h2></div>
      {loading && <p className="muted">{t.loading}</p>}
      {!loading && articles.length === 0 && (
        <div className="empty-state">
          <div className="emoji">📚</div>
          <p>{t.eduEmpty}</p>
          <p style={{ fontSize: "0.9rem" }}>{t.seedHint}</p>
        </div>
      )}
      {articles.map((a) => (
        <button key={a.id} type="button" className="list-card" onClick={() => setOpen(a)}>
          <b>{lang === "en" && a.titleEn ? a.titleEn : a.titleTh}</b>
          {a.category && <div className="muted" style={{ fontSize: "0.85rem", marginTop: 4 }}>{a.category}</div>}
        </button>
      ))}
    </div>
  );
}
