'use client'

import Image from 'next/image'
import Link from 'next/link'

import { Product } from '@/lib/types'

import { TWithCart, withCart } from '@/context/withCart'

export interface ProductCardProps {
  product: Product
}

export default function ProductCard({
  product,
  addToCart,
  outStock,
}: TWithCart<ProductCardProps>) {
  const handleAddToCart = () => {
    addToCart(product)
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-card text-card-foreground">
      <Link href={`/products/${product.id}`}>
        <div className="relative h-48 w-full bg-secondary flex items-center justify-center">
          <Image
            src={product.images[0] || '/file-text.svg'}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="eager"
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
            disabled={outStock}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:bg-primary/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {outStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}

export const ProductCardWithCart = withCart<ProductCardProps>(ProductCard)
