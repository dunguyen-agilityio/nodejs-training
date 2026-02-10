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
  UserService,
} from '#services'
import type { TServices } from '#services'

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
} from '#repositories'
import type { TRepositories } from '#repositories'

import {
  ContainerRegistry,
  createAdapterRegistration,
  createControllerRegistration,
  createRepositoryRegistration,
  createServiceRegistration,
} from '#utils/container-registry'

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
} from '#controllers'
import type { TControllers } from '#controllers'

/**
 * Initialize and configure the container registry
 * This provides a declarative way to register all dependencies
 */
export function initializeRegistry(): ContainerRegistry {
  const registry = new ContainerRegistry()

  // Register Repositories
  registry.registerRepository(
    createRepositoryRegistration(
      'productRepository',
      ProductRepository,
      'Product',
    ),
  )
  registry.registerRepository(
    createRepositoryRegistration('userRepository', UserRepository, 'User'),
  )
  registry.registerRepository(
    createRepositoryRegistration('cartRepository', CartRepository, 'Cart'),
  )
  registry.registerRepository(
    createRepositoryRegistration(
      'cartItemRepository',
      CartItemRepository,
      'CartItem',
    ),
  )
  registry.registerRepository(
    createRepositoryRegistration(
      'categoryRepository',
      CategoryRepository,
      'Category',
    ),
  )
  registry.registerRepository(
    createRepositoryRegistration('orderRepository', OrderRepository, 'Order'),
  )
  registry.registerRepository(
    createRepositoryRegistration(
      'orderItemRepository',
      OrderItemRepository,
      'OrderItem',
    ),
  )
  registry.registerRepository(
    createRepositoryRegistration(
      'invoiceRepository',
      InvoiceRepository,
      'Invoice',
    ),
  )
  registry.registerRepository(
    createRepositoryRegistration(
      'invoiceItemRepository',
      InvoiceItemRepository,
      'InvoiceItem',
    ),
  )
  registry.registerRepository(
    createRepositoryRegistration(
      'stockReservationRepository',
      StockReservationRepository,
      'StockReservation',
    ),
  )

  // Register Adapters
  registry.registerAdapter(
    createAdapterRegistration('paymentGateway', (fastify: FastifyInstance) => {
      return new StripePaymentAdapter(fastify.stripe, fastify.log)
    }),
  )
  registry.registerAdapter(
    createAdapterRegistration('emailProvider', (fastify: FastifyInstance) => {
      return new SendGridEmailAdapter(fastify.sendgrid, fastify.log)
    }),
  )

  // Register Services
  registry.registerService(
    createServiceRegistration('productService', ProductService, [
      'productRepository',
      'paymentGateway',
      'logger',
    ]),
  )
  registry.registerService(
    createServiceRegistration('userService', UserService, [
      'userRepository',
      'paymentGateway',
      'logger',
    ]),
  )
  registry.registerService(
    createServiceRegistration('cartService', CartService, [
      'cartRepository',
      'cartItemRepository',
      'productRepository',
      'logger',
    ]),
  )
  registry.registerService(
    createServiceRegistration('cartItemService', CartItemService, [
      'cartItemRepository',
      'logger',
    ]),
  )
  registry.registerService(
    createServiceRegistration('categoryService', CategoryService, [
      'categoryRepository',
      'logger',
    ]),
  )
  registry.registerService(
    createServiceRegistration('orderService', OrderService, [
      'orderRepository',
      'cartRepository',
      'productRepository',
      'logger',
    ]),
  )
  registry.registerService(
    createServiceRegistration('checkoutService', CheckoutService, [
      'userRepository',
      'cartRepository',
      'orderRepository',
      'paymentGateway',
      'emailProvider',
      'logger',
    ]),
  )
  registry.registerService(
    createServiceRegistration('authService', AuthService, [
      'userRepository',
      'cartRepository',
      'paymentGateway',
      'emailProvider',
      'logger',
    ]),
  )
  registry.registerService(
    createServiceRegistration('adminService', MetricService, [
      'productRepository',
      'logger',
    ]),
  )

  // Register Controllers
  registry.registerController(
    createControllerRegistration('productController', ProductController, [
      'productService',
    ]),
  )
  registry.registerController(
    createControllerRegistration('adminOrderController', AdminOrderController, [
      'orderService',
    ]),
  )
  registry.registerController(
    createControllerRegistration('authController', AuthController, [
      'authService',
    ]),
  )
  registry.registerController(
    createControllerRegistration('cartController', CartController, [
      'cartService',
    ]),
  )
  registry.registerController(
    createControllerRegistration('cartItemController', CartItemController, [
      'cartItemService',
    ]),
  )
  registry.registerController(
    createControllerRegistration('categoryController', CategoryController, [
      'categoryService',
    ]),
  )
  registry.registerController(
    createControllerRegistration('checkoutController', CheckoutController, [
      'checkoutService',
    ]),
  )
  registry.registerController(
    createControllerRegistration('metricController', MetricController, [
      'adminService',
    ]),
  )
  registry.registerController(
    createControllerRegistration('orderController', OrderController, [
      'orderService',
    ]),
  )

  return registry
}

/**
 * Build container from registry
 * This is an alternative to manual registration that uses the registry
 */
export function buildContainerFromRegistry(
  registry: ContainerRegistry,
  dataSource: DataSource,
  fastify: FastifyInstance,
) {
  // Validate dependencies
  const validation = registry.validateDependencies()
  if (!validation.valid) {
    throw new Error(
      `Container validation failed:\n${validation.errors.join('\n')}`,
    )
  }

  // Build repositories
  const repositories: Record<string, unknown> = {}
  for (const [name, repo] of registry.getRepositories().entries()) {
    const entity = dataSource.getRepository(repo.entityName)
    repositories[name] = new repo.constructor(entity)
  }

  // Build adapters
  const adapters: Record<string, unknown> = {}
  for (const [name, adapter] of registry.getAdapters().entries()) {
    adapters[name] = adapter.factory(fastify)
  }

  // Build services (with dependency resolution)
  const services: Record<string, unknown> = {}
  const serviceOrder = resolveServiceOrder(registry.getServices())

  for (const serviceName of serviceOrder) {
    const service = registry.getServices().get(serviceName)
    if (!service) continue

    const deps: Record<string, unknown> = {}
    for (const depName of service.dependencies) {
      if (depName === 'logger') {
        deps[depName] = fastify.log
      } else if (depName === 'fastify') {
        deps[depName] = fastify
      } else if (repositories[depName]) {
        deps[depName] = repositories[depName]
      } else if (adapters[depName]) {
        deps[depName] = adapters[depName]
      } else if (services[depName]) {
        deps[depName] = services[depName]
      }
    }

    const depArray = service.dependencies.map((dep) => deps[dep])
    services[serviceName] = new service.constructor(...depArray)
  }

  // Build controllers
  const controllers: Record<string, unknown> = {}
  for (const [name, controller] of registry.getControllers().entries()) {
    const deps = controller.dependencies.map((dep: string) => {
      // Map service dependency names to service keys
      // e.g., 'productService' -> services['productService']
      return services[dep]
    })
    controllers[name] = new controller.constructor(...deps)
  }

  return {
    repositories: repositories as TRepositories,
    services: services as TServices,
    controllers: controllers as TControllers,
  }
}

/**
 * Resolve service build order based on dependencies
 * Uses topological sort to ensure dependencies are built before dependents
 */
function resolveServiceOrder(
  services: Map<
    string,
    import('#utils/container-registry').ServiceRegistration
  >,
): string[] {
  const visited = new Set<string>()
  const visiting = new Set<string>()
  const result: string[] = []

  function visit(name: string): void {
    if (visiting.has(name)) {
      throw new Error(`Circular dependency detected involving: ${name}`)
    }
    if (visited.has(name)) {
      return
    }

    visiting.add(name)
    const service = services.get(name)
    if (service) {
      for (const dep of service.dependencies) {
        if (services.has(dep)) {
          visit(dep)
        }
      }
    }
    visiting.delete(name)
    visited.add(name)
    result.push(name)
  }

  for (const name of services.keys()) {
    if (!visited.has(name)) {
      visit(name)
    }
  }

  return result
}
