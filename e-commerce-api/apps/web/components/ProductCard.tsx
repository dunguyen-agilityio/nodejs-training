"use client";

import Image from "next/image";
import { Product } from "@/lib/types";
import Link from "next/link";
import { TWithCart, withCart } from "@/context/withCart";

export interface ProductCardProps {
  product: Product;
}

export default function ProductCard({
  product,
  addToCart,
}: TWithCart<ProductCardProps>) {
  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-card text-card-foreground">
      <Link href={`/products/${product.id}`}>
        <div className="relative h-48 w-full bg-secondary flex items-center justify-center">
          <Image
            src={product.images[0] || "/file-text.svg"}
            alt={product.name}
            width={100}
            height={100}
            className="object-contain"
          />
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg hover:text-primary truncate">
            {product.name}
          </h3>
        </Link>
        <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
          {product.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-bold text-xl">${product.price}</span>
          <button
            onClick={handleAddToCart}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:bg-primary/90 transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export const ProductCardWithCart = withCart<ProductCardProps>(ProductCard);
