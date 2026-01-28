import Stripe from "stripe";

import { Invoice } from "#types/invoice";
import { Response } from "#types/payment";

export interface ICheckoutService {
  checkout(stripeId: string, invoiceId: string): Promise<boolean>;

  createCheckoutPayment(
    payload: Stripe.PaymentIntentCreateParams,
    userId: string,
  ): Promise<Response<Invoice>>;
}
