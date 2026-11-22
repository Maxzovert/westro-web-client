import Link from "next/link";
import { formatInr } from "@/lib/money";
import type { StoreProductListItem } from "@/types/store";

type ProductCardProps = {
  product: StoreProductListItem;
};

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.primaryImageUrl;

  return (
    <article className="product-card">
      <Link href={`/shop/${product.slug}`} className="product-card-link">
        <div className="product-card-media">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={product.name} loading="lazy" />
          ) : (
            <div className="product-card-placeholder" aria-hidden="true">
              W
            </div>
          )}
        </div>
        <div className="product-card-body">
          {product.category ? (
            <p className="product-card-category">{product.category.name}</p>
          ) : null}
          <h3>{product.name}</h3>
          <p className="product-card-price">
            {product.fromPrice
              ? `From ${formatInr(product.fromPrice, product.currency)}`
              : "Price on request"}
          </p>
        </div>
      </Link>
    </article>
  );
}
