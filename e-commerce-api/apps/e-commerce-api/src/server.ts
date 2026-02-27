import 'dotenv/config'
import 'reflect-metadata'

import { clerkClient, clerkPlugin, getAuth } from '@clerk/fastify'
import cors from '@fastify/cors'
import fastifyHelmet from '@fastify/helmet'
import fastifyRateLimit from '@fastify/rate-limit'
import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts'
import Fastify from 'fastify'

import { AppDataSource } from '#data-source'

import env from '#env'

import { buildContainer } from '#utils/container'

import cronPlugin from '#plugins/cron.plugin'
import sendgridPlugin from '#plugins/sendgrid.plugin'
import stripePlugin from '#plugins/stripe.plugin'
import swaggerPlugin from '#plugins/swagger.plugin'

import {
  authenticate,
  authorizeAdmin,
  errorHandler,
  requestLogger,
  responseLogger,
} from '#middlewares'

import {
  adminOrderRoutes,
  authRoutes,
  cartRoutes,
  categoryRoutes,
  checkoutRoutes,
  metricRoutes,
  orderRoutes,
  productAdminRoutes,
  productRoutes,
  userRoutes,
} from '#routes'

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
  fastify.register(fastifyHelmet),
  fastify.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
  }),
])

fastify.decorateRequest('clerk', { getter: () => ({ clerkClient, getAuth }) })
fastify.decorate('clerk', { getter: () => ({ clerkClient, getAuth }) })

const start = async () => {
  try {
    const dataSource = await AppDataSource.initialize()

    buildContainer(fastify, dataSource)

    fastify.decorate('authenticate', { getter: () => authenticate })
    fastify.decorate('authorizeAdmin', { getter: () => authorizeAdmin })

    await fastify.register(cronPlugin)

    await fastify.register(
      (instance, _opts, done) => {
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

        instance.addHook(
          'onSend',
          responseLogger({
            logResponseBody: false,
          }),
        )

        instance.register(authRoutes, { prefix: '/auth' })
        instance.register(userRoutes, { prefix: '/users' })
        instance.register(productRoutes, { prefix: '/products' })
        instance.register(productAdminRoutes, { prefix: '/admin/products' })
        instance.register(categoryRoutes, { prefix: '/categories' })
        instance.register(cartRoutes, { prefix: '/cart' })
        instance.register(orderRoutes, { prefix: '/orders' })
        instance.register(adminOrderRoutes, { prefix: '/admin/orders' })
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
  } catch (error) {
    fastify.log.error(error, 'Database connection failed')
    fastify.close(() => {
      process.exit(0)
    })
  }
}

start()
