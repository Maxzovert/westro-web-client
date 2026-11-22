import Link from "next/link";
import { ProductCard } from "@/components/catalog/ProductCard";
import { api } from "@/lib/api";

export default async function HomePage() {
  let loadFailed = false;
  const featured = await api.listProducts({ pageSize: 4, sort: "newest" }).catch(() => {
    loadFailed = true;
    return { items: [], pagination: undefined };
  });

  return (
    <>
      <section className="hero">
        <p className="hero-eyebrow">Medical Apparel | Equipment | More</p>
        <h1>Wastro</h1>
        <p>Premium medical apparel for professionals — comfort, performance, and trust.</p>
        <div className="hero-actions">
          <Link href="/shop" className="hero-cta">
            Shop collection
          </Link>
          <Link href="/categories" className="text-link">
            Browse categories
          </Link>
        </div>
      </section>

      <section className="home-featured" aria-labelledby="featured-heading">
        <div className="catalog-header">
          <div>
            <p className="hero-eyebrow">New</p>
            <h2 id="featured-heading">Featured products</h2>
          </div>
          <Link href="/shop" className="text-link">
            View all
          </Link>
        </div>

        {featured.items.length === 0 ? (
          <p className="catalog-lead">
            {loadFailed
              ? "Catalog API unavailable. Start the Website server on :4001."
              : "Active products from Admin will appear here."}
          </p>
        ) : (
          <div className="product-grid">
            {featured.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
