import { Order, OrderStatus } from "./types";

// Mock database
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

export async function getUserOrders(userId: string) {
  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  // For demo purposes, if userId matches our mock user, return their orders
  // In a real app, this would query by the actual userId
  if (userId) {
     // Return the mock orders for the main demo user + any new ones created in session
     // For simplicity in this mock, we'll return orders that match or the 'demo' ones if logged in
     return orders.filter(o => o.userId === userId || o.userId === "user_2rMv...");
  }
  return [];
}

export async function getAllOrders() {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function createOrder(order: Order) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  orders.unshift(order);
  return order;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    order.status = status;
  }
  return order;
}
