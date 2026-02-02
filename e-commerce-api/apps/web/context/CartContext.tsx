"use client";

import React, { createContext, useContext, useState } from "react";
import { CartItem, Product } from "@/lib/types";
import { post, del, put } from "@/lib/api";
import { useAuth, useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { CLERK_TOKEN_TEMPLATE } from "@/lib/constants";
import { debounce, getCartTotal } from "@/lib/utils";
import { redirect } from "next/navigation";
import { UnauthorizedError } from "@/lib/errors";

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

interface CartAddResponse {
  data: { id: string };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({
  children,
  initialCart = [],
}: {
  children: React.ReactNode;
  initialCart?: CartItem[];
}) {
  const [cart, setCart] = useState<CartItem[]>(initialCart);
  const { getToken, isSignedIn } = useAuth();
  const { signOut } = useClerk();

  const handleApiError = (error: any) => {
    if (error instanceof UnauthorizedError) {
      signOut();
    } else {
      console.error(error);
      toast.error(error.message || "An error occurred");
    }
  };

  const addToCart = debounce(async (product: Product, quantity: number = 1) => {
    try {
      if (!isSignedIn) {
        redirect("/sign-in");
      }
      const token = await getToken({
        template: CLERK_TOKEN_TEMPLATE,
      });

      const response = await post<CartAddResponse>(
        "/cart/add",
        { productId: product.id, quantity },
        {
          Authorization: `Bearer ${token}`,
        },
      );
      setCart((prevCart) => {
        const existingItem = prevCart.find(
          (item) => item.product.id === product.id,
        );
        if (existingItem) {
          return prevCart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          );
        }

        return [...prevCart, { id: response.data.id, product, quantity }];
      });
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      handleApiError(error);
    }
  }, 300);

  const removeFromCart = async (cartItemId: string) => {
    try {
      const token = await getToken({ template: CLERK_TOKEN_TEMPLATE });
      await del(`/cart/items/${cartItemId}`, {
        Authorization: `Bearer ${token}`,
      });
      setCart((prevCart) => prevCart.filter((item) => item.id !== cartItemId));
      toast.success("Item removed from cart");
    } catch (error) {
      handleApiError(error);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }
    try {
      const token = await getToken({ template: CLERK_TOKEN_TEMPLATE });
      await put(
        `/cart/items/${cartItemId}`,
        { quantity },
        {
          Authorization: `Bearer ${token}`,
        },
      );
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === cartItemId ? { ...item, quantity } : item,
        ),
      );
      toast.success("Cart updated");
    } catch (error) {
      handleApiError(error);
    }
  };

  const clearCart = () => setCart([]);

  const cartTotal = getCartTotal(cart);

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
