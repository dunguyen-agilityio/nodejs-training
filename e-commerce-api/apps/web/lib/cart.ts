import { auth } from "@clerk/nextjs/server";
import { ApiResponse, Cart } from "./types";
import { CLERK_TOKEN_TEMPLATE } from "./constants";
import { get } from "./api";

export const getCarts = async () => {
  const { getToken } = await auth();

  try {
    const token = await getToken({ template: CLERK_TOKEN_TEMPLATE });
    const response = await get<ApiResponse<Cart>>("/cart", {
      Authorization: `Bearer ${token}`,
    });
    return response.data.items;
  } catch (error) {
    console.error("Failed to fetch cart on server:", error);
    // Handle error gracefully, maybe show a toast on the client
    return [];
  }
};
