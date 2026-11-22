"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { StateMessage } from "@/components/catalog/StateMessage";
import { useAuth } from "@/features/auth/AuthContext";
import { ApiError, api } from "@/lib/api";
import type { AddressInput, StoreAddress } from "@/types/store";

const emptyForm: AddressInput = {
  label: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "IN",
  addressType: "shipping",
  isDefault: false,
};

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [addresses, setAddresses] = useState<StoreAddress[]>([]);
  const [form, setForm] = useState<AddressInput>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/account/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void api
      .listAddresses()
      .then((items) => {
        if (!cancelled) setAddresses(items);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Could not load addresses");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading || !user) {
    return <StateMessage title="Account" message="Loading your account…" />;
  }

  async function onCreateAddress(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const created = await api.createAddress({
        ...form,
        label: form.label || null,
        line2: form.line2 || null,
        state: form.state || null,
        postalCode: form.postalCode || null,
      });
      setAddresses((current) => [created, ...current.filter((item) => !created.isDefault || !item.isDefault)]);
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save address");
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteAddress(id: string) {
    setBusy(true);
    setError(null);
    try {
      await api.deleteAddress(id);
      setAddresses((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete address");
    } finally {
      setBusy(false);
    }
  }

  async function onLogout() {
    await logout();
    router.push("/account/login");
  }

  return (
    <section className="catalog-page account-page">
      <header className="catalog-header">
        <div>
          <p className="hero-eyebrow">Account</p>
          <h1>{user.name}</h1>
          <p className="catalog-lead">{user.email}</p>
        </div>
        <button type="button" className="text-button" onClick={() => void onLogout()}>
          Sign out
        </button>
      </header>

      {error ? <p className="inline-error">{error}</p> : null}

      <section className="account-panel">
        <h2>Address book</h2>
        {addresses.length === 0 ? (
          <p className="catalog-lead">No saved addresses yet.</p>
        ) : (
          <ul className="address-list">
            {addresses.map((address) => (
              <li key={address.id} className="address-card">
                <div>
                  <strong>
                    {address.label || address.addressType}
                    {address.isDefault ? " · Default" : ""}
                  </strong>
                  <p>
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ""}
                  </p>
                  <p>
                    {address.city}
                    {address.state ? `, ${address.state}` : ""}
                    {address.postalCode ? ` ${address.postalCode}` : ""}
                  </p>
                  <p>{address.country}</p>
                </div>
                <button
                  type="button"
                  className="text-button"
                  disabled={busy}
                  onClick={() => void onDeleteAddress(address.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <form className="account-form" onSubmit={(event) => void onCreateAddress(event)}>
          <h3>Add address</h3>
          <label className="filter-field">
            <span>Label</span>
            <input
              value={form.label ?? ""}
              onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
              placeholder="Home / Clinic"
            />
          </label>
          <label className="filter-field">
            <span>Line 1</span>
            <input
              required
              value={form.line1}
              onChange={(event) => setForm((current) => ({ ...current, line1: event.target.value }))}
            />
          </label>
          <label className="filter-field">
            <span>Line 2</span>
            <input
              value={form.line2 ?? ""}
              onChange={(event) => setForm((current) => ({ ...current, line2: event.target.value }))}
            />
          </label>
          <div className="form-row">
            <label className="filter-field">
              <span>City</span>
              <input
                required
                value={form.city}
                onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
              />
            </label>
            <label className="filter-field">
              <span>State</span>
              <input
                value={form.state ?? ""}
                onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))}
              />
            </label>
          </div>
          <div className="form-row">
            <label className="filter-field">
              <span>Postal code</span>
              <input
                value={form.postalCode ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, postalCode: event.target.value }))
                }
              />
            </label>
            <label className="filter-field">
              <span>Country</span>
              <input
                required
                maxLength={2}
                value={form.country ?? "IN"}
                onChange={(event) =>
                  setForm((current) => ({ ...current, country: event.target.value.toUpperCase() }))
                }
              />
            </label>
          </div>
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={Boolean(form.isDefault)}
              onChange={(event) =>
                setForm((current) => ({ ...current, isDefault: event.target.checked }))
              }
            />
            <span>Default shipping address</span>
          </label>
          <button type="submit" className="hero-cta" disabled={busy}>
            {busy ? "Saving…" : "Save address"}
          </button>
        </form>
      </section>

      <p className="catalog-lead">
        <Link href="/account/orders">View orders</Link>
        {" · "}
        <Link href="/checkout">Checkout</Link>
      </p>
    </section>
  );
}
