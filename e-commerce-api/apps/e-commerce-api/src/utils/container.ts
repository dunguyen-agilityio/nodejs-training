import { DataSource, EntityTarget, ObjectLiteral, Repository } from "typeorm";

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
import * as Entities from "#entities";
import * as Repositories from "#repositories";
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
import * as Services from "#services";
import * as Controllers from "#controllers";
import * as Providers from "#providers";
import { create, hasProperty } from "./object";
import { Dependencies } from "#services/base";
import { uncapitalize } from "./string";
import { FastifyInstance } from "fastify";
import { PaymentGateway } from "#types/payment";
import { SendGridEmailAdapter, StripePaymentAdapter } from "#adapters";
import { EmailProvider } from "#types/mail";
import { ProductService } from "#services/product1/index";
import { UserService } from "#services/user1/index";
import { CartService } from "#services/cart1/index";
import { CartItemService } from "#services/cart-item1/index";
import { CategoryService } from "#services/category1/index";
import { OrderService } from "#services/order1/index";
import { CheckoutService } from "#services/checkout1/index";
import { AuthService } from "#services/auth1/index";
import { MetricService } from "#services/metric1/index";
import { TController } from "#types/container";

const ProviderMapping = {
  SendGridMailProvider: "MailProvider",
  StripePaymentGatewayProvider: "PaymentGatewayProvider",
};

type ModuleKey =
  | keyof typeof Entities
  | "Checkout"
  | "Auth"
  | "Metric"
  | "AdminOrder"
  | keyof typeof ProviderMapping;

type TRepository = typeof Repositories;
type TService = typeof Services;

type AllRegister = Controllers.Controllers &
  Services.Services &
  Providers.Providers;

type TAllRegister = {
  [key in keyof AllRegister]: AllRegister[key];
};

type Register<T extends keyof AllRegister> = TAllRegister[T];

export class Container {
  static #instance: Container;
  items: Map<string, any> = new Map();
  #dependencies = {} as Record<keyof Dependencies, any>;

  private constructor() {}

  static get instance() {
    if (!this.#instance) {
      this.#instance = new Container();
    }

    return this.#instance;
  }

  getItem<T extends keyof AllRegister>(name: T): Register<T> {
    const item = this.items.get(name);

    if (!item) {
      throw new Error(`Missing register ${name}`);
    }

    return item as Register<T>;
  }

  setItem(name: string, value: any) {
    return this.items.set(name, value);
  }

  setDataSource(dataSource: DataSource) {
    Object.entries(Entities).forEach(([key, Entity]) => {
      const [repositoryKey, repositoryName] = create<TRepository>(key, {
        type: "Repository",
      });

      if (repositoryKey in Repositories) {
        this.#dependencies[uncapitalize(repositoryName) as keyof Dependencies] =
          new Repositories[repositoryKey](
            dataSource.manager.getRepository(Entity) as any,
          );
      } else {
        console.log("Missing register: ", key);
      }
    });

    return this;
  }

  register<T extends ModuleKey>(key: T) {
    const [providerKey, providerName] = create<typeof Providers>(key, {
      nameMapping: ProviderMapping,
    });

    if (hasProperty<keyof typeof Providers>(providerKey, Providers)) {
      const provider = new Providers[providerKey]();

      this.#dependencies[uncapitalize(providerName) as keyof Dependencies] =
        provider;
      this.setItem(providerName, provider);
      return this;
    }

    const [serviceKey] = create<TService>(key, { type: "Service" });
    const [controllerKey] = create<typeof Controllers>(key, {
      type: "Controller",
    });

    if (hasProperty<keyof TService>(serviceKey, Services)) {
      const service = new Services[serviceKey](this.#dependencies);
      this.setItem(serviceKey, service);

      if (hasProperty<keyof typeof Controllers>(controllerKey, Controllers)) {
        const controller = new Controllers[controllerKey](service as any);
        this.setItem(controllerKey, controller);
      }
    }

    return this;
  }
}

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
  return {
    productService: new ProductService(
      repos.productRepository,
      adapters.paymentGateway,
    ),
    userService: new UserService(repos.userRepository),
    cartService: new CartService(
      repos.cartRepository,
      repos.cartItemRepository,
      repos.productRepository,
    ),
    cartItemService: new CartItemService(repos.cartItemRepository),
    categoryService: new CategoryService(repos.categoryRepository),
    orderService: new OrderService(
      repos.orderRepository,
      repos.cartRepository,
      repos.productRepository,
    ),
    checkoutService: new CheckoutService(
      repos.userRepository,
      repos.cartRepository,
      repos.orderRepository,
      adapters.paymentGateway,
      adapters.emailProvider,
    ),
    authService: new AuthService(
      repos.userRepository,
      repos.cartRepository,
      adapters.paymentGateway,
      adapters.emailProvider,
    ),
    metricService: new MetricService(repos.productRepository),
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
  fastify.decorate("container1", container);
  return container;
}

export type TContainer = ReturnType<typeof buildContainer>;
