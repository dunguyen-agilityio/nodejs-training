import {
  ApiList,
  Charge,
  Customer,
  CustomerCreateParams,
  Invoice,
  InvoiceCreateParams,
  InvoiceItem,
  InvoiceItemCreateParams,
  InvoicePaymentExpand,
  PaymentGateway,
  PaymentIntent,
  PaymentIntentCreateParams,
  TResponse,
} from '#types'
import Stripe from 'stripe'

import { convertToSubcurrency } from '#utils/convertToSubcurrency'

import '#types/error'
import { IProduct, ProductCreateParams } from '#types/product'

export class StripePaymentAdapter implements PaymentGateway {
  constructor(private stripe: Stripe) {}

  async findOrCreateCustomer(params: CustomerCreateParams): Promise<Customer> {
    const response = await this.stripe.customers.list({
      email: params.email,
      limit: 1,
    })
    let customer = response.data[0]
    if (!customer) {
      customer = await this.createCustomer(params)
    }

    return customer as Customer
  }

  async createCustomer(params: CustomerCreateParams): Promise<Customer> {
    const customer = await this.stripe.customers.create(params)
    return customer
  }

  async createProduct(
    params: ProductCreateParams,
  ): Promise<TResponse<IProduct>> {
    return await this.stripe.products.create(params)
  }

  async createPaymentIntents({
    amount,
    ...payload
  }: PaymentIntentCreateParams): Promise<TResponse<PaymentIntent>> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      ...payload,
      amount: convertToSubcurrency(amount),
      automatic_payment_methods: { enabled: true },
    })
    return paymentIntent
  }

  async getPaymentIntents(
    paymentIntentId: string,
  ): Promise<TResponse<PaymentIntent>> {
    return await this.stripe.paymentIntents.retrieve(paymentIntentId)
  }

  async createInvoice({
    customer: customerId,
    ...params
  }: InvoiceCreateParams): Promise<TResponse<Invoice>> {
    const drafts = await this.stripe.invoices.list({
      customer: customerId,
      status: 'open',
      limit: 10,
    })

    if (drafts.data.length > 0) {
      await Promise.all(
        drafts.data.map((item) => this.stripe.invoices.voidInvoice(item.id)),
      )
    }

    const invoice = await this.stripe.invoices.create({
      customer: customerId,
      auto_advance: true,
      ...params,
    })

    return invoice as TResponse<Invoice>
  }

  async createInvoiceItem(
    params: InvoiceItemCreateParams,
  ): Promise<TResponse<InvoiceItem>> {
    return (await this.stripe.invoiceItems.create(
      params,
    )) as TResponse<InvoiceItem>
  }

  async finalizeInvoice(id: string): Promise<TResponse<Invoice>> {
    return (await this.stripe.invoices.finalizeInvoice(id, {
      expand: ['confirmation_secret'],
    })) as TResponse<Invoice>
  }

  async getPaymentIntent(id: string): Promise<TResponse<PaymentIntent>> {
    return await this.stripe.paymentIntents.retrieve(id, {
      expand: ['payment_method.card'],
    })
  }

  async getInvoice(id: string): Promise<TResponse<Invoice>> {
    try {
      const invoice = await this.stripe.invoices.retrieve(id, {
        expand: ['payments', 'payment_intent.latest_charge'],
      })
      return invoice as TResponse<Invoice>
    } catch (error) {
      console.error('Error - getInvoice: ', error)
      throw error
    }
  }

  async getCharge(id: string): Promise<Charge> {
    return await this.stripe.charges.retrieve(id)
  }

  async getInvoicePayment(
    id: string,
  ): Promise<TResponse<InvoicePaymentExpand>> {
    return (await this.stripe.invoicePayments.retrieve(id, {
      expand: [
        'payment.payment_intent.payment_method',
        'payment.payment_intent.latest_charge',
      ],
    })) as TResponse<InvoicePaymentExpand>
  }

  async getProducts(): Promise<TResponse<ApiList<IProduct>>> {
    const products = await this.stripe.products.list()
    return products
  }

  async getOpenedInvoiceByUser(id: string): Promise<Invoice> {
    const { data: invoices } = await this.stripe.invoices.list({
      customer: id,
      status: 'open',
      limit: 1,
    })

    const invoice = invoices[0]

    if (!invoice) throw new NotFoundError('Invoice not found')

    return invoice as Invoice
  }
}
