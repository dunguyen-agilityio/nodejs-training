import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { CartItem } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number | ((...args: any[]) => number) = 800,
) {
  let timeout: NodeJS.Timeout
  let prevArgs: any[] | null = null

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const time =
      typeof delay === 'function' ? delay(prevArgs || args, args) : delay

    const context = this

    if (time > 0) clearTimeout(timeout)

    timeout = setTimeout(() => func.apply(context, args), time)
    prevArgs = args
  } as T
}

export const getCartTotal = (cartItems: CartItem[]) => {
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.productPrice * item.quantity,
    0,
  )

  return cartTotal
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}
