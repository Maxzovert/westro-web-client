"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { ApiError, api } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.resetPassword({ token, password });
      router.push("/account/login");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Reset failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="account-form auth-form" onSubmit={(event) => void onSubmit(event)}>
      {error ? <p className="inline-error">{error}</p> : null}
      <label className="filter-field">
        <span>Reset token</span>
        <input
          required
          value={token}
          onChange={(event) => setToken(event.target.value)}
        />
      </label>
      <label className="filter-field">
        <span>New password</span>
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <button type="submit" className="hero-cta" disabled={busy}>
        {busy ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <section className="catalog-page auth-page">
      <header className="catalog-header">
        <div>
          <p className="hero-eyebrow">Account</p>
          <h1>Reset password</h1>
          <p className="catalog-lead">Choose a new password for your account.</p>
        </div>
      </header>

      <Suspense fallback={<p className="catalog-lead">Loading…</p>}>
        <ResetPasswordForm />
      </Suspense>

      <p className="catalog-lead">
        <Link href="/account/login">Back to sign in</Link>
      </p>
    </section>
  );
}
