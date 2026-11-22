"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ApiError, api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    setDevToken(null);
    try {
      const result = await api.forgotPassword(email);
      setMessage(result.message);
      setDevToken(result.devResetToken ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="catalog-page auth-page">
      <header className="catalog-header">
        <div>
          <p className="hero-eyebrow">Account</p>
          <h1>Forgot password</h1>
          <p className="catalog-lead">We will email a reset link if the account exists.</p>
        </div>
      </header>

      <form className="account-form auth-form" onSubmit={(event) => void onSubmit(event)}>
        {error ? <p className="inline-error">{error}</p> : null}
        {message ? <p className="status-ok">{message}</p> : null}
        {devToken ? (
          <p className="catalog-lead">
            Dev token ready —{" "}
            <Link href={`/account/reset-password?token=${encodeURIComponent(devToken)}`}>
              continue to reset
            </Link>
          </p>
        ) : null}
        <label className="filter-field">
          <span>Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <button type="submit" className="hero-cta" disabled={busy}>
          {busy ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="catalog-lead">
        <Link href="/account/login">Back to sign in</Link>
      </p>
    </section>
  );
}
