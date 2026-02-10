import { FastifyInstance } from 'fastify'

/**
 * Service registration configuration
 */
export interface ServiceRegistration<T = unknown> {
  name: string
  constructor: new (...args: any[]) => T
  dependencies: string[]
  factory?: (deps: Record<string, unknown>, fastify: FastifyInstance) => T
}

/**
 * Repository registration configuration
 */
export interface RepositoryRegistration<T = unknown> {
  name: string
  constructor: new (...args: any[]) => T
  entityName: string
}

/**
 * Adapter registration configuration
 */
export interface AdapterRegistration<T = unknown> {
  name: string
  factory: (fastify: FastifyInstance) => T
}

/**
 * Controller registration configuration
 */
export interface ControllerRegistration<T = unknown> {
  name: string
  constructor: new (...args: any[]) => T
  dependencies: string[]
}

/**
 * Container registry for managing dependency registrations
 * Provides a declarative way to register services, repositories, adapters, and controllers
 */
export class ContainerRegistry {
  private services: Map<string, ServiceRegistration> = new Map()
  private repositories: Map<string, RepositoryRegistration> = new Map()
  private adapters: Map<string, AdapterRegistration> = new Map()
  private controllers: Map<string, ControllerRegistration> = new Map()

  /**
   * Register a service with its dependencies
   */
  registerService<T>(config: ServiceRegistration<T>): void {
    this.services.set(config.name, config as ServiceRegistration)
  }

  /**
   * Register a repository with its entity
   */
  registerRepository<T>(config: RepositoryRegistration<T>): void {
    this.repositories.set(config.name, config as RepositoryRegistration)
  }

  /**
   * Register an adapter with its factory function
   */
  registerAdapter<T>(config: AdapterRegistration<T>): void {
    this.adapters.set(config.name, config as AdapterRegistration)
  }

  /**
   * Register a controller with its dependencies
   */
  registerController<T>(config: ControllerRegistration<T>): void {
    this.controllers.set(config.name, config as ControllerRegistration)
  }

  /**
   * Get all registered services
   */
  getServices(): Map<string, ServiceRegistration> {
    return this.services
  }

  /**
   * Get all registered repositories
   */
  getRepositories(): Map<string, RepositoryRegistration> {
    return this.repositories
  }

  /**
   * Get all registered adapters
   */
  getAdapters(): Map<string, AdapterRegistration> {
    return this.adapters
  }

  /**
   * Get all registered controllers
   */
  getControllers(): Map<string, ControllerRegistration> {
    return this.controllers
  }

  /**
   * Validate that all dependencies are registered
   */
  validateDependencies(): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // Check service dependencies
    for (const [name, service] of this.services.entries()) {
      for (const dep of service.dependencies) {
        if (
          !this.services.has(dep) &&
          !this.repositories.has(dep) &&
          !this.adapters.has(dep) &&
          dep !== 'logger' &&
          dep !== 'fastify'
        ) {
          errors.push(
            `Service '${name}' depends on '${dep}' which is not registered`,
          )
        }
      }
    }

    // Check controller dependencies
    for (const [name, controller] of this.controllers.entries()) {
      for (const dep of controller.dependencies) {
        if (!this.services.has(dep)) {
          errors.push(
            `Controller '${name}' depends on '${dep}' which is not registered`,
          )
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Get dependency graph (for debugging)
   */
  getDependencyGraph(): {
    services: Record<string, string[]>
    controllers: Record<string, string[]>
  } {
    const services: Record<string, string[]> = {}
    const controllers: Record<string, string[]> = {}

    for (const [name, service] of this.services.entries()) {
      services[name] = service.dependencies
    }

    for (const [name, controller] of this.controllers.entries()) {
      controllers[name] = controller.dependencies
    }

    return { services, controllers }
  }

  /**
   * Generate documentation of all registrations
   */
  generateDocumentation(): string {
    const lines: string[] = ['# Container Registry Documentation\n']

    lines.push('## Repositories\n')
    for (const [name, repo] of this.repositories.entries()) {
      lines.push(
        `- **${name}**: ${repo.constructor.name} (Entity: ${repo.entityName})`,
      )
    }

    lines.push('\n## Adapters\n')
    for (const [name] of this.adapters.entries()) {
      lines.push(`- **${name}**: Adapter`)
    }

    lines.push('\n## Services\n')
    for (const [name, service] of this.services.entries()) {
      lines.push(`- **${name}**: ${service.constructor.name}`)
      if (service.dependencies.length > 0) {
        lines.push(`  - Dependencies: ${service.dependencies.join(', ')}`)
      }
    }

    lines.push('\n## Controllers\n')
    for (const [name, controller] of this.controllers.entries()) {
      lines.push(`- **${name}**: ${controller.constructor.name}`)
      if (controller.dependencies.length > 0) {
        lines.push(`  - Dependencies: ${controller.dependencies.join(', ')}`)
      }
    }

    return lines.join('\n')
  }
}

/**
 * Helper function to create service registration
 */
export function createServiceRegistration<T>(
  name: string,
  constructor: new (...args: any[]) => T,
  dependencies: string[],
  factory?: (deps: Record<string, unknown>, fastify: FastifyInstance) => T,
): ServiceRegistration<T> {
  return {
    name,
    constructor,
    dependencies,
    factory,
  }
}

/**
 * Helper function to create repository registration
 */
export function createRepositoryRegistration<T>(
  name: string,
  constructor: new (...args: any[]) => T,
  entityName: string,
): RepositoryRegistration<T> {
  return {
    name,
    constructor,
    entityName,
  }
}

/**
 * Helper function to create adapter registration
 */
export function createAdapterRegistration<T>(
  name: string,
  factory: (fastify: FastifyInstance) => T,
): AdapterRegistration<T> {
  return {
    name,
    factory,
  }
}

/**
 * Helper function to create controller registration
 */
export function createControllerRegistration<T>(
  name: string,
  constructor: new (...args: any[]) => T,
  dependencies: string[],
): ControllerRegistration<T> {
  return {
    name,
    constructor,
    dependencies,
  }
}
