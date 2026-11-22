"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import type { ProductSort, StoreCategory } from "@/types/store";

type ProductFiltersProps = {
  categories: StoreCategory[];
  basePath?: string;
};

export function ProductFilters({ categories, basePath = "/shop" }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const currentCategory = searchParams.get("category") ?? "";
  const currentSort = (searchParams.get("sort") as ProductSort | null) ?? "newest";

  function pushParams(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (!value) params.delete(key);
      else params.set(key, value);
    }
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    pushParams({ search: search.trim() || undefined });
  }

  return (
    <form className="catalog-filters" onSubmit={onSubmit}>
      <label className="filter-field">
        <span>Search</span>
        <input
          type="search"
          name="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Name or SKU"
        />
      </label>

      <label className="filter-field">
        <span>Category</span>
        <select
          value={currentCategory}
          onChange={(event) => pushParams({ category: event.target.value || undefined })}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="filter-field">
        <span>Sort</span>
        <select
          value={currentSort}
          onChange={(event) =>
            pushParams({ sort: (event.target.value as ProductSort) || undefined })
          }
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </label>

      <button type="submit" className="filter-submit">
        Apply
      </button>
    </form>
  );
}
