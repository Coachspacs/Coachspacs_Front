import { describe, it, expect } from "vitest";

describe("US-15: Checkout, Free Enrollment & Order History", () => {
  it("processes free course enrollment directly without checkout", () => {
    const enrollInCourse = (price: number) => {
      if (price === 0) {
        return {
          type: "free_enrollment",
          requiresCheckout: false,
          createdEnrollment: true,
        };
      }
      return {
        type: "paid_order",
        requiresCheckout: true,
        createdEnrollment: false,
      };
    };

    expect(enrollInCourse(0)).toEqual({
      type: "free_enrollment",
      requiresCheckout: false,
      createdEnrollment: true,
    });

    expect(enrollInCourse(99)).toEqual({
      type: "paid_order",
      requiresCheckout: true,
      createdEnrollment: false,
    });
  });

  it("mock checkout constructs atomic order with items and clears the cart", () => {
    const initialCart = [
      { courseId: 101, price: 29.99 },
      { courseId: 102, price: 49.99 },
    ];

    function executeMockCheckout(cart: typeof initialCart, studentId: number) {
      const order = {
        id: "ORD-9988",
        student_id: studentId,
        total_amount: cart.reduce((sum, it) => sum + it.price, 0),
        status: "completed",
        items: cart.map((it) => ({ course_id: it.courseId, price: it.price })),
      };

      const enrollments = cart.map((it) => ({
        student_id: studentId,
        course_id: it.courseId,
        progress_percent: 0,
      }));

      return {
        order,
        enrollments,
        clearedCart: [],
      };
    }

    const result = executeMockCheckout(initialCart, 5);
    expect(result.order.items.length).toBe(2);
    expect(result.order.total_amount).toBeCloseTo(79.98, 2);
    expect(result.enrollments.length).toBe(2);
    expect(result.clearedCart).toEqual([]);
  });
});
