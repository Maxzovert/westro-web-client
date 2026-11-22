export type HealthResponse = {
  status: "ok" | "degraded";
  service: string;
  database: "up" | "down";
  timestamp: string;
};

export type StoreMeta = {
  storeName: string;
  apiVersion: string;
  currency: string;
  supportEmail: string;
  descriptor: string;
  features: {
    guestCheckout: boolean;
    cod: boolean;
    maintenanceMode: boolean;
  };
};

export type StoreCsrfResponse = {
  csrfToken: string;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type StoreCategory = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
};

export type StoreProductListItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: { id: string; name: string; slug: string } | null;
  fromPrice: string | null;
  currency: string;
  primaryImageUrl: string | null;
  variantsCount: number;
};

export type StoreProductVariant = {
  id: string;
  sku: string;
  price: string;
  compareAtPrice: string | null;
  attributes: Record<string, unknown>;
  inStock: boolean;
  lowStock: boolean;
};

export type StoreProductImage = {
  id: string;
  url: string;
  sortOrder: number;
  variantId: string | null;
};

export type StoreProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: { id: string; name: string; slug: string } | null;
  currency: string;
  variants: StoreProductVariant[];
  images: StoreProductImage[];
  inStock: boolean;
  lowStock: boolean;
};

export type StoreAvailability = {
  variants: Array<{
    variantId: string;
    sku: string;
    available: number;
    sellable: boolean;
  }>;
};

export type ProductSort = "newest" | "price_asc" | "price_desc";

export type ListProductsParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  categorySlug?: string;
  sort?: ProductSort;
};

export type StoreCartItem = {
  id: string;
  variantId: string;
  productId: string;
  productSlug: string;
  name: string;
  sku: string;
  unitPrice: string;
  quantity: number;
  lineTotal: string;
  imageUrl: string | null;
  available: number;
  sellable: boolean;
};

export type StoreCart = {
  id: string | null;
  currency: string;
  items: StoreCartItem[];
  itemCount: number;
  subtotal: string;
  discountTotal: string;
  shippingTotal: string;
  taxTotal: string;
  grandTotal: string;
};

export type StoreCustomer = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
};

export type AuthPayload = {
  user: StoreCustomer;
  csrfToken: string;
};

export type StoreAddress = {
  id: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string;
  addressType: "shipping" | "billing" | "other";
  isDefault: boolean;
};

export type AddressInput = {
  label?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country?: string;
  addressType?: "shipping" | "billing" | "other";
  isDefault?: boolean;
};

export type ShippingOption = {
  id: string;
  name: string;
  description: string;
  amount: string;
  currency: string;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
};

export type CheckoutQuote = {
  currency: string;
  lines: Array<{
    variantId: string;
    sku: string;
    name: string;
    unitPrice: string;
    quantity: number;
    lineTotal: string;
  }>;
  subtotal: string;
  discountTotal: string;
  shippingTotal: string;
  taxTotal: string;
  grandTotal: string;
  shippingMethodId: string;
  couponCode: string | null;
};

export type PlaceOrderResult = {
  orderId: string;
  orderNumber: string;
  status: string;
  currency: string;
  payableAmount: string;
  paymentRequired: boolean;
  totals: {
    subtotal: string;
    discountTotal: string;
    shippingTotal: string;
    taxTotal: string;
    grandTotal: string;
  };
};

export type StoreOrderListItem = {
  id: string;
  orderNumber: string;
  status: string;
  currency: string;
  totalAmount: string;
  placedAt: string;
  itemCount: number;
};

export type StoreOrderDetail = {
  id: string;
  orderNumber: string;
  status: string;
  currency: string;
  subtotal: string;
  discountTotal: string;
  shippingTotal: string;
  taxTotal: string;
  grandTotal: string;
  shippingMethodId: string | null;
  customerNote: string | null;
  couponCode: string | null;
  shippingAddress: Record<string, unknown> | null;
  placedAt: string;
  items: Array<{
    id: string;
    variantId: string | null;
    sku: string;
    name: string;
    unitPrice: string;
    quantity: number;
    lineTotal: string;
  }>;
  paymentStatus: string | null;
  shipment: { trackingNumber: string | null; status: string } | null;
};

export type CreatePaymentResult = {
  paymentId: string;
  orderId: string;
  orderNumber: string;
  amount: string;
  currency: string;
  status: string;
  provider: string;
  redirectUrl: string;
};

export type StorePayment = {
  id: string;
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  amount: string;
  currency: string;
  status: string;
  provider: string;
  providerReference: string | null;
  createdAt: string;
};
