import {
  CartItemRepository,
  CartRepository,
  OrderItemRepository,
  OrderRepository,
  ProductRepository,
  UserRepository,
} from "#repositories/types";
import Stripe from "stripe";
import { BaseService } from "#services/base";
import { PaymentGatewayProvider } from "../../providers/types";

export abstract class AbstractCheckoutService<
  P extends PaymentGatewayProvider = PaymentGatewayProvider,
> extends BaseService<P> {
  protected userRepository: UserRepository = null!;
  protected cartRepository: CartRepository = null!;
  protected cartItemRepository: CartItemRepository = null!;
  protected productRepository: ProductRepository = null!;
  protected orderRepository: OrderRepository = null!;
  protected orderItemRepository: OrderItemRepository = null!;

  constructor(base: AbstractCheckoutService, provider: BaseService<P>) {
    super(provider);
    Object.assign(this, base);
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
