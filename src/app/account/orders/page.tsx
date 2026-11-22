"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { StateMessage } from "@/components/catalog/StateMessage";
import { useAuth } from "@/features/auth/AuthContext";
import { ApiError, api } from "@/lib/api";
import { formatInr } from "@/lib/money";
import type { StoreOrderListItem } from "@/types/store";

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<StoreOrderListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/account/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void api
      .listOrders({ pageSize: 50 })
      .then((result) => {
        if (!cancelled) setOrders(result.items);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Could not load orders");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading || !user) {
    return <StateMessage title="Orders" message="Loading your orders…" />;
  }

  return (
    <section className="catalog-page">
      <header className="catalog-header">
        <div>
          <p className="hero-eyebrow">Account</p>
          <h1>Orders</h1>
          <p className="catalog-lead">Your order history from the storefront.</p>
        </div>
        <Link href="/account" className="text-link">
          Back to account
        </Link>
      </header>

      {error ? <p className="inline-error">{error}</p> : null}

      {orders.length === 0 ? (
        <StateMessage title="No orders yet" message="Orders you place will show up here." />
      ) : (
        <ul className="order-list">
          {orders.map((order) => (
            <li key={order.id}>
              <Link href={`/account/orders/${order.id}`} className="order-card">
                <div>
                  <strong>{order.orderNumber}</strong>
                  <p>
                    {new Date(order.placedAt).toLocaleString()} · {order.itemCount} items
                  </p>
                </div>
                <div className="order-card-meta">
                  <span className="status-pill">{order.status}</span>
                  <strong>{formatInr(order.totalAmount, order.currency)}</strong>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
