import "reflect-metadata";
import "dotenv/config";

import Fastify from "fastify";
import { clerkPlugin } from "@clerk/fastify";
import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import fastifyPlugin from "fastify-plugin";
import cors from "@fastify/cors";

import { authRoutes, cartRoutes, categoryRoutes, userRoutes } from "./routes";

import { Container } from "./utils/container";
import { productRoutes } from "./routes/product";
import { ApiError } from "#types/error";
import { HttpStatus } from "#types/http-status";
import { checkoutRoutes } from "./routes/checkout";
import { AppDataSource } from "#data-source";

import { orderRoutes } from "./routes/order";
import { metricRoutes } from "./routes/metric";

const fastify = Fastify({
  logger: true,
}).withTypeProvider<JsonSchemaToTsProvider>();

fastify.register(cors, {
  origin: process.env.CLIENT_BASE_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

fastify.register(clerkPlugin);

AppDataSource.initialize()
  .then(async (dataSource) => {
    const container = Container.instance
      .setDataSource(dataSource)
      .register("SendGridMailProvider")
      .register("StripePaymentGatewayProvider")
      .register("Auth")
      .register("User")
      .register("Product")
      .register("Cart")
      .register("CartItem")
      .register("Checkout")
      .register("Category")
      .register("Metric")
      .register("Order");

    // console.log(await container.getItem("MetricController"));

    const decorates = () => {
      fastify.decorate("container", {
        getter: () => container,
      });
      fastify.decorateRequest("container", {
        getter: () => container,
      });
    };

    fastify.register(fastifyPlugin(decorates, { name: "container" }));

    fastify.register(
      (instance, opts, done) => {
        instance.register(authRoutes, { prefix: "/auth" });
        instance.register(userRoutes, { prefix: "/users" });
        instance.register(productRoutes, { prefix: "/products" });
        instance.register(categoryRoutes, { prefix: "/categories" });
        instance.register(cartRoutes, { prefix: "/cart" });
        instance.register(orderRoutes, { prefix: "/orders" });
        instance.register(checkoutRoutes);
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
