"use client";

import { useCart } from "@/context/CartContext";
import { Product } from "@/lib/types";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <button
      onClick={() => addToCart(product)}
      className="w-full bg-black text-white py-4 rounded-md font-bold hover:bg-gray-800 transition-colors"
    >
      Add to Cart
    </button>
  );
}
