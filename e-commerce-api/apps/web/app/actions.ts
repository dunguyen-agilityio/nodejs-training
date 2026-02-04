'use server'

import { revalidatePath } from 'next/cache'

import { createOrder, updateOrderStatus } from '@/lib/orders'
import { Order, OrderStatus } from '@/lib/types'

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus,
) {
  await updateOrderStatus(orderId, status)
  revalidatePath('/admin/orders')
  revalidatePath('/orders')
}

export async function createOrderAction(order: Order) {
  await createOrder(order)
  revalidatePath('/admin/orders')
  revalidatePath('/orders')
}
