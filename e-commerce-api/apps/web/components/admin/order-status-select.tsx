"use client";

import { updateOrderStatusAction } from "@/app/actions";
import { OrderStatus } from "@/lib/types";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: OrderStatusSelectProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);

  const handleChange = (newStatus: OrderStatus) => {
    setStatus(newStatus);
    startTransition(async () => {
      try {
        await updateOrderStatusAction(orderId, newStatus);
        toast.success(`Order ${orderId} updated to ${newStatus}`);
      } catch {
        toast.error("Failed to update order status");
        setStatus(status); // Revert on error
      }
    });
  };

  return (
    <select
      className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      value={status}
      disabled={isPending}
      onChange={(e) => handleChange(e.target.value as OrderStatus)}
    >
      <option value="Pending">Pending</option>
      <option value="Processing">Processing</option>
      <option value="Shipped">Shipped</option>
      <option value="Delivered">Delivered</option>
      <option value="Cancelled">Cancelled</option>
    </select>
  );
}
