import { Invoice, Response } from '#types'
import Stripe from 'stripe'

export interface ICheckoutService {
  generatePaymentIntent(
    payload: Stripe.PaymentIntentCreateParams,
    userId: string,
    userStripeId: string,
  ): Promise<Response<Invoice>>
  prepareOrderForPayment(userId: string, stripeId: string): Promise<Invoice>
  handleSuccessfulPayment(stripeId: string, invoiceId: string): Promise<void>
}
