import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useI18n } from "../i18n/context";

export function LoginPage() {
  const { t } = useI18n();
  const { user, loading, signInEmail, signInGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signInEmail(email.trim(), password);
    } catch (err) {
      console.error(err);
      setError(t.errorGeneric);
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setError("");
    setBusy(true);
    try {
      await signInGoogle();
    } catch (err) {
      console.error(err);
      setError(t.errorGeneric);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img className="logo" src="/logo.png" alt="UDCH" />
        <h1>{t.loginTitle}</h1>
        <p className="sub">{t.loginSubtitle}</p>

        {error ? <div className="error-box">{error}</div> : null}

        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email">{t.loginEmail}</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">{t.loginPassword}</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn" type="submit" disabled={busy}>
            {busy ? t.loading : t.loginSubmit}
          </button>
        </form>

        <div className="divider">หรือ</div>

        <button className="btn secondary" type="button" onClick={onGoogle} disabled={busy}>
          {t.loginWithGoogle}
        </button>

        <p className="muted" style={{ textAlign: "center", marginTop: 18, fontSize: "0.95rem" }}>
          {t.loginNoAccount} <Link to="/register">{t.registerLink}</Link>
        </p>
      </div>
    </div>
  );
}
