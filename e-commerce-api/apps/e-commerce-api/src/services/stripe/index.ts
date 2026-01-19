import Stripe from "stripe";
import {
  PaymentService as AbstractPayment,
  Customer,
  CustomerCreateParams,
  PaymentIntent,
  PaymentIntentCreateParams,
} from "./type";
import { convertToSubcurrency } from "#utils/convertToSubcurrency";

export class StripePaymentService implements AbstractPayment {
  stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_API_KEY!);
  }

  async createPaymentIntent({
    amount,
    currency,
    customer,
  }: PaymentIntentCreateParams): Promise<PaymentIntent> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: convertToSubcurrency(amount),
      currency: currency,
      automatic_payment_methods: { enabled: true },
      customer: customer,
    });

    return paymentIntent;
  }

  async createCustomer({
    email,
    ...params
  }: CustomerCreateParams): Promise<Customer> {
    const customer = await this.stripe.customers.create({
      email,
      ...params,
    });

    return customer;
  }

  async getCustomer(id: string): Promise<Customer | null | string> {
    const customer = await this.stripe.customers.retrieve(id);
    console.log("customer", customer);

    return customer;
  }
}
