import { FastifyInstance } from 'fastify'
import { DataSource } from 'typeorm'

import { SendGridEmailAdapter, StripePaymentAdapter } from '#adapters'

import {
  AuthService,
  CartItemService,
  CartService,
  CategoryService,
  CheckoutService,
  MetricService,
  OrderService,
  ProductService,
  type TServices,
  UserService,
} from '#services'

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
  TRepositories,
  UserRepository,
} from '#repositories'

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
  TControllers,
} from '#controllers'

import type { EmailProvider, PaymentGateway } from '#types'

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
} from '#entities'

/**
 * Build controllers from services
 * Can be used with registry or standalone
 */
export function buildControllers(
  services: ReturnType<typeof buildServices>,
): TControllers {
  return {
    productController: new ProductController(services.productService),
    adminOrderController: new AdminOrderController(services.orderService),
    authController: new AuthController(services.authService),
    cartController: new CartController(services.cartService),
    cartItemController: new CartItemController(services.cartItemService),
    categoryController: new CategoryController(services.categoryService),
    checkoutController: new CheckoutController(services.checkoutService),
    metricController: new MetricController(services.adminService),
    orderController: new OrderController(services.orderService),
  }
}

/**
 * Build controllers using registry
 * Alternative to manual buildControllers
 */
export function buildControllersFromRegistry(
  registry: import('#utils/container-registry').ContainerRegistry,
  services: TServices,
): TControllers {
  const controllers: Record<string, unknown> = {}

  for (const [name, controller] of registry.getControllers().entries()) {
    const deps = controller.dependencies.map((dep: string) => {
      const serviceKey =
        `${dep.replace('Service', '')}Service` as keyof TServices
      return services[serviceKey]
    })
    controllers[name] = new controller.constructor(...deps)
  }

  return controllers as TControllers
}

export function buildServices(
  repos: ReturnType<typeof buildRepositories>,
  adapters: { paymentGateway: PaymentGateway; emailProvider: EmailProvider },
  fastify: FastifyInstance,
): TServices {
  const {
    cartItemRepository,
    cartRepository,
    categoryRepository,
    orderRepository,
    productRepository,
    userRepository,
  } = repos
  const { emailProvider, paymentGateway } = adapters

  return {
    productService: new ProductService(
      productRepository,
      paymentGateway,
      fastify.log,
    ),
    userService: new UserService(userRepository, paymentGateway, fastify.log),
    cartService: new CartService(
      cartRepository,
      cartItemRepository,
      productRepository,
      fastify.log,
    ),
    cartItemService: new CartItemService(cartItemRepository, fastify.log),
    categoryService: new CategoryService(categoryRepository, fastify.log),
    orderService: new OrderService(
      orderRepository,
      cartRepository,
      productRepository,
      fastify.log,
    ),
    checkoutService: new CheckoutService(
      userRepository,
      cartRepository,
      orderRepository,
      paymentGateway,
      emailProvider,
      fastify.log,
    ),
    authService: new AuthService(
      userRepository,
      cartRepository,
      paymentGateway,
      emailProvider,
      fastify.log,
    ),
    adminService: new MetricService(productRepository, fastify.log),
  }
}

/**
 * Build repositories from DataSource
 * Can be used with registry or standalone
 */
export function buildRepositories(ds: DataSource): TRepositories {
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
  }
}

/**
 * Build repositories using registry
 * Alternative to manual buildRepositories
 */
export function buildRepositoriesFromRegistry(
  registry: import('#utils/container-registry').ContainerRegistry,
  ds: DataSource,
): TRepositories {
  const repos: Record<string, unknown> = {}

  for (const [name, repo] of registry.getRepositories().entries()) {
    const entity = ds.getRepository(repo.entityName)
    repos[name] = new repo.constructor(entity)
  }

  return repos as TRepositories
}

/**
 * Build adapters from Fastify instance
 * Can be used with registry or standalone
 */
export function buildAdapters(fastify: FastifyInstance) {
  const paymentGateway: PaymentGateway = new StripePaymentAdapter(
    fastify.stripe,
    fastify.log,
  )

  const emailProvider: EmailProvider = new SendGridEmailAdapter(
    fastify.sendgrid,
    fastify.log,
  )

  return { paymentGateway, emailProvider }
}

/**
 * Build adapters using registry
 * Alternative to manual buildAdapters
 */
export function buildAdaptersFromRegistry(
  registry: import('#utils/container-registry').ContainerRegistry,
  fastify: FastifyInstance,
): { paymentGateway: PaymentGateway; emailProvider: EmailProvider } {
  const adapters: Record<string, unknown> = {}

  for (const [name, adapter] of registry.getAdapters().entries()) {
    adapters[name] = adapter.factory(fastify)
  }

  return {
    paymentGateway: adapters.paymentGateway as PaymentGateway,
    emailProvider: adapters.emailProvider as EmailProvider,
  }
}

export function buildContainer(
  fastify: FastifyInstance,
  dataSource: DataSource,
) {
  const repositories = buildRepositories(dataSource)
  const adapters = buildAdapters(fastify)
  const services = buildServices(repositories, adapters, fastify)
  const controllers = buildControllers(services)

  const container = { repositories, services, controllers }
  fastify.decorate('container', { getter: () => container })
  fastify.decorateRequest('container', { getter: () => container })
  return container
}

export type TContainer = ReturnType<typeof buildContainer>
