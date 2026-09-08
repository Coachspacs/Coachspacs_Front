import axiosInstance from "@/lib/axios";

export interface CheckoutPayload {
  course_ids?: (number | string)[];
  coupon_code?: string;
  [key: string]: any;
}

export interface CheckoutResponse {
  checkout_url: string;
  skipped_items?: Array<{
    course_id: number | string;
    reason?: string;
  }>;
  order?: any;
}

export interface OrderItemCourse {
  id: number | string;
  title: string;
  price: string | number;
  cover_image?: string;
}

export interface OrderItemDetail {
  id: number | string;
  course: OrderItemCourse;
  price_at_purchase: string | number;
}

export interface OrderRecord {
  id: number | string;
  status: "pending" | "completed" | "failed";
  total_amount: string | number;
  items: OrderItemDetail[];
  created_at: string;
}

export interface PaginatedOrdersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: OrderRecord[];
}

/**
 * Order & Checkout Service
 * Connects directly to backend /api/orders and /api/orders/checkout (US-15)
 * All order states are 100% sourced from the database and Stripe webhook.
 */
export const orderService = {
  /**
   * Start checkout session for the student's cart items
   * POST /api/orders/checkout
   * Returns hosted Stripe checkout URL for payment redirection
   * Accepts optional payload with course_ids or coupon details
   */
  async createCheckoutSession(payload?: CheckoutPayload): Promise<CheckoutResponse> {
    const response = await axiosInstance.post<CheckoutResponse>(
      "/orders/checkout",
      payload || {}
    );
    return response.data;
  },

  /**
   * Get student's past orders and invoices
   * GET /api/orders
   */
  async getOrders(page?: number, pageSize?: number): Promise<PaginatedOrdersResponse> {
    const params: Record<string, any> = {};
    if (page) params.page = page;
    if (pageSize) params.page_size = pageSize;
    const response = await axiosInstance.get<PaginatedOrdersResponse>("/orders", { params });
    return response.data;
  },
};

export default orderService;
