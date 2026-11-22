"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { StateMessage } from "@/components/catalog/StateMessage";
import { useAuth } from "@/features/auth/AuthContext";
import { useCart } from "@/features/cart/CartContext";
import { ApiError, api } from "@/lib/api";
import { formatInr } from "@/lib/money";
import type { CheckoutQuote, ShippingOption, StoreAddress } from "@/types/store";

function createIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `order-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { cart, loading: cartLoading, refreshCart } = useCart();

  const [addresses, setAddresses] = useState<StoreAddress[]>([]);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [addressId, setAddressId] = useState("");
  const [shippingMethodId, setShippingMethodId] = useState("standard");
  const [couponCode, setCouponCode] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [idempotencyKey] = useState(createIdempotencyKey);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/account/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void (async () => {
      try {
        const [addressList, options] = await Promise.all([
          api.listAddresses(),
          api.getShippingOptions(),
        ]);
        if (cancelled) return;
        setAddresses(addressList);
        setShippingOptions(options);
        const defaultAddress =
          addressList.find((item) => item.isDefault) ?? addressList[0] ?? null;
        if (defaultAddress) setAddressId(defaultAddress.id);
        if (options[0]) setShippingMethodId(options[0].id);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Could not load checkout");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user || !addressId || !shippingMethodId) {
      setQuote(null);
      return;
    }
    if (!cart || cart.items.length === 0) {
      setQuote(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const next = await api.getCheckoutQuote({
          addressId,
          shippingMethodId,
          couponCode: couponCode.trim() || null,
        });
        if (!cancelled) {
          setQuote(next);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setQuote(null);
          setError(err instanceof ApiError ? err.message : "Could not quote checkout");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, addressId, shippingMethodId, couponCode, cart]);

  const canPlace = useMemo(
    () => Boolean(user && addressId && shippingMethodId && quote && cart && cart.items.length > 0),
    [user, addressId, shippingMethodId, quote, cart],
  );

  async function onPlaceOrder(event: FormEvent) {
    event.preventDefault();
    if (!canPlace) return;
    setBusy(true);
    setError(null);
    try {
      const result = await api.placeOrder(
        {
          addressId,
          shippingMethodId,
          couponCode: couponCode.trim() || null,
          customerNote: customerNote.trim() || null,
        },
        idempotencyKey,
      );
      await refreshCart();

      if (result.paymentRequired) {
        const returnUrl = `${window.location.origin}/checkout/complete?orderId=${result.orderId}`;
        const payment = await api.createPayment(
          { orderId: result.orderId, returnUrl },
          `pay-${idempotencyKey}`,
        );
        window.location.href = payment.redirectUrl;
        return;
      }

      router.push(`/account/orders/${result.orderId}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not place order");
    } finally {
      setBusy(false);
    }
  }

  if (authLoading || cartLoading) {
    return <StateMessage title="Checkout" message="Loading checkout…" />;
  }

  if (!user) {
    return <StateMessage title="Checkout" message="Sign in required." />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <section className="catalog-page">
        <StateMessage title="Cart is empty" message="Add products before checking out." />
        <Link href="/shop" className="hero-cta">
          Shop collection
        </Link>
      </section>
    );
  }

  return (
    <section className="catalog-page checkout-page">
      <header className="catalog-header">
        <div>
          <p className="hero-eyebrow">Checkout</p>
          <h1>Place order</h1>
          <p className="catalog-lead">Totals are calculated by the server from your live cart.</p>
        </div>
        <Link href="/cart" className="text-link">
          Back to cart
        </Link>
      </header>

      {error ? <p className="inline-error">{error}</p> : null}

      {addresses.length === 0 ? (
        <StateMessage
          title="Add a shipping address"
          message="Save an address in your account before placing an order."
        />
      ) : null}

      <form className="checkout-layout" onSubmit={(event) => void onPlaceOrder(event)}>
        <div className="checkout-main">
          <section className="account-panel">
            <h2>Shipping address</h2>
            <label className="filter-field">
              <span>Address</span>
              <select
                required
                value={addressId}
                onChange={(event) => setAddressId(event.target.value)}
              >
                <option value="" disabled>
                  Select address
                </option>
                {addresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.label || address.line1} · {address.city}
                  </option>
                ))}
              </select>
            </label>
            <Link href="/account" className="text-link">
              Manage addresses
            </Link>
          </section>

          <section className="account-panel">
            <h2>Shipping method</h2>
            <div className="shipping-options">
              {shippingOptions.map((option) => (
                <label key={option.id} className="shipping-option">
                  <input
                    type="radio"
                    name="shippingMethod"
                    value={option.id}
                    checked={shippingMethodId === option.id}
                    onChange={() => setShippingMethodId(option.id)}
                  />
                  <span>
                    <strong>
                      {option.name} · {formatInr(option.amount, option.currency)}
                    </strong>
                    <em>{option.description}</em>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="account-panel">
            <h2>Extras</h2>
            <label className="filter-field">
              <span>Coupon code</span>
              <input
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                placeholder="WELCOME10"
              />
            </label>
            <label className="filter-field">
              <span>Order note</span>
              <input
                value={customerNote}
                onChange={(event) => setCustomerNote(event.target.value)}
                placeholder="Optional delivery note"
              />
            </label>
          </section>
        </div>

        <aside className="cart-summary">
          <h2>Order summary</h2>
          <ul className="checkout-lines">
            {(quote?.lines ?? cart.items.map((item) => ({
              variantId: item.variantId,
              sku: item.sku,
              name: item.name,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              lineTotal: item.lineTotal,
            }))).map((line) => (
              <li key={`${line.variantId}-${line.sku}`}>
                <span>
                  {line.name} × {line.quantity}
                </span>
                <strong>{formatInr(line.lineTotal, quote?.currency ?? cart.currency)}</strong>
              </li>
            ))}
          </ul>
          <dl className="cart-totals">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatInr(quote?.subtotal ?? cart.subtotal, cart.currency)}</dd>
            </div>
            <div>
              <dt>Discount</dt>
              <dd>{formatInr(quote?.discountTotal ?? "0.00", cart.currency)}</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd>{formatInr(quote?.shippingTotal ?? "0.00", cart.currency)}</dd>
            </div>
            <div>
              <dt>Tax</dt>
              <dd>{formatInr(quote?.taxTotal ?? "0.00", cart.currency)}</dd>
            </div>
            <div className="cart-grand">
              <dt>Total</dt>
              <dd>{formatInr(quote?.grandTotal ?? cart.grandTotal, cart.currency)}</dd>
            </div>
          </dl>
          <button type="submit" className="hero-cta checkout-submit" disabled={!canPlace || busy}>
            {busy ? "Placing order…" : "Place order"}
          </button>
          <p className="product-detail-note">Payment provider flow arrives in the next phase.</p>
        </aside>
      </form>
    </section>
  );
}
