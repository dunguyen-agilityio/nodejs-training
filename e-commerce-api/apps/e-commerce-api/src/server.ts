import 'dotenv/config'
import 'reflect-metadata'

import { clerkClient, clerkPlugin, getAuth } from '@clerk/fastify'
import cors from '@fastify/cors'
import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts'
import Fastify from 'fastify'

import { AppDataSource } from '#data-source'

import { env } from './configs/env'
import { errorHandler } from './middlewares/error-handler'
import { requestLogger, responseLogger } from './middlewares/request-logger'
import sendgridPlugin from './plugins/sendgrid.plugin'
import stripePlugin from './plugins/stripe.plugin'
import swaggerPlugin from './plugins/swagger.plugin'
import { authRoutes, cartRoutes, categoryRoutes } from './routes'
import { adminOrderRoutes } from './routes/admin-order'
import { checkoutRoutes } from './routes/checkout'
import { metricRoutes } from './routes/metric'
import { orderRoutes } from './routes/order'
import { productRoutes } from './routes/product'
import { buildContainer } from './utils/container'

const envToLogger = {
  development: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
  production: true,
  test: false,
}

const fastify = Fastify({
  logger: envToLogger[env.nodeEnv] ?? true,
}).withTypeProvider<JsonSchemaToTsProvider>()

fastify.register(cors, {
  origin: env.client.baseUrl,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})

await Promise.all([
  fastify.register(clerkPlugin),
  fastify.register(stripePlugin),
  fastify.register(sendgridPlugin),
  fastify.register(swaggerPlugin),
])

fastify.decorateRequest('clerk', {
  getter: () => ({ clerkClient, getAuth }),
})

fastify.decorate('clerk', {
  getter: () => ({ clerkClient, getAuth }),
})

AppDataSource.initialize()
  .then((dataSource) => {
    buildContainer(fastify, dataSource)

    fastify.register(
      (instance, _opts, done) => {
        // Register request logging middleware
        instance.addHook(
          'onRequest',
          requestLogger({
            logRequestBody: env.nodeEnv === 'development',
            logResponseBody: false,
            logQuery: true,
            logHeaders: false,
            excludePaths: ['/health', '/metrics'],
          }),
        )

        // Register response logging middleware
        instance.addHook(
          'onSend',
          responseLogger({
            logResponseBody: false,
          }),
        )

        instance.register(authRoutes, { prefix: '/auth' })
        instance.register(productRoutes, { prefix: '/products' })
        instance.register(categoryRoutes, { prefix: '/categories' })
        instance.register(cartRoutes, { prefix: '/cart' })
        instance.register(orderRoutes, { prefix: '/orders' })
        instance.register(adminOrderRoutes, {
          prefix: '/admin/orders',
        })
        instance.register(checkoutRoutes, { prefix: '/checkout' })
        instance.register(metricRoutes, { prefix: '/metrics' })

        done()
      },
      { prefix: '/api/v1' },
    )

    // Run the server!
    fastify.listen({ port: 8080 }, function (err, address) {
      if (err) {
        fastify.log.error(err)
        process.exit(1)
      }
      fastify.log.info(`Server is now listening on ${address}`)
    })

    // Register standardized error handler
    fastify.setErrorHandler(errorHandler)

    // Gracefull shutdown
    process.on('SIGTERM', () => {
      fastify.log.info('SIGTERM signal received: closing HTTP server')

      fastify.close(async () => {
        fastify.log.info('HTTP server closed')
        // close database
        await dataSource.destroy()
        fastify.log.info('Database connection closed')
        process.exit(0)
        // close third paty
      })
    })
  })
  .catch((error) => {
    console.log(error)
    fastify.log.error('Database connection failed', error)
    fastify.close(() => {
      process.exit(0)
    })
  })
