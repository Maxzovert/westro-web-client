import Link from "next/link";
import { Suspense } from "react";
import { Pagination } from "@/components/catalog/Pagination";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductFilters } from "@/components/catalog/ProductFilters";
import { StateMessage } from "@/components/catalog/StateMessage";
import { ApiError, api } from "@/lib/api";
import type { ProductSort } from "@/types/store";

type ShopPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    sort?: string;
  }>;
};

function buildShopHref(params: {
  page?: number;
  search?: string;
  category?: string;
  sort?: string;
}) {
  const query = new URLSearchParams();
  if (params.page && params.page > 1) query.set("page", String(params.page));
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.sort && params.sort !== "newest") query.set("sort", params.sort);
  const qs = query.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.search?.trim() || undefined;
  const categorySlug = params.category?.trim() || undefined;
  const sort = (params.sort as ProductSort | undefined) || "newest";

  let categoriesError: string | null = null;
  let productsError: string | null = null;

  const [categoriesResult, productsResult] = await Promise.all([
    api.listCategories({ pageSize: 50 }).catch((error: unknown) => {
      categoriesError =
        error instanceof ApiError ? error.message : "Could not load categories";
      return { items: [], pagination: undefined };
    }),
    api
      .listProducts({
        page,
        pageSize: 12,
        search,
        categorySlug,
        sort,
      })
      .catch((error: unknown) => {
        productsError =
          error instanceof ApiError ? error.message : "Could not load products";
        return { items: [], pagination: undefined };
      }),
  ]);

  const pagination = productsResult.pagination;

  return (
    <section className="catalog-page">
      <header className="catalog-header">
        <div>
          <p className="hero-eyebrow">Catalog</p>
          <h1>Shop</h1>
          <p className="catalog-lead">
            Browse active medical apparel and equipment from the live catalog.
          </p>
        </div>
        <Link href="/categories" className="text-link">
          View categories
        </Link>
      </header>

      <Suspense fallback={<div className="catalog-filters is-loading">Loading filters…</div>}>
        <ProductFilters categories={categoriesResult.items} />
      </Suspense>

      {categoriesError ? (
        <p className="inline-error">Categories: {categoriesError}</p>
      ) : null}

      {productsError ? (
        <StateMessage title="Unable to load products" message={productsError} />
      ) : productsResult.items.length === 0 ? (
        <StateMessage
          title="No products found"
          message="Try another search, category, or check back after Admin publishes active products."
        />
      ) : (
        <>
          <div className="product-grid">
            {productsResult.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {pagination ? (
            <Pagination
              pagination={pagination}
              hrefForPage={(nextPage) =>
                buildShopHref({
                  page: nextPage,
                  search,
                  category: categorySlug,
                  sort,
                })
              }
            />
          ) : null}
        </>
      )}
    </section>
  );
}
