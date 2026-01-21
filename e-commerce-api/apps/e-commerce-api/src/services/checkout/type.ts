import {
  CartItemRepository,
  CartRepository,
  OrderItemRepository,
  OrderRepository,
  ProductRepository,
  UserRepository,
} from "#repositories/types";
import Stripe from "stripe";
import { TStripePaymentGateway } from "../payment-gateway";
import { BaseService } from "#services/base";
import { PaymentGatewayProvider } from "../../providers/types";

export abstract class AbstractCheckoutService extends BaseService<
  PaymentGatewayProvider<Stripe, TStripePaymentGateway>
> {
  protected userRepository: UserRepository;
  protected cartRepository: CartRepository;
  protected cartItemRepository: CartItemRepository;
  protected productRepository: ProductRepository;
  protected orderRepository: OrderRepository;
  protected orderItemRepository: OrderItemRepository;

  abstract checkout(
    stripeId: string,
    paymentIntentId: string,
  ): Promise<boolean>;

  abstract createCheckoutPayment(
    payload: Stripe.PaymentIntentCreateParams,
    userId: string,
  ): Promise<Stripe.PaymentIntent>;
}
