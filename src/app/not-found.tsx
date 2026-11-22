import Link from "next/link";

export default function NotFound() {
  return (
    <section className="catalog-page">
      <div className="state-message">
        <h1>Page not found</h1>
        <p>That product or category is not available in the storefront catalog.</p>
        <Link href="/shop" className="hero-cta">
          Back to shop
        </Link>
      </div>
    </section>
  );
}
