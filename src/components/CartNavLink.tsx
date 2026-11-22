"use client";

import Link from "next/link";
import { useCart } from "@/features/cart/CartContext";

export function CartNavLink() {
  const { cart } = useCart();
  const count = cart?.itemCount ?? 0;

  return (
    <Link href="/cart" className="cart-nav-link">
      Cart{count > 0 ? ` (${count})` : ""}
    </Link>
  );
}
