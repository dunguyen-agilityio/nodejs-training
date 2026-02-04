import { initializeRegistry } from '../configs/container-registry'

/**
 * Helper functions for working with the container registry
 */

/**
 * Get dependency graph as formatted string
 */
export function getDependencyGraphString(): string {
  const registry = initializeRegistry()
  const graph = registry.getDependencyGraph()

  const lines: string[] = ['# Dependency Graph\n']

  lines.push('## Services\n')
  for (const [name, deps] of Object.entries(graph.services)) {
    lines.push(`- **${name}**`)
    const dependencies = deps as string[]
    if (dependencies.length > 0) {
      lines.push(`  - Depends on: ${dependencies.join(', ')}`)
    }
  }

  lines.push('\n## Controllers\n')
  for (const [name, deps] of Object.entries(graph.controllers)) {
    lines.push(`- **${name}**`)
    const dependencies = deps as string[]
    if (dependencies.length > 0) {
      lines.push(`  - Depends on: ${dependencies.join(', ')}`)
    }
  }

  return lines.join('\n')
}

/**
 * Validate container dependencies
 * Throws error if validation fails
 */
export function validateContainerDependencies(): void {
  const registry = initializeRegistry()
  const validation = registry.validateDependencies()

  if (!validation.valid) {
    throw new Error(
      `Container dependency validation failed:\n${validation.errors.join('\n')}`,
    )
  }
}

/**
 * Generate container documentation
 */
export function generateContainerDocumentation(): string {
  const registry = initializeRegistry()
  return registry.generateDocumentation()
}

/**
 * Check if a service exists in registry
 */
export function hasService(name: string): boolean {
  const registry = initializeRegistry()
  return registry.getServices().has(name)
}

/**
 * Check if a repository exists in registry
 */
export function hasRepository(name: string): boolean {
  const registry = initializeRegistry()
  return registry.getRepositories().has(name)
}

/**
 * Get all registered service names
 */
export function getRegisteredServices(): string[] {
  const registry = initializeRegistry()
  return Array.from(registry.getServices().keys())
}

/**
 * Get all registered repository names
 */
export function getRegisteredRepositories(): string[] {
  const registry = initializeRegistry()
  return Array.from(registry.getRepositories().keys())
}
