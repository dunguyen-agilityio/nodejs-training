import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      enabled: false, // Enable manually with --coverage flag
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.spec.ts',
        '**/__tests__/**',
        '**/types.ts',
        '**/type.ts',
        'src/database/entities/**',
        'src/database/migrations/**',
        'src/database/seed-data/**',
        'src/configs/**',
        'src/utils/container.ts',
        'src/server.ts',
        'src/index.ts',
        'src/constants/**',
        'src/routes/**', // Integration layer - tested via E2E
        'src/schemas/**', // Type definitions
        'src/plugins/**', // Configuration
        'src/types/**', // Type definitions
        'src/test-utils.ts', // Test utilities
        'src/database/**', // Database config and seeds
        'src/dtos/**', // Data Transfer Objects
        'src/adapters/**', // External adapters
        'src/middlewares/**', // Middlewares (integration)
      ],
      include: ['src/**/*.ts'],
      // Thresholds commented out due to TypeORM ESM/CJS compatibility issues
      // Will be re-enabled after resolving module resolution
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    setupFiles: ['./src/setup-tests.ts'],
    exclude: ['node_modules/**', 'dist/**', 'build/**'],
  },
})
