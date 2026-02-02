import {
  Invoice,
  InvoiceCreateParams,
  InvoiceItem,
  InvoiceItemCreateParams,
} from "#types/invoice";
import {
  Charge,
  Customer,
  CustomerCreateParams,
  InvoicePaymentExpand,
  PaymentIntent,
  PaymentIntentCreateParams,
  Response,
} from "#types/payment";
import { IProduct, ProductCreateParams } from "#types/product";

export interface IPaymentGatewayProvider {
  getPaymentIntents(id: string): Promise<Response<PaymentIntent>>;
  createPaymentIntents(
    payload: PaymentIntentCreateParams,
  ): Promise<Response<PaymentIntent>>;
  findOrCreateCustomer(params: CustomerCreateParams): Promise<Customer>;
  createCustomer(params: CustomerCreateParams): Promise<Customer>;
  createInvoice(params: InvoiceCreateParams): Promise<Response<Invoice>>;
  createProduct(params: ProductCreateParams): Promise<Response<IProduct>>;
  createInvoiceItem(
    params: InvoiceItemCreateParams,
  ): Promise<Response<InvoiceItem>>;
  finalizeInvoice(id: string): Promise<Response<Invoice>>;
  getInvoice(id: string): Promise<Response<Invoice>>;
  getInvoicePayment(id: string): Promise<Response<InvoicePaymentExpand>>;
  getPaymentIntent(id: string): Promise<Response<PaymentIntent>>;
  getCharge(id: string): Promise<Charge>;
  getOpenedInvoiceByUser(id: string): Promise<Invoice>;
}
