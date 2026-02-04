import "reflect-metadata";
import "dotenv/config";

import Fastify from "fastify";
import { clerkPlugin } from "@clerk/fastify";
import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import cors from "@fastify/cors";

import { buildContainer } from "./utils/container";
import { ApiError } from "#types/error";
import { HttpStatus } from "#types/http-status";

import { AppDataSource } from "#data-source";

import { authRoutes, cartRoutes, categoryRoutes } from "./routes";
import { productRoutes } from "./routes/product";
import { checkoutRoutes } from "./routes/checkout";
import { orderRoutes } from "./routes/order";
import { metricRoutes } from "./routes/metric";
import { adminOrderRoutes } from "./routes/admin-order";
import stripePlugin from "./plugins/stripe.plugin";
import sendgridPlugin from "./plugins/sendgrid.plugin";

const fastify = Fastify({
  logger: true,
}).withTypeProvider<JsonSchemaToTsProvider>();

fastify.register(cors, {
  origin: process.env.CLIENT_BASE_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

await Promise.all([
  AppDataSource.initialize(),
  fastify.register(clerkPlugin),
  fastify.register(stripePlugin),
  fastify.register(sendgridPlugin),
])
  .then(([dataSource]) => {
    buildContainer(fastify, dataSource);

    fastify.register(
      (instance, opts, done) => {
        instance.register(authRoutes, { prefix: "/auth" });
        instance.register(productRoutes, { prefix: "/products" });
        instance.register(categoryRoutes, { prefix: "/categories" });
        instance.register(cartRoutes, { prefix: "/cart" });
        instance.register(orderRoutes, { prefix: "/orders" });
        instance.register(adminOrderRoutes, { prefix: "/admin/orders" });
        instance.register(checkoutRoutes, { prefix: "/checkout" });
        instance.register(metricRoutes, { prefix: "/metrics" });

        done();
      },
      { prefix: "/api/v1" },
    );

    // Run the server!
    fastify.listen({ port: 8080 }, function (err, address) {
      if (err) {
        fastify.log.error(err);
        process.exit(1);
      }
      console.info(`Server is now listening on ${address}`);
    });

    fastify.setErrorHandler(function (error: ApiError, _, reply) {
      // Log error
      this.log.error(error);

      const statusCode = error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;

      // Send error response
      reply.status(statusCode).send(error);
    });

    // Gracefull shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM signal received: closing HTTP server");

      fastify.close(async () => {
        console.log("HTTP server closed");
        // close database
        await dataSource.destroy();
        console.log("Database connection closed");
        process.exit(0);
        // close third paty
      });
    });
  })
  .catch((error) => {
    console.log("Database connection failed", error);
    fastify.close(() => {
      process.exit(0);
    });
  });
