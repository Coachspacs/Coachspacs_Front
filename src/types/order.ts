export type PaymentMethod = "credit_card" | "paypal" | "apple_pay";
export type OrderStatus = "completed" | "pending" | "failed" | "refunded";

export interface OrderItem {
  courseId: string;
  title: string;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
}

export interface PayoutRecord {
  id: string;
  instructorId: string;
  amount: number;
  status: "paid" | "processing" | "failed";
  payoutDate: string;
  method: "bank" | "paypal";
}
