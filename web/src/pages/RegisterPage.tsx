import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useI18n } from "../i18n/context";

export function RegisterPage() {
  const { t } = useI18n();
  const { user, loading, signUpEmail } = useAuth();
  const [fullName, setFullName] = useState("");
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
      await signUpEmail(email.trim(), password, fullName.trim());
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
        <h1>{t.registerTitle}</h1>
        <p className="sub">{t.appTagline}</p>

        {error ? <div className="error-box">{error}</div> : null}

        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="name">{t.registerName}</label>
            <input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          <button className="btn" type="submit" disabled={busy}>
            {busy ? t.loading : t.registerSubmit}
          </button>
        </form>

        <p className="muted" style={{ textAlign: "center", marginTop: 18, fontSize: "0.95rem" }}>
          {t.registerHasAccount} <Link to="/login">{t.loginTitle}</Link>
        </p>
      </div>
    </div>
  );
}
