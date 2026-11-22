"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { StateMessage } from "@/components/catalog/StateMessage";
import { useAuth } from "@/features/auth/AuthContext";
import { ApiError, api } from "@/lib/api";
import { formatInr } from "@/lib/money";
import type { StoreOrderDetail, StorePayment } from "@/types/store";

function CompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const orderId = searchParams.get("orderId");
  const paymentId = searchParams.get("paymentId");

  const [order, setOrder] = useState<StoreOrderDetail | null>(null);
  const [payment, setPayment] = useState<StorePayment | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/account/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !orderId) return;
    let cancelled = false;

    async function load() {
      try {
        const [orderData, paymentData] = await Promise.all([
          api.getOrder(orderId!),
          paymentId ? api.getPayment(paymentId).catch(() => null) : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setOrder(orderData);
        setPayment(paymentData);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Could not load payment status");
        }
      }
    }

    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 2500);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [user, orderId, paymentId]);

  if (loading || !user) {
    return <StateMessage title="Payment status" message="Loading…" />;
  }

  if (!orderId) {
    return <StateMessage title="Missing order" message="No order id was provided on return." />;
  }

  if (error && !order) {
    return <StateMessage title="Unable to load status" message={error} />;
  }

  if (!order) {
    return <StateMessage title="Payment status" message="Checking server status…" />;
  }

  const paid = order.status === "paid" || payment?.status === "captured";
  const failed = payment?.status === "failed";

  return (
    <section className="catalog-page">
      <header className="catalog-header">
        <div>
          <p className="hero-eyebrow">Checkout</p>
          <h1>{paid ? "Payment received" : failed ? "Payment failed" : "Awaiting confirmation"}</h1>
          <p className="catalog-lead">
            Order {order.orderNumber} · {formatInr(order.grandTotal, order.currency)}
          </p>
        </div>
      </header>

      <div className="account-panel">
        <p>
          Order status: <span className="status-pill">{order.status}</span>
        </p>
        <p>
          Payment status:{" "}
          <span className="status-pill">{payment?.status ?? order.paymentStatus ?? "pending"}</span>
        </p>
        {!paid && !failed ? (
          <p className="catalog-lead">
            This page only reads server state. Returning from the provider does not mark the order
            paid by itself.
          </p>
        ) : null}
        <div className="hero-actions">
          <Link href={`/account/orders/${order.id}`} className="hero-cta">
            View order
          </Link>
          {!paid && order.status === "pending" ? (
            <Link href={`/account/orders/${order.id}`} className="text-link">
              Retry payment from order
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default function CheckoutCompletePage() {
  return (
    <Suspense fallback={<StateMessage title="Payment status" message="Loading…" />}>
      <CompleteContent />
    </Suspense>
  );
}
