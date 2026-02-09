import { Invoice, TResponse } from '#types'

import { Order } from '#entities'

export interface ICheckoutService {
  generatePaymentIntent(
    payload: { currency: string },
    userId: string,
    userStripeId: string,
  ): Promise<TResponse<Invoice> & { order: Order }>
  handleSuccessfulPayment(stripeId: string, invoiceId: string): Promise<void>
  releaseExpiredStockReservations(): Promise<void>
}

export interface ConfirmationEmailPayload {
  paid_at: number
  receipt_url: string
  payment_method: string
  receipt_number: string
  invoice_url: string
  customer_name: string
  customer_email: string
  invoice_number: string
  currency: string
  total: number
}
