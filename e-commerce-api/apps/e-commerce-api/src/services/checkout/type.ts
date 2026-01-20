import {
  CartItemRepository,
  CartRepository,
  OrderItemRepository,
  OrderRepository,
  ProductRepository,
  UserRepository,
} from "#repositories/types";
import { PaymentGateway } from "#services/types";
import { TRepository } from "#types/container";
import Stripe from "stripe";
import { TStripePaymentGateway } from "../payment-gateway";

export abstract class AbstractCheckoutService {
  protected userRepository: UserRepository;
  protected cartRepository: CartRepository;
  protected cartItemRepository: CartItemRepository;
  protected productRepository: ProductRepository;
  protected orderRepository: OrderRepository;
  protected orderItemRepository: OrderItemRepository;

  constructor(
    repositories: TRepository,
    protected paymentGetway: PaymentGateway<Stripe, TStripePaymentGateway>,
  ) {
    Object.assign(this, repositories);
  }

  abstract checkout(
    stripeId: string,
    paymentIntentId: string,
  ): Promise<boolean>;

  abstract createCheckoutPayment(
    payload: Stripe.PaymentIntentCreateParams,
    userId: string,
  ): Promise<Stripe.PaymentIntent>;
}
