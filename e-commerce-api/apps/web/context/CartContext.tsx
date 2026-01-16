"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, Product } from "@/lib/types";
import { post, del, put } from "@/lib/api"; // Import post, del, and put functions
import { useAuth } from "@clerk/nextjs"; // Import useAuth hook
import { toast } from "sonner";
import { CLERK_TOKEN_TEMPLATE } from "@/lib/constants";

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

interface CartAddResponse {
  id: string;
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
  const { getToken } = useAuth(); // Get getToken and isSignedIn from useAuth

  // Save cart to localStorage on change (Optional, depends on desired behavior)
  // For now, we rely on the API for persistence
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = async (product: Product, quantity: number = 1) => {
    try {
      const token = await getToken({ template: CLERK_TOKEN_TEMPLATE }); // Get authentication token
      const response = await post<CartAddResponse>(
        "/cart/add",
        { productId: product.id, quantity },
        {
          Authorization: `Bearer ${token}`,
        }
      );
      setCart((prevCart) => {
        const existingItem = prevCart.find(
          (item) => item.product.id === product.id
        );
        if (existingItem) {
          return prevCart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prevCart, { id: response.id, product, quantity }];
      });
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      console.error("Failed to add to cart", error);
      toast.error("Failed to add product to cart");
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      const token = await getToken({ template: CLERK_TOKEN_TEMPLATE });
      await del(`/cart/items/${cartItemId}`, {
        Authorization: `Bearer ${token}`,
      });
      setCart((prevCart) => prevCart.filter((item) => item.id !== cartItemId));
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Failed to remove from cart", error);
      toast.error("Failed to remove item from cart");
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
        }
      );
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === cartItemId ? { ...item, quantity } : item
        )
      );
      toast.success("Cart updated");
    } catch (error) {
      console.error("Failed to update quantity", error);
      toast.error("Failed to update cart");
    }
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

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
