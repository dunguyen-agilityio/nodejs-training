'use client'

import { JSX, useMemo } from 'react'

import { Product } from '@/lib/types'

import { useCart } from '@/context/CartContext'

type TChild<T> = (props: TWithCart<T>) => React.ReactNode

export const withCart = <T,>(Comp: TChild<T>) => {
  const NewCompoent = ({ product, ...props }: { product: Product } & T) => {
    const { addToCart, cart } = useCart()

    const existingItem = useMemo(
      () => cart.find((item) => item.product.id === product.id),
      [cart, product.id],
    )

    const quantity = existingItem?.quantity || 0

    const handleAddToCart = (product: Product) => {
      addToCart(product, quantity + 1)
    }

    return (
      <Comp
        {...(props as JSX.IntrinsicAttributes & T)}
        product={product}
        addToCart={handleAddToCart}
      />
    )
  }

  return NewCompoent
}

export type TWithCart<T> = T & {
  addToCart: (product: Product) => void
}
