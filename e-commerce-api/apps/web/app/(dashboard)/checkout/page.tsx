import Link from 'next/link'

import { post } from '@/lib/api'
import { createAuthorizationHeader } from '@/lib/auth'
import { config } from '@/lib/config'
import { PaymentIntent } from '@/lib/types'
import { formatCurrency, getCartTotal } from '@/lib/utils'

import CheckoutForm from './CheckoutForm'
import Provider from './Provider'

export default async function CheckoutPage() {
  const getPaymentIntent = async (
    currency = 'usd',
  ): Promise<
    PaymentIntent & {
      error?: string
    }
  > => {
    try {
      const headers = await createAuthorizationHeader()
      return await post<PaymentIntent>(
        `${config.api.endpoint}/checkout/payment-intents`,
        { currency },
        headers,
      )
    } catch (error) {
      console.error('Error: ', error)
      let message = 'Create Payment Intent failed'

      if (error instanceof Error) {
        message = error.message
      }

      return { error: message, clientSecret: '', items: [] }
    }
  }
  const { clientSecret, items, error } = await getPaymentIntent()

  if (error) {
    throw new Error(error)
  }

  const cartTotal = getCartTotal(items)

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4 text-foreground">
          Your cart is empty
        </h1>
        <Link
          href="/"
          className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  // Handle error from checkout service
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 gap-4 text-center">
        <h1 className="text-xl font-bold mb-4 text-foreground">{error}</h1>
        <Link
          href="/cart"
          className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90"
        >
          Review Cart
        </Link>
      </div>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <Provider clientSecret={clientSecret}>
            <CheckoutForm cartTotal={cartTotal} />
          </Provider>
        </div>

        <div className="bg-muted p-6 rounded-lg h-fit">
          <h2 className="text-xl font-bold mb-4 text-foreground">
            Order Summary
          </h2>
          <div className="space-y-4 mb-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-muted-foreground">
                  {item.productName} x {item.quantity}
                </span>
                <span className="font-medium text-foreground">
                  {formatCurrency(item.productPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-4 flex justify-between font-bold text-lg">
            <span className="text-foreground">Total</span>
            <span className="text-foreground">{formatCurrency(cartTotal)}</span>
          </div>
        </div>
      </div>
    </main>
  )
}
