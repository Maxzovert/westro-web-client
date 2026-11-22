"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/features/cart/CartContext";
import { ApiError } from "@/lib/api";

type AddToCartButtonProps = {
  variantId: string | undefined;
  disabled?: boolean;
};

export function AddToCartButton({ variantId, disabled }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    if (!variantId || busy) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await addItem(variantId, 1);
      setMessage("Added to cart");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not add to cart");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="add-to-cart">
      <button
        type="button"
        className="hero-cta add-to-cart-btn"
        disabled={!variantId || disabled || busy}
        onClick={() => void onClick()}
      >
        {busy ? "Adding…" : "Add to cart"}
      </button>
      {message ? (
        <p className="status-ok">
          {message}. <Link href="/cart">View cart</Link>
        </p>
      ) : null}
      {error ? <p className="inline-error">{error}</p> : null}
    </div>
  );
}
