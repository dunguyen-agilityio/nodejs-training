import Stripe from "stripe";
import { AbstractPaymentGatewayProvider } from "./type";
import { convertToSubcurrency } from "#utils/convertToSubcurrency";

export type TStripePaymentGateway = {
  Customer: Stripe.Customer;
  PaymentIntent: Stripe.PaymentIntent;
  PaymentIntentCreateParams: Stripe.PaymentIntentCreateParams;
  CustomerCreateParams: Stripe.CustomerCreateParams;
};

export class StripePaymentGatewayProvider extends AbstractPaymentGatewayProvider<
  Stripe,
  TStripePaymentGateway
> {
  async createCustomer(
    params: Stripe.CustomerCreateParams,
  ): Promise<Stripe.Customer> {
    return this.context.customers.create(params);
  }

  async createPaymentIntents({
    amount,
    ...payload
  }: Stripe.PaymentIntentCreateParams): Promise<Stripe.PaymentIntent> {
    const paymentIntent = await this.context.paymentIntents.create({
      ...payload,
      amount: convertToSubcurrency(amount),
      automatic_payment_methods: { enabled: true },
    });
    return paymentIntent;
  }

  getPaymentIntents(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return this.context.paymentIntents.retrieve(paymentIntentId);
  }
}
