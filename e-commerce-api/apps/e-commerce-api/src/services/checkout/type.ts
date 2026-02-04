import Stripe from 'stripe'

import { Invoice, TResponse } from '#types'

export interface ICheckoutService {
  generatePaymentIntent(
    payload: Stripe.PaymentIntentCreateParams,
    userId: string,
    userStripeId: string,
  ): Promise<TResponse<Invoice>>
  prepareOrderForPayment(userId: string, stripeId: string): Promise<Invoice>
  handleSuccessfulPayment(stripeId: string, invoiceId: string): Promise<void>
}
