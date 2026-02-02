import Stripe from "stripe";

import { Invoice } from "#types/invoice";
import { Response } from "#types/payment";
import { User } from "#entities";

export interface ICheckoutService {
  generatePaymentIntent(
    payload: Stripe.PaymentIntentCreateParams,
    userId: string,
    userStripeId: string,
  ): Promise<Response<Invoice>>;
  // initiatePaymentProcess(
  //   payload: Stripe.PaymentIntentCreateParams,
  //   user: User,
  // ): Promise<Response<Invoice>>;
  prepareOrderForPayment(userId: string, stripeId: string): Promise<Invoice>;
  handleSuccessfulPayment(
    stripeId: string,
    invoiceId: string,
  ): Promise<boolean>;
}
