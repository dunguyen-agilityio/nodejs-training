import { Customer, DeletedCustomer, Payment } from "./payment";

export interface InvoiceItemPreview {
  amount?: number;
  currency?: string;
  description?: string;
  price?: string;
  quantity?: number;
  price_data: PriceData;
}

interface InvoiceLineItem {
  /**
   * Unique identifier for the object.
   */
  id: string;

  /**
   * String representing the object's type. Objects of the same type share the same value.
   */
  object: "line_item";

  /**
   * The amount, in cents (or local equivalent).
   */
  amount: number;

  /**
   * Three-letter [ISO currency code](https://www.iso.org/iso-4217-currency-codes.html), in lowercase. Must be a [supported currency](https://stripe.com/docs/currencies).
   */
  currency: string;

  /**
   * An arbitrary string attached to the object. Often useful for displaying to users.
   */
  description: string | null;

  // /**
  //  * The amount of discount calculated per discount for this line item.
  //  */
  // discount_amounts: Array<InvoiceLineItem.DiscountAmount> | null;

  // /**
  //  * If true, discounts will apply to this line item. Always false for prorations.
  //  */
  // discountable: boolean;

  // /**
  //  * The discounts applied to the invoice line item. Line item discounts are applied before invoice discounts. Use `expand[]=discounts` to expand each discount.
  //  */
  // discounts: Array<string | Stripe.Discount>;

  // /**
  //  * The ID of the invoice that contains this line item.
  //  */
  // invoice: string | null;

  // /**
  //  * Has the value `true` if the object exists in live mode or the value `false` if the object exists in test mode.
  //  */
  // livemode: boolean;

  // /**
  //  * Set of [key-value pairs](https://docs.stripe.com/api/metadata) that you can attach to an object. This can be useful for storing additional information about the object in a structured format. Note that for line items with `type=subscription`, `metadata` reflects the current metadata from the subscription associated with the line item, unless the invoice line was directly updated with different metadata after creation.
  //  */
  // metadata: Stripe.Metadata;

  // /**
  //  * The parent that generated this line item.
  //  */
  // parent: InvoiceLineItem.Parent | null;

  // period: InvoiceLineItem.Period;

  // /**
  //  * Contains pretax credit amounts (ex: discount, credit grants, etc) that apply to this line item.
  //  */
  // pretax_credit_amounts: Array<InvoiceLineItem.PretaxCreditAmount> | null;

  // /**
  //  * The pricing information of the line item.
  //  */
  // pricing: InvoiceLineItem.Pricing | null;

  // /**
  //  * The quantity of the subscription, if the line item is a subscription or a proration.
  //  */
  // quantity: number | null;

  // subscription: string | Stripe.Subscription | null;

  // /**
  //  * The subtotal of the line item, in cents (or local equivalent), before any discounts or taxes.
  //  */
  // subtotal: number;

  // /**
  //  * The tax information of the line item.
  //  */
  // taxes: Array<InvoiceLineItem.Tax> | null;
}

export interface ApiList<T> {
  object: "list";
  data: Array<T>;
  has_more: boolean;
  url: string;
}

interface DeletedInvoice {
  id: string;
  object: "invoice";
  deleted: true;
}

interface StatusTransitions {
  finalized_at: number | null;
  marked_uncollectible_at: number | null;
  paid_at: number | null;
  voided_at: number | null;
}

interface PaymentMethodCard {
  brand: string;
  country: string | null;
  description?: string | null;
  display_brand: string | null;
  exp_month: number;
  exp_year: number;
  fingerprint?: string | null;
  funding: string;
  issuer?: string | null;
  last4: string;
}

interface PaymentMethodLink {
  email: string | null;
  persistent_token?: string;
}

export type PaymentMethodType = "card" | "link";
export interface PaymentMethod {
  id: string;
  object: "payment_method";
  card?: PaymentMethodCard;
  link?: PaymentMethodLink;
  created: number;
  customer: string | Customer | null;
  customer_account: string | null;
  type: PaymentMethodType | string;
}

export interface Invoice {
  id: string;
  object: "invoice";
  account_country: string | null;
  account_name: string | null;
  amount_due: number;
  amount_overpaid: number;
  amount_paid: number;
  amount_remaining: number;
  amount_shipping: number;
  attempt_count: number;
  attempted: boolean;
  auto_advance?: boolean;
  automatically_finalizes_at: number | null;
  created: number;
  currency: string;
  customer: string | Customer | DeletedCustomer | null;
  customer_account: string | null;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  deleted?: void;
  description: string | null;
  lines: ApiList<InvoiceLineItem>;
  number: string | null;
  payments?: ApiList<InvoicePayment>;
  statement_descriptor: string | null;
  status: InvoiceStatus | null;
  total: number;
  confirmation_secret?: InvoiceConfirmationSecret | null;
  effective_at: number | null;
  status_transitions: StatusTransitions;
  hosted_invoice_url?: string | null;
  invoice_pdf?: string | null;
  receipt_number: string | null;
}

interface InvoiceConfirmationSecret {
  client_secret: string;
  type: string;
}

export interface InvoicePayment {
  id: string;
  object: "invoice_payment";
  amount_paid: number | null;
  amount_requested: number;
  created: number;
  currency: string;
  invoice: string | Invoice | DeletedInvoice;
  status: string;
  payment?: Payment;
}

interface PriceData {
  currency: string;
  product: string;
  unit_amount?: number;
}

type InvoiceStatus = "draft" | "open" | "paid" | "uncollectible" | "void";

export interface InvoiceCreatePreviewParams {
  currency?: string;
  customer?: string;
  invoice_items?: Array<InvoiceItemPreview & { description?: string }>;
}

export interface InvoiceItemCreateParams {
  amount?: number;
  currency?: string;
  customer?: string;
  customer_account?: string;
  description?: string;
  invoice?: string;
  quantity?: number;
  price_data?: PriceData;
}

export interface InvoiceItem {
  id: string;
  object: "invoiceitem";
  amount: number;
  currency: string;
  customer: string | Customer | DeletedCustomer;
  customer_account: string | null;
  date: number;
  deleted?: void;
  description: string | null;
  invoice: string | Invoice | null;
  quantity: number;
}

export interface InvoiceCreateParams {
  auto_advance?: boolean;
  automatically_finalizes_at?: number;
  currency?: string;
  customer?: string;
  customer_account?: string;
  default_payment_method?: string;
  description?: string;
}
