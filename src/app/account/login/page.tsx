"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { ApiError } from "@/lib/api";

type Mode = "otp" | "email";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login, loginWithOtp, requestOtp } = useAuth();
  const [mode, setMode] = useState<Mode>("otp");

  const [phone, setPhone] = useState("9999900000");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/account");
  }, [loading, user, router]);

  async function onRequestOtp(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await requestOtp(phone);
      setOtpSent(true);
      setDevOtpHint(result.devOtp ?? null);
      if (result.devOtp) setOtp(result.devOtp);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send OTP");
    } finally {
      setBusy(false);
    }
  }

  async function onVerifyOtp(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await loginWithOtp(phone, otp);
      router.push("/account");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "OTP sign in failed");
    } finally {
      setBusy(false);
    }
  }

  async function onEmailLogin(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      router.push("/account");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="catalog-page auth-page">
      <header className="catalog-header">
        <div>
          <p className="hero-eyebrow">Account</p>
          <h1>Sign in</h1>
          <p className="catalog-lead">
            Dev OTP login uses phone <strong>9999900000</strong> and OTP <strong>959945</strong>.
          </p>
        </div>
      </header>

      <div className="auth-mode-tabs" role="tablist" aria-label="Sign in method">
        <button
          type="button"
          className={mode === "otp" ? "auth-mode-tab is-active" : "auth-mode-tab"}
          onClick={() => setMode("otp")}
        >
          Phone OTP
        </button>
        <button
          type="button"
          className={mode === "email" ? "auth-mode-tab is-active" : "auth-mode-tab"}
          onClick={() => setMode("email")}
        >
          Email
        </button>
      </div>

      {mode === "otp" ? (
        <form
          className="account-form auth-form"
          onSubmit={(event) => void (otpSent ? onVerifyOtp(event) : onRequestOtp(event))}
        >
          {error ? <p className="inline-error">{error}</p> : null}
          {otpSent ? <p className="status-ok">OTP sent{devOtpHint ? ` · ${devOtpHint}` : ""}</p> : null}

          <label className="filter-field">
            <span>Phone</span>
            <input
              inputMode="numeric"
              required
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="9999900000"
            />
          </label>

          {otpSent ? (
            <label className="filter-field">
              <span>OTP</span>
              <input
                inputMode="numeric"
                required
                autoComplete="one-time-code"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder="959945"
              />
            </label>
          ) : null}

          <button type="submit" className="hero-cta" disabled={busy}>
            {busy ? "Please wait…" : otpSent ? "Verify & sign in" : "Send OTP"}
          </button>

          {otpSent ? (
            <button
              type="button"
              className="text-button"
              disabled={busy}
              onClick={() => {
                setOtpSent(false);
                setDevOtpHint(null);
                setOtp("");
              }}
            >
              Change phone / resend
            </button>
          ) : null}
        </form>
      ) : (
        <form className="account-form auth-form" onSubmit={(event) => void onEmailLogin(event)}>
          {error ? <p className="inline-error">{error}</p> : null}
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
          <label className="filter-field">
            <span>Password</span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button type="submit" className="hero-cta" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      )}

      <p className="catalog-lead">
        <Link href="/account/register">Create an account</Link>
        {" · "}
        <Link href="/account/forgot-password">Forgot password</Link>
      </p>
    </section>
  );
}