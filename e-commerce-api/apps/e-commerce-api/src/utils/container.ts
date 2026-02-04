import { DataSource } from "typeorm";

import {
  Cart,
  CartItem,
  Category,
  Invoice,
  InvoiceItem,
  Order,
  OrderItem,
  Product,
  StockReservation,
  User,
} from "#entities";

import {
  CartItemRepository,
  CartRepository,
  CategoryRepository,
  InvoiceItemRepository,
  InvoiceRepository,
  OrderItemRepository,
  OrderRepository,
  ProductRepository,
  StockReservationRepository,
  UserRepository,
} from "#repositories";
import {
  AdminOrderController,
  AuthController,
  CartController,
  CartItemController,
  CategoryController,
  CheckoutController,
  MetricController,
  OrderController,
  ProductController,
} from "#controllers";

import * as Controllers from "#controllers";

import { FastifyInstance } from "fastify";
import { PaymentGateway } from "#types/payment";
import { SendGridEmailAdapter, StripePaymentAdapter } from "#adapters";
import { EmailProvider } from "#types/mail";
import {
  MetricService,
  AuthService,
  CartItemService,
  CartService,
  CategoryService,
  CheckoutService,
  OrderService,
  ProductService,
  UserService,
} from "#services";

export function buildControllers(
  services: ReturnType<typeof buildServices>,
): Controllers.TControllers {
  return {
    productController: new ProductController(services.productService),
    adminOrderController: new AdminOrderController(services.orderService),
    authController: new AuthController(services.authService),
    cartController: new CartController(services.cartService),
    cartItemController: new CartItemController(services.cartItemService),
    categoryController: new CategoryController(services.categoryService),
    checkoutController: new CheckoutController(services.checkoutService),
    metricController: new MetricController(services.metricService),
    orderController: new OrderController(services.orderService),
  };
}

export function buildServices(
  repos: ReturnType<typeof buildRepositories>,
  adapters: { paymentGateway: PaymentGateway; emailProvider: EmailProvider },
) {
  const {
    cartItemRepository,
    cartRepository,
    categoryRepository,
    orderRepository,
    productRepository,
    userRepository,
  } = repos;
  const { emailProvider, paymentGateway } = adapters;

  return {
    productService: new ProductService(productRepository, paymentGateway),
    userService: new UserService(userRepository, paymentGateway),
    cartService: new CartService(
      cartRepository,
      cartItemRepository,
      productRepository,
    ),
    cartItemService: new CartItemService(cartItemRepository),
    categoryService: new CategoryService(categoryRepository),
    orderService: new OrderService(
      orderRepository,
      cartRepository,
      productRepository,
    ),
    checkoutService: new CheckoutService(
      userRepository,
      cartRepository,
      orderRepository,
      paymentGateway,
      emailProvider,
    ),
    authService: new AuthService(
      userRepository,
      cartRepository,
      paymentGateway,
      emailProvider,
    ),
    metricService: new MetricService(productRepository),
  };
}

export function buildRepositories(ds: DataSource) {
  return {
    productRepository: new ProductRepository(ds.getRepository(Product)),
    userRepository: new UserRepository(ds.getRepository(User)),
    cartRepository: new CartRepository(ds.getRepository(Cart)),
    cartItemRepository: new CartItemRepository(ds.getRepository(CartItem)),
    categoryRepository: new CategoryRepository(ds.getRepository(Category)),
    orderRepository: new OrderRepository(ds.getRepository(Order)),
    orderItemRepository: new OrderItemRepository(ds.getRepository(OrderItem)),
    invoiceItemRepository: new InvoiceItemRepository(
      ds.getRepository(InvoiceItem),
    ),
    invoiceRepository: new InvoiceRepository(ds.getRepository(Invoice)),
    stockReservationRepository: new StockReservationRepository(
      ds.getRepository(StockReservation),
    ),
  };
}

export function buildAdapters(fastify: FastifyInstance) {
  const paymentGateway: PaymentGateway = new StripePaymentAdapter(
    fastify.stripe,
  );

  const emailProvider: EmailProvider = new SendGridEmailAdapter(
    fastify.sendgrid,
  );

  return { paymentGateway, emailProvider };
}

export function buildContainer(
  fastify: FastifyInstance,
  dataSource: DataSource,
) {
  const repositories = buildRepositories(dataSource);
  const adapters = buildAdapters(fastify);
  const services = buildServices(repositories, adapters);
  const controllers = buildControllers(services);

  const container = { repositories, services, controllers };
  fastify.decorate("container", { getter: () => container });
  fastify.decorateRequest("container", { getter: () => container });
  return container;
}

export type TContainer = ReturnType<typeof buildContainer>;
