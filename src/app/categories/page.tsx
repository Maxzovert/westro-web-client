import Link from "next/link";
import { StateMessage } from "@/components/catalog/StateMessage";
import { ApiError, api } from "@/lib/api";

export default async function CategoriesPage() {
  try {
    const { items } = await api.listCategories({ pageSize: 50 });

    return (
      <section className="catalog-page">
        <header className="catalog-header">
          <div>
            <p className="hero-eyebrow">Browse</p>
            <h1>Categories</h1>
            <p className="catalog-lead">Explore active collections from the shared catalog.</p>
          </div>
          <Link href="/shop" className="text-link">
            All products
          </Link>
        </header>

        {items.length === 0 ? (
          <StateMessage
            title="No categories yet"
            message="Active categories will appear here once published in Admin."
          />
        ) : (
          <ul className="category-grid">
            {items.map((category) => (
              <li key={category.id}>
                <Link href={`/categories/${category.slug}`} className="category-card">
                  <h2>{category.name}</h2>
                  <span>Shop {category.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  } catch (error) {
    return (
      <StateMessage
        title="Unable to load categories"
        message={error instanceof ApiError ? error.message : "Something went wrong"}
      />
    );
  }
}
