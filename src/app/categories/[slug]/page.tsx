import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/catalog/ProductCard";
import { StateMessage } from "@/components/catalog/StateMessage";
import { ApiError, api } from "@/lib/api";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  try {
    const [category, products] = await Promise.all([
      api.getCategory(slug),
      api.listProducts({ categorySlug: slug, pageSize: 24, sort: "newest" }),
    ]);

    return (
      <section className="catalog-page">
        <Link href="/categories" className="text-link back-link">
          ← All categories
        </Link>

        <header className="catalog-header">
          <div>
            <p className="hero-eyebrow">Category</p>
            <h1>{category.name}</h1>
            <p className="catalog-lead">Active products in this collection.</p>
          </div>
          <Link href={`/shop?category=${encodeURIComponent(category.slug)}`} className="text-link">
            Open in shop filters
          </Link>
        </header>

        {products.items.length === 0 ? (
          <StateMessage
            title="No products in this category"
            message="Publish active products under this category in Admin to show them here."
          />
        ) : (
          <div className="product-grid">
            {products.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    return (
      <StateMessage
        title="Unable to load category"
        message={error instanceof ApiError ? error.message : "Something went wrong"}
      />
    );
  }
}
