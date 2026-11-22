"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { StateMessage } from "@/components/catalog/StateMessage";
import { useAuth } from "@/features/auth/AuthContext";
import { ApiError, api } from "@/lib/api";
import { formatInr } from "@/lib/money";
import type { StorePayment } from "@/types/store";

function MockPayForm() {
  const params = useParams<{ paymentId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [payment, setPayment] = useState<StorePayment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const returnUrl =
    searchParams.get("returnUrl") ||
    (payment ? `/checkout/complete?orderId=${payment.orderId}&paymentId=${payment.id}` : "/account/orders");

  useEffect(() => {
    if (!loading && !user) router.replace("/account/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !params.paymentId) return;
    let cancelled = false;
    void api
      .getPayment(params.paymentId)
      .then((data) => {
        if (!cancelled) setPayment(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Could not load payment");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user, params.paymentId]);

  async function confirm(outcome: "captured" | "failed") {
    if (!payment) return;
    setBusy(true);
    setError(null);
    try {
      // Simulates provider confirmation server-side. Redirect alone does not mark paid.
      await api.mockConfirmPayment({ paymentId: payment.id, outcome });
      router.push(returnUrl);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Payment simulation failed");
      setBusy(false);
    }
  }

  if (loading || !user) {
    return <StateMessage title="Payment" message="Loading payment…" />;
  }

  if (error && !payment) {
    return <StateMessage title="Unable to load payment" message={error} />;
  }

  if (!payment) {
    return <StateMessage title="Payment" message="Loading payment…" />;
  }

  if (payment.status !== "pending") {
    return (
      <section className="catalog-page">
        <StateMessage
          title="Payment already processed"
          message={`Status: ${payment.status}. Returning to order status won’t change this.`}
        />
        <Link href={returnUrl} className="hero-cta">
          Continue
        </Link>
      </section>
    );
  }

  return (
    <section className="catalog-page auth-page">
      <header className="catalog-header">
        <div>
          <p className="hero-eyebrow">Mock provider</p>
          <h1>Complete payment</h1>
          <p className="catalog-lead">
            Order {payment.orderNumber} · {formatInr(payment.amount, payment.currency)}
          </p>
        </div>
      </header>

      {error ? <p className="inline-error">{error}</p> : null}

      <div className="account-panel auth-form">
        <p className="catalog-lead">
          This page simulates a hosted payment provider. Paying calls the server capture path —
          merely visiting the return URL cannot mark the order paid.
        </p>
        <button
          type="button"
          className="hero-cta"
          disabled={busy}
          onClick={() => void confirm("captured")}
        >
          {busy ? "Processing…" : "Pay now (mock success)"}
        </button>
        <button
          type="button"
          className="text-button"
          disabled={busy}
          onClick={() => void confirm("failed")}
        >
          Simulate failure
        </button>
        <Link href={returnUrl} className="text-link">
          Cancel and return without paying
        </Link>
      </div>
    </section>
  );
}

export default function CheckoutPayPage() {
  return (
    <Suspense fallback={<StateMessage title="Payment" message="Loading…" />}>
      <MockPayForm />
    </Suspense>
  );
}
