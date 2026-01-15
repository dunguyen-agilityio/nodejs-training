"use client";

import { useCart } from "@/context/CartContext";
import { Product } from "@/lib/types";
import { toast } from "sonner";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <button
      onClick={handleAddToCart}
      className="w-full bg-primary text-primary-foreground py-4 rounded-md font-bold hover:bg-primary/90 transition-colors"
    >
      Add to Cart
    </button>
  );
}
