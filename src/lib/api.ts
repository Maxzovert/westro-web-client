import type {
  AddressInput,
  AuthPayload,
  CheckoutQuote,
  CreatePaymentResult,
  HealthResponse,
  ListProductsParams,
  PaginationMeta,
  PlaceOrderResult,
  ShippingOption,
  StoreAddress,
  StoreAvailability,
  StoreCart,
  StoreCategory,
  StoreCsrfResponse,
  StoreCustomer,
  StoreMeta,
  StoreOrderDetail,
  StoreOrderListItem,
  StorePayment,
  StoreProductDetail,
  StoreProductListItem,
} from "../types/store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof window === "undefined" ? "http://localhost:4001/api/v1" : "/api/v1");

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

type ApiSuccess<T> = {
  data: T;
  meta?: {
    pagination?: PaginationMeta;
    [key: string]: unknown;
  };
};

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
  };
};

let csrfToken: string | null = null;

export function setCsrfToken(token: string | null) {
  csrfToken = token;
}

export function getCsrfToken() {
  return csrfToken;
}

function toQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

async function request<T>(
  path: string,
  init: RequestInit & { csrf?: boolean } = {},
): Promise<{ data: T; meta?: ApiSuccess<T>["meta"] }> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (init.csrf) {
    if (!csrfToken) {
      throw new ApiError("Missing CSRF token", 400, "CSRF_MISSING");
    }
    headers.set("x-csrf-token", csrfToken);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    let code: string | undefined;
    try {
      const body = (await response.json()) as ApiErrorBody;
      message = body.error?.message ?? message;
      code = body.error?.code;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(message, response.status, code);
  }

  if (response.status === 204) {
    return { data: undefined as T };
  }

  const payload = (await response.json()) as ApiSuccess<T>;
  return { data: payload.data, meta: payload.meta };
}

export const api = {
  getHealth: async () => (await request<HealthResponse>("/health")).data,

  getStoreMeta: async () => (await request<StoreMeta>("/store/meta")).data,

  getStoreCsrf: async () => {
    const { data } = await request<StoreCsrfResponse>("/store/auth/csrf");
    setCsrfToken(data.csrfToken);
    return data.csrfToken;
  },

  listCategories: async (params: { page?: number; pageSize?: number } = {}) => {
    const { data, meta } = await request<StoreCategory[]>(
      `/store/categories${toQuery({
        page: params.page,
        pageSize: params.pageSize,
      })}`,
    );
    return { items: data, pagination: meta?.pagination };
  },

  getCategory: async (slug: string) =>
    (await request<StoreCategory>(`/store/categories/${encodeURIComponent(slug)}`)).data,

  listProducts: async (params: ListProductsParams = {}) => {
    const { data, meta } = await request<StoreProductListItem[]>(
      `/store/products${toQuery({
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
        categorySlug: params.categorySlug,
        sort: params.sort,
      })}`,
    );
    return { items: data, pagination: meta?.pagination };
  },

  getProduct: async (slug: string) =>
    (await request<StoreProductDetail>(`/store/products/${encodeURIComponent(slug)}`)).data,

  getProductAvailability: async (slug: string) =>
    (
      await request<StoreAvailability>(
        `/store/products/${encodeURIComponent(slug)}/availability`,
      )
    ).data,

  ensureCsrf: async () => {
    if (csrfToken) return csrfToken;
    return api.getStoreCsrf();
  },

  getCart: async () => (await request<StoreCart>("/store/cart")).data,

  addCartItem: async (input: { variantId: string; quantity: number }) => {
    await api.ensureCsrf();
    return (
      await request<StoreCart>("/store/cart/items", {
        method: "POST",
        csrf: true,
        body: JSON.stringify(input),
      })
    ).data;
  },

  updateCartItem: async (itemId: string, quantity: number) => {
    await api.ensureCsrf();
    return (
      await request<StoreCart>(`/store/cart/items/${encodeURIComponent(itemId)}`, {
        method: "PATCH",
        csrf: true,
        body: JSON.stringify({ quantity }),
      })
    ).data;
  },

  removeCartItem: async (itemId: string) => {
    await api.ensureCsrf();
    return (
      await request<StoreCart>(`/store/cart/items/${encodeURIComponent(itemId)}`, {
        method: "DELETE",
        csrf: true,
      })
    ).data;
  },

  clearCart: async () => {
    await api.ensureCsrf();
    return (
      await request<StoreCart>("/store/cart", {
        method: "DELETE",
        csrf: true,
      })
    ).data;
  },

  register: async (input: { name: string; email: string; password: string }) => {
    await api.ensureCsrf();
    const { data } = await request<AuthPayload>("/store/auth/register", {
      method: "POST",
      csrf: true,
      body: JSON.stringify(input),
    });
    setCsrfToken(data.csrfToken);
    return data.user;
  },

  login: async (input: { email: string; password: string }) => {
    await api.ensureCsrf();
    const { data } = await request<AuthPayload>("/store/auth/login", {
      method: "POST",
      csrf: true,
      body: JSON.stringify(input),
    });
    setCsrfToken(data.csrfToken);
    return data.user;
  },

  requestOtp: async (phone: string) => {
    await api.ensureCsrf();
    return (
      await request<{ ok: true; message: string; phone: string; devOtp?: string }>(
        "/store/auth/otp/request",
        {
          method: "POST",
          csrf: true,
          body: JSON.stringify({ phone }),
        },
      )
    ).data;
  },

  verifyOtp: async (input: { phone: string; otp: string }) => {
    await api.ensureCsrf();
    const { data } = await request<AuthPayload>("/store/auth/otp/verify", {
      method: "POST",
      csrf: true,
      body: JSON.stringify(input),
    });
    setCsrfToken(data.csrfToken);
    return data.user;
  },

  logout: async () => {
    await api.ensureCsrf();
    await request<{ ok: true }>("/store/auth/logout", {
      method: "POST",
      csrf: true,
    });
  },

  getMe: async () => {
    const { data } = await request<{ user: StoreCustomer }>("/store/auth/me");
    return data.user;
  },

  forgotPassword: async (email: string) => {
    await api.ensureCsrf();
    return (
      await request<{ ok: true; message: string; devResetToken?: string }>(
        "/store/auth/forgot-password",
        {
          method: "POST",
          csrf: true,
          body: JSON.stringify({ email }),
        },
      )
    ).data;
  },

  resetPassword: async (input: { token: string; password: string }) => {
    await api.ensureCsrf();
    return (
      await request<{ ok: true }>("/store/auth/reset-password", {
        method: "POST",
        csrf: true,
        body: JSON.stringify(input),
      })
    ).data;
  },

  listAddresses: async () => (await request<StoreAddress[]>("/store/addresses")).data,

  createAddress: async (input: AddressInput) => {
    await api.ensureCsrf();
    return (
      await request<StoreAddress>("/store/addresses", {
        method: "POST",
        csrf: true,
        body: JSON.stringify(input),
      })
    ).data;
  },

  updateAddress: async (id: string, input: Partial<AddressInput>) => {
    await api.ensureCsrf();
    return (
      await request<StoreAddress>(`/store/addresses/${encodeURIComponent(id)}`, {
        method: "PATCH",
        csrf: true,
        body: JSON.stringify(input),
      })
    ).data;
  },

  deleteAddress: async (id: string) => {
    await api.ensureCsrf();
    return (
      await request<{ ok: true }>(`/store/addresses/${encodeURIComponent(id)}`, {
        method: "DELETE",
        csrf: true,
      })
    ).data;
  },

  getShippingOptions: async (addressId?: string) => {
    await api.ensureCsrf();
    return (
      await request<ShippingOption[]>("/store/shipping/options", {
        method: "POST",
        csrf: true,
        body: JSON.stringify(addressId ? { addressId } : {}),
      })
    ).data;
  },

  getCheckoutQuote: async (input: {
    addressId: string;
    shippingMethodId: string;
    couponCode?: string | null;
  }) => {
    await api.ensureCsrf();
    return (
      await request<CheckoutQuote>("/store/checkout/quote", {
        method: "POST",
        csrf: true,
        body: JSON.stringify(input),
      })
    ).data;
  },

  placeOrder: async (
    input: {
      addressId: string;
      shippingMethodId: string;
      couponCode?: string | null;
      customerNote?: string | null;
    },
    idempotencyKey: string,
  ) => {
    await api.ensureCsrf();
    return (
      await request<PlaceOrderResult>("/store/checkout/place-order", {
        method: "POST",
        csrf: true,
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(input),
      })
    ).data;
  },

  listOrders: async (params: { page?: number; pageSize?: number } = {}) => {
    const { data, meta } = await request<StoreOrderListItem[]>(
      `/store/orders${toQuery({
        page: params.page,
        pageSize: params.pageSize,
      })}`,
    );
    return { items: data, pagination: meta?.pagination };
  },

  getOrder: async (id: string) =>
    (await request<StoreOrderDetail>(`/store/orders/${encodeURIComponent(id)}`)).data,

  createPayment: async (
    input: { orderId: string; returnUrl: string },
    idempotencyKey: string,
  ) => {
    await api.ensureCsrf();
    return (
      await request<CreatePaymentResult>("/store/payments/create", {
        method: "POST",
        csrf: true,
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(input),
      })
    ).data;
  },

  getPayment: async (id: string) =>
    (await request<StorePayment>(`/store/payments/${encodeURIComponent(id)}`)).data,

  mockConfirmPayment: async (input: {
    paymentId: string;
    outcome?: "captured" | "failed";
  }) => {
    await api.ensureCsrf();
    return (
      await request<StorePayment>("/store/payments/mock/confirm", {
        method: "POST",
        csrf: true,
        body: JSON.stringify({
          paymentId: input.paymentId,
          outcome: input.outcome ?? "captured",
        }),
      })
    ).data;
  },
};
