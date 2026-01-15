"use server";

import { updateOrderStatus, createOrder } from "@/lib/orders";
import { OrderStatus, Order } from "@/lib/types";
import { deleteProduct } from "@/lib/data";
import { revalidatePath } from "next/cache";

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  await updateOrderStatus(orderId, status);
  revalidatePath("/admin/orders");
  revalidatePath("/orders");
}

export async function createOrderAction(order: Order) {
  await createOrder(order);
  revalidatePath("/admin/orders");
  revalidatePath("/orders");
}

export async function deleteProductAction(productId: string) {
  await deleteProduct(productId);
  revalidatePath("/admin/products");
  revalidatePath("/");
}
