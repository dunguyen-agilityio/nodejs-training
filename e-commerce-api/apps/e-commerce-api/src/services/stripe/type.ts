import { User } from "#entities";
import { OrderItemRepository } from "#repositories/order-item/index";
import { OrderRepository } from "#repositories/order/index";
import {
  CartItemRepository,
  CartRepository,
  ProductRepository,
  UserRepository,
} from "#repositories/types";
import { BaseService } from "#services/base";

export interface PaymentIntentCreateParams {
  /**
   * Amount intended to be collected by this PaymentIntent. A positive integer representing how much to charge in the [smallest currency unit](https://docs.stripe.com/currencies#zero-decimal) (e.g., 100 cents to charge $1.00 or 100 to charge ¥100, a zero-decimal currency). The minimum amount is $0.50 US or [equivalent in charge currency](https://docs.stripe.com/currencies#minimum-and-maximum-charge-amounts). The amount value supports up to eight digits (e.g., a value of 99999999 for a USD charge of $999,999.99).
   */
  amount: number;

  /**
   * Three-letter [ISO currency code](https://www.iso.org/iso-4217-currency-codes.html), in lowercase. Must be a [supported currency](https://stripe.com/docs/currencies).
   */
  currency: string;

  /**
   * ID of the Customer this PaymentIntent belongs to, if one exists.
   *
   * Payment methods attached to other Customers cannot be used with this PaymentIntent.
   *
   * If [setup_future_usage](https://api.stripe.com#payment_intent_object-setup_future_usage) is set and this PaymentIntent's payment method is not `card_present`, then the payment method attaches to the Customer after the PaymentIntent has been confirmed and any required actions from the user are complete. If the payment method is `card_present` and isn't a digital wallet, then a [generated_card](https://docs.stripe.com/api/charges/object#charge_object-payment_method_details-card_present-generated_card) payment method representing the card is created and attached to the Customer instead.
   */
  customer?: string;

  /**
   * ID of the payment method (a PaymentMethod, Card, or [compatible Source](https://docs.stripe.com/payments/payment-methods#compatibility) object) to attach to this PaymentIntent.
   *
   * If you don't provide the `payment_method` parameter or the `source` parameter with `confirm=true`, `source` automatically populates with `customer.default_source` to improve migration for users of the Charges API. We recommend that you explicitly provide the `payment_method` moving forward.
   * If the payment method is attached to a Customer, you must also provide the ID of that Customer as the [customer](https://api.stripe.com#create_payment_intent-customer) parameter of this PaymentIntent.
   * end
   */
  payment_method?: string;
}

export interface CustomerCreateParams {
  /**
   * An integer amount in cents (or local equivalent) that represents the customer's current balance, which affect the customer's future invoices. A negative amount represents a credit that decreases the amount due on an invoice; a positive amount increases the amount due on an invoice.
   */
  balance?: number;

  /**
   * An arbitrary string that you can attach to a customer object. It is displayed alongside the customer in the dashboard.
   */
  description?: string;

  /**
   * Customer's email address. It's displayed alongside the customer in your dashboard and can be useful for searching and tracking. This may be up to *512 characters*.
   */
  email?: string;

  /**
   * The customer's full name or business name.
   */
  name?: string;

  payment_method?: string;

  /**
   * The customer's phone number.
   */
  phone?: string;
}

export interface Customer {
  /**
   * Unique identifier for the object.
   */
  id: string;

  /**
   * The current balance, if any, that's stored on the customer in their default currency. If negative, the customer has credit to apply to their next invoice. If positive, the customer has an amount owed that's added to their next invoice. The balance only considers amounts that Stripe hasn't successfully applied to any invoice. It doesn't reflect unpaid invoices. This balance is only taken into account after invoices finalize. For multi-currency balances, see [invoice_credit_balance](https://docs.stripe.com/api/customers/object#customer_object-invoice_credit_balance).
   */
  balance: number;

  /**
   * The customer's business name.
   */
  business_name?: string;

  /**
   * Time at which the object was created. Measured in seconds since the Unix epoch.
   */
  created: number;

  /**
   * Three-letter [ISO code for the currency](https://stripe.com/docs/currencies) the customer can be charged in for recurring billing purposes.
   */
  currency?: string | null;

  /**
   * The ID of an Account representing a customer. You can use this ID with any v1 API that accepts a customer_account parameter.
   */
  customer_account?: string | null;

  /**
   * Always true for a deleted object
   */
  deleted?: void;

  /**
   * An arbitrary string attached to the object. Often useful for displaying to users.
   */
  description: string | null;

  /**
   * The customer's email address.
   */
  email: string | null;

  /**
   * The customer's full name or business name.
   */
  name?: string | null;

  /**
   * The customer's phone number.
   */
  phone?: string | null;
}

export interface PaymentIntent {
  /**
   * Unique identifier for the object.
   */
  id: string;

  /**
   * Amount intended to be collected by this PaymentIntent. A positive integer representing how much to charge in the [smallest currency unit](https://docs.stripe.com/currencies#zero-decimal) (e.g., 100 cents to charge $1.00 or 100 to charge ¥100, a zero-decimal currency). The minimum amount is $0.50 US or [equivalent in charge currency](https://docs.stripe.com/currencies#minimum-and-maximum-charge-amounts). The amount value supports up to eight digits (e.g., a value of 99999999 for a USD charge of $999,999.99).
   */
  amount: number;

  /**
   * Amount that can be captured from this PaymentIntent.
   */
  amount_capturable: number;

  /**
   * Amount that this PaymentIntent collects.
   */
  amount_received: number;

  /**
   * Populated when `status` is `canceled`, this is the time at which the PaymentIntent was canceled. Measured in seconds since the Unix epoch.
   */
  canceled_at: number | null;

  /**
   * The client secret of this PaymentIntent. Used for client-side retrieval using a publishable key.
   *
   * The client secret can be used to complete a payment from your frontend. It should not be stored, logged, or exposed to anyone other than the customer. Make sure that you have TLS enabled on any page that includes the client secret.
   *
   * Refer to our docs to [accept a payment](https://docs.stripe.com/payments/accept-a-payment?ui=elements) and learn about how `client_secret` should be handled.
   */
  client_secret: string | null;

  /**
   * Time at which the object was created. Measured in seconds since the Unix epoch.
   */
  created: number;

  /**
   * Three-letter [ISO currency code](https://www.iso.org/iso-4217-currency-codes.html), in lowercase. Must be a [supported currency](https://stripe.com/docs/currencies).
   */
  currency: string;

  /**
   * The list of payment method types (e.g. card) that this PaymentIntent is allowed to use. A comprehensive list of valid payment method types can be found [here](https://docs.stripe.com/api/payment_methods/object#payment_method_object-type).
   */
  payment_method_types: Array<string>;

  /**
   * Status of this PaymentIntent, one of `requires_payment_method`, `requires_confirmation`, `requires_action`, `processing`, `requires_capture`, `canceled`, or `succeeded`. Read more about each PaymentIntent [status](https://docs.stripe.com/payments/intents#intent-statuses).
   */
  status: Status;

  /**
   * A string that identifies the resulting payment as part of a group. Learn more about the [use case for connected accounts](https://docs.stripe.com/connect/separate-charges-and-transfers).
   */
  transfer_group: string | null;
}

type Status =
  | "canceled"
  | "processing"
  | "requires_action"
  | "requires_capture"
  | "requires_confirmation"
  | "requires_payment_method"
  | "succeeded";

export abstract class PaymentService extends BaseService {
  protected userRepository: UserRepository;
  protected cartRepository: CartRepository;
  protected cartItemRepository: CartItemRepository;
  protected productRepository: ProductRepository;
  protected orderRepository: OrderRepository;
  protected orderItemRepository: OrderItemRepository;

  abstract createPaymentIntent(
    payment: PaymentIntentCreateParams
  ): Promise<PaymentIntent>;
  abstract createCustomer(params: CustomerCreateParams): Promise<Customer>;
  abstract getUserByStripeId(stripeId: string): Promise<User | null>;
  abstract clearCart(userId: string): Promise<void>;
  abstract checkout(userId: string, paymentIntentId: string): Promise<void>;
  abstract checkout1(userId: string, paymentIntentId: string): Promise<void>;
}
