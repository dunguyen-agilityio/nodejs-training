"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4 text-foreground">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">Add some items to get started!</p>
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
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 border-b border-border pb-4"
            >
              <div className="relative h-24 w-24 bg-secondary rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain p-2"
                />
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-foreground">{item.name}</h3>
                <p className="text-muted-foreground text-sm">${item.price}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center border border-input rounded-md">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1 hover:bg-accent hover:text-accent-foreground"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 border-x border-input">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1 hover:bg-accent hover:text-accent-foreground"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-destructive text-sm hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="text-right font-semibold text-foreground">
                ${item.price * item.quantity}
              </div>
            </div>
          ))}
        </div>
        <div className="bg-card p-6 rounded-lg h-fit border border-border">
          <h2 className="text-xl font-bold mb-4 text-foreground">Order Summary</h2>
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
          <button className="w-full bg-primary text-primary-foreground py-3 rounded-md hover:bg-primary/90 transition-colors">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </main>
  );
}
