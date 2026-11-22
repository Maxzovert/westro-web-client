import { CartPageClient } from "@/components/cart/CartPageClient";

export default function CartPage() {
  return (
    <section className="catalog-page">
      <header className="catalog-header">
        <div>
          <p className="hero-eyebrow">Bag</p>
          <h1>Cart</h1>
          <p className="catalog-lead">Quantities and totals come from the store API.</p>
        </div>
      </header>
      <CartPageClient />
    </section>
  );
}
