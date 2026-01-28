"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { debounce } from "@/lib/utils";
import { useState, useEffect } from "react";
import { CartItem } from "@/components/cart-item";
import { useAuth } from "@clerk/nextjs";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const [localCart, setLocalCart] = useState(cart);

  const { isLoaded } = useAuth();

  useEffect(() => {
    setLocalCart(cart);
  }, [cart]);

  const handleUpdateQuantity = debounce(
    (itemId: string, newQuantity: number) => {
      if (newQuantity <= 0) {
        handleRemoveFromCart(itemId);
        return;
      }

      setLocalCart((prevCart) =>
        prevCart.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item,
        ),
      );
      updateQuantity(itemId, newQuantity);
    },
    500,
  );

  const handleRemoveFromCart = (itemId: string) => {
    setLocalCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
    removeFromCart(itemId);
  };

  if (!isLoaded) {
    return <p>!Please waiting...</p>;
  }

  if (localCart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4 text-foreground">
          Your cart is empty
        </h1>
        <p className="text-muted-foreground mb-8">
          Add some items to get started!
        </p>
        <Link
          href="/"
          className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-4">
          {localCart.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              updateQuantity={handleUpdateQuantity}
              removeFromCart={handleRemoveFromCart}
            />
          ))}
        </div>
        <div className="bg-card p-6 rounded-lg h-fit border border-border">
          <h2 className="text-xl font-bold mb-4 text-foreground">
            Order Summary
          </h2>
          <div className="space-y-2 mb-4 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-foreground">${cartTotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
          </div>
          <div className="border-t border-border pt-4 flex justify-between font-bold text-lg mb-6 text-foreground">
            <span>Total</span>
            <span>${cartTotal}</span>
          </div>
          <Link
            href="/checkout"
            className="w-full block text-center bg-primary text-primary-foreground py-3 rounded-md hover:bg-primary/90 transition-colors"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </main>
  );
}
