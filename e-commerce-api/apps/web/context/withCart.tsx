'use client'

import { JSX, useState } from 'react'

import { Product } from '@/lib/types'

import { useCart } from '@/context/CartContext'

type TChild<T> = (props: TWithCart<T>) => React.ReactNode

export const withCart = <T,>(Comp: TChild<T>) => {
  const NewCompoent = (props: Product & T) => {
    const { addToCart, cart } = useCart()

    const { id } = props

    const [quantity, setQuantity] = useState(
      () => cart.find((item) => item.productId === id)?.quantity || 0,
    )

    const handleAddToCart = (product: Product) => {
      setQuantity((prev) => {
        addToCart(product, prev + 1)
        return prev + 1
      })
    }

    return (
      <Comp
        {...(props as JSX.IntrinsicAttributes & T)}
        addToCart={handleAddToCart}
        outStock={quantity >= props.stock}
      />
    )
  }

  return NewCompoent
}

export type TWithCart<T> = T & {
  addToCart: (product: Product) => void
  outStock: boolean
}
