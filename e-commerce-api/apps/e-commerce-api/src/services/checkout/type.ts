import { IUserService } from "#services/types";
import { Invoice } from "#types/invoice";
import { Response } from "#types/payment";
import Stripe from "stripe";

export interface ICheckoutService {
  checkout(
    stripeId: string,
    paymentIntentId: string,
    userService: IUserService,
  ): Promise<boolean>;
  checkout1(
    stripeId: string,
    invoiceId: string,
    userService: IUserService,
  ): Promise<boolean>;

  createCheckoutPayment(
    payload: Stripe.PaymentIntentCreateParams,
    userId: string,
  ): Promise<Response<Invoice>>;
}
