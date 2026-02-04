import 'dotenv/config'
import 'reflect-metadata'

import { clerkClient, clerkPlugin, getAuth } from '@clerk/fastify'
import cors from '@fastify/cors'
import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts'
import Fastify from 'fastify'

import { AppDataSource } from '#data-source'

import { ApiError, HttpStatus } from '#types'

import { env } from './configs/env'
import sendgridPlugin from './plugins/sendgrid.plugin'
import stripePlugin from './plugins/stripe.plugin'
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
])

AppDataSource.initialize()
  .then((dataSource) => {
    buildContainer(fastify, dataSource)

    fastify.decorateRequest('clerk', {
      getter: () => ({ clerkClient, getAuth }),
    })

    fastify.register(
      (instance, opts, done) => {
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

    fastify.setErrorHandler(function (error: ApiError, _, reply) {
      // Log error
      this.log.error(error)

      const statusCode = error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR

      // Send error response
      reply.status(statusCode).send(error)
    })

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
