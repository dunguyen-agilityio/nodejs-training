import { auth } from "@clerk/nextjs/server";
import { get, patch } from "./api";
import { ApiPagination, ApiResponse, Order, OrderStatus } from "./types";
import { CLERK_TOKEN_TEMPLATE } from "./constants";

// Mock database
// eslint-disable-next-line prefer-const
let orders: Order[] = [
  {
    id: "ORD-001",
    userId: "user_2rMv...", // Example Clerk ID, matches what we might see
    date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    status: "Delivered",
    total: 135,
    items: [
      {
        productId: "1",
        name: "Classic White Tee",
        price: 25,
        quantity: 2,
        image: "/file-text.svg",
      },
      {
        productId: "2",
        name: "Denim Jacket",
        price: 85,
        quantity: 1,
        image: "/file-text.svg",
      },
    ],
    shippingAddress: {
      name: "John Doe",
      address: "123 Main St",
      city: "New York",
      zipCode: "10001",
      country: "USA",
    },
  },
  {
    id: "ORD-002",
    userId: "user_2rMv...",
    date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    status: "Processing",
    total: 199,
    items: [
      {
        productId: "4",
        name: "Wireless Headphones",
        price: 199,
        quantity: 1,
        image: "/file-text.svg",
      },
    ],
    shippingAddress: {
      name: "John Doe",
      address: "123 Main St",
      city: "New York",
      zipCode: "10001",
      country: "USA",
    },
  },
  {
    id: "ORD-003",
    userId: "another_user",
    date: new Date().toISOString(),
    status: "Pending",
    total: 45,
    items: [
      {
        productId: "7",
        name: "Sunglasses",
        price: 45,
        quantity: 1,
        image: "/file-text.svg",
      },
    ],
    shippingAddress: {
      name: "Jane Smith",
      address: "456 Oak Ave",
      city: "Los Angeles",
      zipCode: "90001",
      country: "USA",
    },
  },
];

export async function getUserOrders(page: number = 1, pageSize: number = 10) {
  const { getToken } = await auth();

  const token = await getToken({
    template: CLERK_TOKEN_TEMPLATE,
    expiresInSeconds: 3,
  });

  const response = await get<ApiResponse<Order[], { meta: { pagination: ApiPagination } }>>(
    `/orders?page=${page}&pageSize=${pageSize}`,
    {
      Authorization: `Bearer ${token}`,
    },
  );

  return response;
}

export async function getAllOrders(page: number = 1, pageSize: number = 20) {
  const { getToken } = await auth();

  const token = await getToken({
    template: CLERK_TOKEN_TEMPLATE,
    expiresInSeconds: 3,
  });

  const response = await get<ApiResponse<Order[], { meta: { pagination: ApiPagination } }>>(
    `/admin/orders?page=${page}&pageSize=${pageSize}`,
    {
      Authorization: `Bearer ${token}`,
    },
  );

  return response;
}

export async function createOrder(order: Order) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  orders.unshift(order);
  return order;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const { getToken } = await auth();

  const token = await getToken({
    template: CLERK_TOKEN_TEMPLATE,
    expiresInSeconds: 3,
  });

  const response = await patch<ApiResponse<Order>>(
    `/admin/orders/${orderId}/status`,
    { status },
    {
      Authorization: `Bearer ${token}`,
    },
  );

  return response.data;
}
