import "reflect-metadata";
import "dotenv/config";

import Fastify from "fastify";
import { clerkPlugin } from "@clerk/fastify";
import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import fastifyPlugin from "fastify-plugin";
import cors from "@fastify/cors";

import { authRoutes, cartRoutes, categoryRoutes, userRoutes } from "./routes";

import { Container, Mail, Payment } from "./utils/container";
import { productRoutes } from "./routes/product";
import { ApiError } from "#types/error";
import { HttpStatus } from "#types/http-status";
import { checkoutRoutes } from "./routes/checkout";
import { AppDataSource } from "#data-source";

const fastify = Fastify({
  logger: true,
}).withTypeProvider<JsonSchemaToTsProvider>();

fastify.register(cors, {
  origin: process.env.CLIENT_ORIGINS?.split(","),
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

fastify.register(clerkPlugin);

AppDataSource.initialize().then(async (dataSource) => {
  const container = Container.instance
    .setDataSource(dataSource)
    .register("User")
    .register("Product")
    .register("Cart")
    .register("CartItem")
    .register("Checkout")
    .register("Category")
    .register(Mail.SendGrid)
    .register(Payment.Stripe)
    .register("User", "Auth")
    .build();

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
      instance.register(checkoutRoutes);

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
});

// Gracefull shutdown
// close database
// close third paty
