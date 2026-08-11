import React from "react";
import { StudentWorkspace } from "@/components/workspace/StudentWorkspace";

export const metadata = {
  title: "Order History | CoachSpace",
  description: "View and manage your past purchases, download receipts, and access enrolled courses.",
};

export default function OrdersPage() {
  return <StudentWorkspace initialTab="orders" />;
}
