import Stripe from "stripe";
import { IPaymentGatewayProvider } from "./type";
import { convertToSubcurrency } from "#utils/convertToSubcurrency";
import {
  Charge,
  Customer,
  CustomerCreateParams,
  InvoicePaymentExpand,
  PaymentIntent,
  PaymentIntentCreateParams,
  Response,
} from "#types/payment";
import {
  Invoice,
  InvoiceCreateParams,
  InvoiceItem,
  InvoiceItemCreateParams,
} from "#types/invoice";
import { Product, ProductCreateParams } from "#types/product";

export class StripePaymentGatewayProvider implements IPaymentGatewayProvider {
  constructor(private stripe = new Stripe(process.env.STRIPE_API_KEY!)) {}

  async findOrCreateCustomer(params: CustomerCreateParams): Promise<Customer> {
    const response = await this.stripe.customers.list({
      email: params.email,
      limit: 1,
    });
    let customer = response.data[0];
    if (!customer) {
      customer = await this.stripe.customers.create(params);
    }

    return customer;
  }

  async createProduct(params: ProductCreateParams): Promise<Response<Product>> {
    return await this.stripe.products.create(params);
  }

  async createPaymentIntents({
    amount,
    ...payload
  }: PaymentIntentCreateParams): Promise<Response<PaymentIntent>> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      ...payload,
      amount: convertToSubcurrency(amount),
      automatic_payment_methods: { enabled: true },
    });
    return paymentIntent;
  }

  async getPaymentIntents(
    paymentIntentId: string,
  ): Promise<Response<PaymentIntent>> {
    return await this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  async createInvoice({
    customer: customerId,
    ...params
  }: InvoiceCreateParams): Promise<Response<Invoice>> {
    const drafts = await this.stripe.invoices.list({
      customer: customerId,
      status: "open",
      limit: 10,
    });

    if (drafts.data.length > 0) {
      await Promise.all(
        drafts.data.map((item) => this.stripe.invoices.voidInvoice(item.id)),
      );
    }

    const invoice = await this.stripe.invoices.create({
      customer: customerId,
      auto_advance: true,
      ...params,
    });

    return invoice;
  }

  async createInvoiceItem(
    params: InvoiceItemCreateParams,
  ): Promise<Response<InvoiceItem>> {
    return await this.stripe.invoiceItems.create(params);
  }

  async finalizeInvoice(id: string) {
    return await this.stripe.invoices.finalizeInvoice(id, {
      expand: ["confirmation_secret"],
    });
  }

  async getPaymentIntent(id: string): Promise<Response<PaymentIntent>> {
    return await this.stripe.paymentIntents.retrieve(id, {
      expand: ["payment_method.card"],
    });
  }

  async getInvoice(id: string): Promise<Response<Invoice>> {
    try {
      return await this.stripe.invoices.retrieve(id, {
        expand: ["payments", "payment_intent.latest_charge"],
      });
    } catch (error) {
      console.error("Error - getInvoice: ", error);
      throw error;
    }
  }

  async getCharge(id: string): Promise<Charge> {
    return await this.stripe.charges.retrieve(id);
  }

  async getInvoicePayment(id: string): Promise<Response<InvoicePaymentExpand>> {
    return (await this.stripe.invoicePayments.retrieve(id, {
      expand: [
        "payment.payment_intent.payment_method",
        "payment.payment_intent.latest_charge",
      ],
    })) as Response<InvoicePaymentExpand>;
  }
}
