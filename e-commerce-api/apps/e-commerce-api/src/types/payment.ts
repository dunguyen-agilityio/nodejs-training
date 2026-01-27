import { InvoicePayment, PaymentMethod } from "./invoice";

export interface CustomerCreateParams {
  description?: string;
  email?: string;
  name?: string;
  payment_method?: string;
  phone?: string;
}

export type Response<T> = T & {
  lastResponse: {
    headers: { [key: string]: string };
    requestId: string;
    statusCode: number;
    apiVersion?: string;
    idempotencyKey?: string;
    stripeAccount?: string;
  };
};

export interface Payment {
  payment_intent?: string | PaymentIntent;
  type: string;
}

export interface DeletedCustomer {
  id: string;
  object: "customer";
  deleted: true;
}

export interface PaymentIntentCreateParams {
  amount: number;
  currency: string;
  confirmation_token?: string;
  customer?: string;
  customer_account?: string;
  payment_method?: string;
}

export interface PaymentIntent {
  id: string;
  object: "payment_intent";
  amount: number;
  amount_capturable: number;
  canceled_at: number | null;
  client_secret: string | null;
  created: number;
  currency: string;
  customer: string | Customer | DeletedCustomer | null;
  customer_account: string | null;
  description: string | null;
  status: PaymentIntentStatus;
  payment_method: string | PaymentMethod | null;
}

export type InvoicePaymentExpand = Omit<InvoicePayment, "payment"> & {
  payment: {
    payment_intent: {
      payment_method: PaymentMethod;
    };
  };
};

type PaymentIntentStatus =
  | "canceled"
  | "processing"
  | "requires_action"
  | "requires_capture"
  | "requires_confirmation"
  | "requires_payment_method"
  | "succeeded";

export interface Customer {
  id: string;
  object: "customer";
  balance: number;
  business_name?: string;
  created: number;
  currency?: string | null;
  customer_account?: string | null;
  deleted?: void;
  description: string | null;
  email: string | null;
  name?: string | null;
  phone?: string | null;
}
