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
  ApiList,
  Invoice,
  InvoiceCreateParams,
  InvoiceItem,
  InvoiceItemCreateParams,
} from "#types/invoice";
import { IProduct, ProductCreateParams } from "#types/product";
import { NotFoundError } from "#types/error";

export class StripePaymentGatewayProvider implements IPaymentGatewayProvider {
  constructor(private stripe = new Stripe(process.env.STRIPE_API_KEY!)) {}

  async findOrCreateCustomer(params: CustomerCreateParams): Promise<Customer> {
    const response = await this.stripe.customers.list({
      email: params.email,
      limit: 1,
    });
    let customer = response.data[0];
    if (!customer) {
      customer = await this.createCustomer(params);
    }

    return customer as Customer;
  }

  async createCustomer(params: CustomerCreateParams): Promise<Customer> {
    const customer = await this.stripe.customers.create(params);
    return customer;
  }

  async createProduct(
    params: ProductCreateParams,
  ): Promise<Response<IProduct>> {
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

    return invoice as Response<Invoice>;
  }

  async createInvoiceItem(
    params: InvoiceItemCreateParams,
  ): Promise<Response<InvoiceItem>> {
    return (await this.stripe.invoiceItems.create(
      params,
    )) as Response<InvoiceItem>;
  }

  async finalizeInvoice(id: string): Promise<Response<Invoice>> {
    return (await this.stripe.invoices.finalizeInvoice(id, {
      expand: ["confirmation_secret"],
    })) as Response<Invoice>;
  }

  async getPaymentIntent(id: string): Promise<Response<PaymentIntent>> {
    return await this.stripe.paymentIntents.retrieve(id, {
      expand: ["payment_method.card"],
    });
  }

  async getInvoice(id: string): Promise<Response<Invoice>> {
    try {
      const invoice = await this.stripe.invoices.retrieve(id, {
        expand: ["payments", "payment_intent.latest_charge"],
      });
      return invoice as Response<Invoice>;
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

  async getProducts(): Promise<Response<ApiList<Product>>> {
    const products = await this.stripe.products.list();
    return products;
  }

  async getOpenedInvoiceByUser(id: string): Promise<Invoice> {
    const { data: invoices } = await this.stripe.invoices.list({
      customer: id,
      status: "open",
      limit: 1,
    });

    const invoice = invoices[0];

    if (!invoice) throw new NotFoundError("Invoice not found");

    return invoice as Invoice;
  }
}
