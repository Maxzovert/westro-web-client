"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { StateMessage } from "@/components/catalog/StateMessage";
import { useAuth } from "@/features/auth/AuthContext";
import { ApiError, api } from "@/lib/api";
import { formatInr } from "@/lib/money";
import type { StoreOrderDetail } from "@/types/store";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [order, setOrder] = useState<StoreOrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/account/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !params.id) return;
    let cancelled = false;
    void api
      .getOrder(params.id)
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Could not load order");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user, params.id]);

  if (loading || !user) {
    return <StateMessage title="Order" message="Loading order…" />;
  }

  if (error) {
    return <StateMessage title="Unable to load order" message={error} />;
  }

  if (!order) {
    return <StateMessage title="Order" message="Loading order…" />;
  }

  async function startPayment() {
    if (!order) return;
    setPaying(true);
    setError(null);
    try {
      const returnUrl = `${window.location.origin}/checkout/complete?orderId=${order.id}`;
      const payment = await api.createPayment(
        { orderId: order.id, returnUrl },
        `pay-order-${order.id}-${Date.now()}`,
      );
      window.location.href = payment.redirectUrl;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not start payment");
      setPaying(false);
    }
  }

  const address = order.shippingAddress;

  return (
    <section className="catalog-page">
      <Link href="/account/orders" className="text-link back-link">
        ← All orders
      </Link>

      <header className="catalog-header">
        <div>
          <p className="hero-eyebrow">Order</p>
          <h1>{order.orderNumber}</h1>
          <p className="catalog-lead">
            Placed {new Date(order.placedAt).toLocaleString()} ·{" "}
            <span className="status-pill">{order.status}</span>
          </p>
        </div>
      </header>

      <div className="checkout-layout">
        <div className="checkout-main">
          <section className="account-panel">
            <h2>Items</h2>
            <ul className="checkout-lines">
              {order.items.map((item) => (
                <li key={item.id}>
                  <span>
                    {item.name} · {item.sku} × {item.quantity}
                  </span>
                  <strong>{formatInr(item.lineTotal, order.currency)}</strong>
                </li>
              ))}
            </ul>
          </section>

          {address ? (
            <section className="account-panel">
              <h2>Shipping address</h2>
              <p>
                {String(address.line1 ?? "")}
                {address.line2 ? `, ${String(address.line2)}` : ""}
              </p>
              <p>
                {String(address.city ?? "")}
                {address.state ? `, ${String(address.state)}` : ""}
                {address.postalCode ? ` ${String(address.postalCode)}` : ""}
              </p>
              <p>{String(address.country ?? "")}</p>
            </section>
          ) : null}
        </div>

        <aside className="cart-summary">
          <h2>Totals</h2>
          <dl className="cart-totals">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatInr(order.subtotal, order.currency)}</dd>
            </div>
            <div>
              <dt>Discount</dt>
              <dd>{formatInr(order.discountTotal, order.currency)}</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd>{formatInr(order.shippingTotal, order.currency)}</dd>
            </div>
            <div>
              <dt>Tax</dt>
              <dd>{formatInr(order.taxTotal, order.currency)}</dd>
            </div>
            <div className="cart-grand">
              <dt>Total</dt>
              <dd>{formatInr(order.grandTotal, order.currency)}</dd>
            </div>
          </dl>
          <p className="catalog-lead">
            Payment: {order.paymentStatus ?? (order.status === "pending" ? "required" : "n/a")}
          </p>
          {order.status === "pending" ? (
            <button
              type="button"
              className="hero-cta checkout-submit"
              disabled={paying}
              onClick={() => void startPayment()}
            >
              {paying ? "Starting…" : "Pay now"}
            </button>
          ) : null}
          {order.shipment ? (
            <p className="catalog-lead">
              Shipment: {order.shipment.status}
              {order.shipment.trackingNumber
                ? ` · ${order.shipment.trackingNumber}`
                : null}
            </p>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
