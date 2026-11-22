import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/catalog/ProductDetail";
import { StateMessage } from "@/components/catalog/StateMessage";
import { ApiError, api } from "@/lib/api";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  try {
    const [product, availability] = await Promise.all([
      api.getProduct(slug),
      api.getProductAvailability(slug).catch(() => null),
    ]);

    return (
      <section className="catalog-page">
        <Link href="/shop" className="text-link back-link">
          ← Back to shop
        </Link>
        <ProductDetail product={product} availability={availability} />
      </section>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    return (
      <StateMessage
        title="Unable to load product"
        message={error instanceof ApiError ? error.message : "Something went wrong"}
      />
    );
  }
}
