"use client";

import Image from "next/image";
import { CartItem as TCartItem } from "@/lib/types";
import { useState } from "react";

interface CartItemProps {
  item: TCartItem;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
}

export function CartItem({
  item,
  updateQuantity,
  removeFromCart,
}: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);

  return (
    <div
      key={item.id}
      className="flex items-center gap-4 border-b border-border pb-4"
    >
      <div className="relative h-24 w-24 bg-secondary rounded-md overflow-hidden flex-shrink-0">
        <Image
          src={item.product.image || "/file-text.svg"}
          alt={item.product.name}
          fill
          className="object-contain p-2"
        />
      </div>
      <div className="flex-grow">
        <h3 className="font-semibold text-foreground">{item.product.name}</h3>
        <p className="text-muted-foreground text-sm">${item.product.price}</p>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center border border-input rounded-md">
            <button
              onClick={() => {
                setQuantity(quantity - 1);
                updateQuantity(item.id, quantity - 1);
              }}
              className="px-3 py-1 hover:bg-accent hover:text-accent-foreground"
            >
              -
            </button>
            <span className="px-3 py-1 border-x border-input">{quantity}</span>
            <button
              onClick={() => {
                setQuantity(quantity + 1);
                updateQuantity(item.id, quantity + 1);
              }}
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
        ${item.product.price * item.quantity}
      </div>
    </div>
  );
}
