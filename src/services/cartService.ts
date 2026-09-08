import axiosInstance from "@/lib/axios";

export interface ApiCartItemCourse {
  id: number | string;
  title: string;
  price: string | number;
  cover_image?: string;
  status?: string;
}

export interface ApiCartItem {
  id: number | string;
  course: ApiCartItemCourse;
  is_available: boolean;
  added_at: string;
}

export interface ApiCartResponse {
  id?: number | string;
  items: ApiCartItem[];
  item_count: string | number;
  total: string | number;
  created_at?: string;
}

/**
 * Cart Service
 * Connects to /api/cart and /api/cart/items (US-14)
 */
export const cartService = {
  /**
   * Get current student's cart from backend
   * GET /api/cart
   */
  async getCart(): Promise<ApiCartResponse> {
    const response = await axiosInstance.get<ApiCartResponse>("/cart");
    return response.data;
  },

  /**
   * Add a course to current student's cart
   * POST /api/cart/items
   * Body: { "course_id": <id> }
   * Safely handles "This course is already in your cart" and "already_enrolled" without throwing 400 errors
   */
  async addToCart(courseId: number | string): Promise<{
    success: boolean;
    already_in_cart?: boolean;
    already_enrolled?: boolean;
    data?: any;
  }> {
    const numericId = Number(courseId);
    if (!numericId || isNaN(numericId)) {
      return { success: false };
    }

    try {
      const response = await axiosInstance.post("/cart/items", {
        course_id: numericId,
      });
      return { success: true, data: response.data };
    } catch (err: any) {
      const errorData = err?.response?.data;
      const detail = String(
        errorData?.detail ||
        errorData?.message ||
        (typeof errorData === "string" ? errorData : "") ||
        ""
      ).toLowerCase();

      // Case A: Course is already in the server cart
      if (
        errorData?.already_in_cart ||
        detail.includes("already in your cart") ||
        detail.includes("already in cart")
      ) {
        return {
          success: true,
          already_in_cart: true,
          data: errorData,
        };
      }

      // Case B: Student is already enrolled in this course
      if (
        errorData?.already_enrolled ||
        detail.includes("already enrolled")
      ) {
        return {
          success: false,
          already_enrolled: true,
          data: errorData,
        };
      }

      // Re-throw unexpected server errors
      throw err;
    }
  },

  /**
   * Synchronize an array of course IDs into the backend cart.
   * Pre-checks what's already in the server cart to avoid redundant POST requests and 400 errors.
   */
  async syncItemsToServer(courseIds: (number | string)[]): Promise<void> {
    try {
      // 1. Fetch current items in server cart
      const serverCart = await this.getCart();
      const existingCourseIds = new Set<string>();

      if (serverCart?.items && Array.isArray(serverCart.items)) {
        serverCart.items.forEach((it) => {
          const cId = it.course?.id || it.id;
          if (cId) existingCourseIds.add(String(cId));
        });
      }

      // 2. Only add items that are NOT already in the server cart
      for (const cId of courseIds) {
        const strId = String(cId);
        const numericId = Number(cId);

        if (!existingCourseIds.has(strId) && numericId && !isNaN(numericId)) {
          try {
            await this.addToCart(numericId);
          } catch {
            // Ignore non-blocking sync issues
          }
        }
      }
    } catch {
      // If fetching server cart fails, fallback to safe addition
      for (const cId of courseIds) {
        const numericId = Number(cId);
        if (numericId && !isNaN(numericId)) {
          try {
            await this.addToCart(numericId);
          } catch {
            // Ignore
          }
        }
      }
    }
  },

  /**
   * Remove an item from the cart
   * DELETE /api/cart/items/{id}
   */
  async removeFromCart(itemId: number | string): Promise<void> {
    const numericId = Number(itemId);
    if (!numericId || isNaN(numericId)) return;
    try {
      await axiosInstance.delete(`/cart/items/${numericId}`);
    } catch (err) {
      console.warn("[cartService] removeFromCart error:", err);
    }
  },
};

export default cartService;
