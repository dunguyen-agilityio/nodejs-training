import Stripe from "stripe";

import { Invoice } from "#types/invoice";
import { Response } from "#types/payment";
import { User } from "#entities";

export interface ICheckoutService {
  checkout(stripeId: string, invoiceId: string): Promise<boolean>;

  createCheckoutPayment(
    payload: Stripe.PaymentIntentCreateParams,
    user: User,
  ): Promise<Response<Invoice>>;

  createPreviewInvoice(
    payload: Stripe.PaymentIntentCreateParams,
    userId: string,
    userStripeId: string,
  ): Promise<Response<Invoice>>;
  preCheckout(userId: string, stripeId: string): Promise<Invoice>;
}
