import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Home, CalendarDays, FileHeart, MessageCircle, User } from "lucide-react";
import { useI18n } from "../i18n/context";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "../hooks/useNotifications";

const nav = [
  { to: "/", key: "navHome" as const, icon: Home, end: true },
  { to: "/appointments", key: "navAppointments" as const, icon: CalendarDays },
  { to: "/results", key: "navResults" as const, icon: FileHeart },
  { to: "/messages", key: "navMessages" as const, icon: MessageCircle, badge: true },
  { to: "/me", key: "navMe" as const, icon: User },
];

export function AppShell() {
  const { t } = useI18n();
  const { profile } = useAuth();
  const { unread } = useNotifications();
  const location = useLocation();
  const initial = (profile?.fullName || profile?.email || "?").trim().charAt(0).toUpperCase();
  const hideHeavyHeader = ["/medications", "/documents", "/notifications"].some((p) =>
    location.pathname.startsWith(p),
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div style={{ padding: "8px 14px 16px", display: "flex", gap: 10, alignItems: "center" }}>
          <img src="/logo.png" alt="" width={40} height={40} />
          <div>
            <div className="pf" style={{ fontSize: "1rem" }}>{t.appName}</div>
            <small className="muted" style={{ fontSize: "0.75rem", lineHeight: 1.3 }}>{t.hospitalName}</small>
          </div>
        </div>
        {nav.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? "active" : "")}>
            <item.icon size={20} />
            {t[item.key]}
            {item.badge && unread > 0 ? <span className="nav-badge">{unread > 9 ? "9+" : unread}</span> : null}
          </NavLink>
        ))}
      </aside>

      <div className="main">
        <header className="top-bar">
          <div className="row">
            <div>
              <h1>{t.appName}</h1>
              {!hideHeavyHeader && (
                <div className="greeting">
                  {t.dashGreeting}
                  {profile?.fullName ? ` ${profile.fullName.split(" ")[0]}` : ""}
                </div>
              )}
            </div>
            <div className="avatar" aria-hidden>{initial}</div>
          </div>
        </header>
        <Outlet />
      </div>

      <nav className="bottom-nav" aria-label="Main">
        {nav.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? "active" : "")}>
            <item.icon size={22} />
            {t[item.key]}
            {item.badge && unread > 0 ? <span className="nav-badge">{unread > 9 ? "9+" : unread}</span> : null}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
