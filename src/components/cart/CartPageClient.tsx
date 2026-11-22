"use client";

import Link from "next/link";
import { useState } from "react";
import { StateMessage } from "@/components/catalog/StateMessage";
import { useCart } from "@/features/cart/CartContext";
import { ApiError } from "@/lib/api";
import { formatInr } from "@/lib/money";

export function CartPageClient() {
  const { cart, loading, error, updateItem, removeItem, clear, refreshing } = useCart();
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function runAction(itemId: string | "clear", action: () => Promise<unknown>) {
    setBusyId(itemId);
    setActionError(null);
    try {
      await action();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Cart update failed");
    } finally {
      setBusyId(null);
    }
  }

  if (loading && !cart) {
    return <StateMessage title="Loading cart" message="Fetching your cart from the server…" />;
  }

  if (error && !cart) {
    return <StateMessage title="Unable to load cart" message={error} />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="cart-empty">
        <StateMessage
          title="Your cart is empty"
          message="Browse the catalog and add active products to get started."
        />
        <Link href="/shop" className="hero-cta">
          Shop collection
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-layout">
      <div className="cart-lines">
        {actionError ? <p className="inline-error">{actionError}</p> : null}
        {error ? <p className="inline-error">{error}</p> : null}

        <ul className="cart-line-list">
          {cart.items.map((item) => (
            <li key={item.id} className="cart-line">
              <div className="cart-line-media">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.name} />
                ) : (
                  <div className="product-card-placeholder" aria-hidden="true">
                    W
                  </div>
                )}
              </div>

              <div className="cart-line-body">
                <Link href={`/shop/${item.productSlug}`} className="cart-line-name">
                  {item.name}
                </Link>
                <p className="cart-line-meta">SKU {item.sku}</p>
                <p className="cart-line-meta">
                  {formatInr(item.unitPrice, cart.currency)} each
                  {!item.sellable ? " · unavailable" : item.available < item.quantity ? " · low stock" : null}
                </p>

                <div className="cart-line-actions">
                  <label className="qty-field">
                    <span className="sr-only">Quantity</span>
                    <input
                      type="number"
                      min={1}
                      max={Math.max(item.available, item.quantity)}
                      value={item.quantity}
                      disabled={busyId === item.id || refreshing}
                      onChange={(event) => {
                        const next = Number(event.target.value);
                        if (!Number.isFinite(next) || next < 1) return;
                        void runAction(item.id, () => updateItem(item.id, next));
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    className="text-button"
                    disabled={busyId === item.id}
                    onClick={() => void runAction(item.id, () => removeItem(item.id))}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <p className="cart-line-total">{formatInr(item.lineTotal, cart.currency)}</p>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="text-button"
          disabled={busyId === "clear"}
          onClick={() => void runAction("clear", () => clear())}
        >
          Clear cart
        </button>
      </div>

      <aside className="cart-summary">
        <h2>Order summary</h2>
        <dl className="cart-totals">
          <div>
            <dt>Subtotal</dt>
            <dd>{formatInr(cart.subtotal, cart.currency)}</dd>
          </div>
          <div>
            <dt>Shipping</dt>
            <dd>{formatInr(cart.shippingTotal, cart.currency)}</dd>
          </div>
          <div>
            <dt>Tax</dt>
            <dd>{formatInr(cart.taxTotal, cart.currency)}</dd>
          </div>
          <div className="cart-grand">
            <dt>Total</dt>
            <dd>{formatInr(cart.grandTotal, cart.currency)}</dd>
          </div>
        </dl>
        <Link href="/checkout" className="hero-cta checkout-submit">
          Checkout
        </Link>
      </aside>
    </div>
  );
}
