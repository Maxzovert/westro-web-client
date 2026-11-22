"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { formatInr } from "@/lib/money";
import type { StoreAvailability, StoreProductDetail } from "@/types/store";

type ProductDetailProps = {
  product: StoreProductDetail;
  availability: StoreAvailability | null;
};

export function ProductDetail({ product, availability }: ProductDetailProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id ?? "");

  const availabilityMap = useMemo(() => {
    const map = new Map<string, { available: number; sellable: boolean }>();
    for (const row of availability?.variants ?? []) {
      map.set(row.variantId, { available: row.available, sellable: row.sellable });
    }
    return map;
  }, [availability]);

  const selected =
    product.variants.find((variant) => variant.id === selectedVariantId) ?? product.variants[0];

  const stock = selected ? availabilityMap.get(selected.id) : undefined;
  const sellable = Boolean(stock?.sellable || selected?.inStock);
  const primaryImage = product.images[0]?.url;

  return (
    <div className="product-detail">
      <div className="product-detail-media">
        {primaryImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={primaryImage} alt={product.name} />
        ) : (
          <div className="product-card-placeholder product-detail-placeholder" aria-hidden="true">
            W
          </div>
        )}
      </div>

      <div className="product-detail-info">
        {product.category ? (
          <Link href={`/categories/${product.category.slug}`} className="product-detail-category">
            {product.category.name}
          </Link>
        ) : null}

        <h1>{product.name}</h1>

        <p className="product-detail-price">
          {selected
            ? formatInr(selected.price, product.currency)
            : formatInr(product.variants[0]?.price ?? null, product.currency)}
        </p>

        {product.description ? <p className="product-detail-desc">{product.description}</p> : null}

        {product.variants.length > 0 ? (
          <label className="filter-field">
            <span>Variant</span>
            <select
              value={selected?.id ?? ""}
              onChange={(event) => setSelectedVariantId(event.target.value)}
            >
              {product.variants.map((variant) => {
                const attrs = Object.entries(variant.attributes)
                  .map(([key, value]) => `${key}: ${String(value)}`)
                  .join(", ");
                const label = attrs ? `${variant.sku} · ${attrs}` : variant.sku;
                return (
                  <option key={variant.id} value={variant.id}>
                    {label}
                  </option>
                );
              })}
            </select>
          </label>
        ) : null}

        <p className="product-stock">
          {!selected ? (
            "Availability unavailable"
          ) : sellable ? (
            selected.lowStock || (stock && stock.available > 0 && stock.available <= 5) ? (
              <>
                Low stock
                {stock ? ` · ${stock.available} available` : null}
              </>
            ) : (
              <>
                In stock
                {stock ? ` · ${stock.available} available` : null}
              </>
            )
          ) : (
            "Out of stock"
          )}
        </p>

        <AddToCartButton variantId={selected?.id} disabled={!sellable} />
      </div>
    </div>
  );
}
