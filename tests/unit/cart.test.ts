import { describe, it, expect, beforeEach } from "vitest";

interface CartItem {
  id: number;
  course: {
    id: number;
    title: string;
    price: number;
    is_archived?: boolean;
  };
}

describe("US-14: Persistent Shopping Cart Logic", () => {
  let cart: CartItem[] = [];

  beforeEach(() => {
    cart = [];
  });

  function addToCart(cart: CartItem[], newCourse: CartItem["course"], enrolledCourseIds: number[]): {
    cart: CartItem[];
    error?: string;
  } {
    if (enrolledCourseIds.includes(newCourse.id)) {
      return { cart, error: "already_enrolled" };
    }
    if (cart.some((item) => item.course.id === newCourse.id)) {
      return { cart, error: "already_in_cart" };
    }
    const updated = [...cart, { id: Date.now(), course: newCourse }];
    return { cart: updated };
  }

  function calculateCartTotal(cart: CartItem[]): number {
    return cart
      .filter((item) => !item.course.is_archived)
      .reduce((sum, item) => sum + Number(item.course.price || 0), 0);
  }

  it("adds courses and computes the running total", () => {
    const course1 = { id: 1, title: "Next.js Mastery", price: 49.99 };
    const course2 = { id: 2, title: "Tailwind CSS Pro", price: 29.99 };

    let res = addToCart(cart, course1, []);
    expect(res.error).toBeUndefined();
    expect(res.cart.length).toBe(1);

    res = addToCart(res.cart, course2, []);
    expect(res.error).toBeUndefined();
    expect(res.cart.length).toBe(2);

    expect(calculateCartTotal(res.cart)).toBeCloseTo(79.98, 2);
  });

  it("prevents duplicate additions to the cart", () => {
    const course = { id: 10, title: "Python Basics", price: 19.99 };
    const firstAdd = addToCart(cart, course, []);
    expect(firstAdd.cart.length).toBe(1);

    const secondAdd = addToCart(firstAdd.cart, course, []);
    expect(secondAdd.error).toBe("already_in_cart");
    expect(secondAdd.cart.length).toBe(1);
  });

  it("blocks adding a course the student is already enrolled in", () => {
    const course = { id: 15, title: "Django DRF", price: 39.99 };
    const enrolledIds = [15, 20];

    const res = addToCart(cart, course, enrolledIds);
    expect(res.error).toBe("already_enrolled");
    expect(res.cart.length).toBe(0);
  });

  it("excludes archived items from the active total", () => {
    const activeItem: CartItem = { id: 1, course: { id: 100, title: "Active Course", price: 50 } };
    const archivedItem: CartItem = { id: 2, course: { id: 101, title: "Archived Course", price: 40, is_archived: true } };

    const total = calculateCartTotal([activeItem, archivedItem]);
    expect(total).toBe(50);
  });
});
