import { useI18n } from "../i18n/context";

export function MessagesPage() {
  const { t } = useI18n();
  return (
    <div className="page">
      <h3 className="pf" style={{ marginBottom: 12 }}>
        💬 {t.messagesTitle}
      </h3>
      <div className="empty">{t.messagesEmpty}</div>
    </div>
  );
}
