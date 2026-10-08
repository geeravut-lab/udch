import { Link } from "react-router-dom";
import { useI18n } from "../i18n/context";
import { useNotifications } from "../hooks/useNotifications";
import { formatThaiDate } from "../lib/converters";

export function NotificationsPage() {
  const { t } = useI18n();
  const { notifications, loading, markRead } = useNotifications();

  return (
    <div className="page">
      <h3 className="pf" style={{ marginBottom: 12 }}>
        🔔 {t.notifTitle}
      </h3>
      {loading && <p className="muted">{t.loading}</p>}
      {!loading && notifications.length === 0 && (
        <div className="empty">{t.notifEmpty}</div>
      )}
      {notifications.map((n) => (
        <div
          key={n.id}
          className="card"
          style={{
            opacity: n.status === "read" ? 0.7 : 1,
            borderLeft: n.status === "read" ? undefined : "6px solid var(--teal)",
          }}
        >
          <div className="pf" style={{ fontSize: "1rem" }}>
            {n.title}
          </div>
          {n.body && <p className="muted" style={{ fontSize: "0.9rem" }}>{n.body}</p>}
          <small className="muted">{formatThaiDate(n.createdAt, true)}</small>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            {n.link && (
              <Link to={n.link} className="btn sm secondary" onClick={() => markRead(n.id)}>
                เปิด
              </Link>
            )}
            {n.status !== "read" && (
              <button type="button" className="btn sm ghost" onClick={() => markRead(n.id)}>
                อ่านแล้ว
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
