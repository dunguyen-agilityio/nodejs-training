import "reflect-metadata";
import "dotenv/config";

import Fastify from "fastify";
import { clerkPlugin } from "@clerk/fastify";
import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import fastifyPlugin from "fastify-plugin";

import { authRoutes, cartRoutes, categoryRoutes, userRoutes } from "./routes";

import { AppDataSource } from "./configs/data-source";

import { Container } from "./utils/container";
import { productRoutes } from "./routes/product";
import { ApiError } from "#types/error";
import { HttpStatus } from "#types/http-status";

const fastify = Fastify({
  logger: true,
}).withTypeProvider<JsonSchemaToTsProvider>();

fastify.register(clerkPlugin);

AppDataSource.initialize().then((dataSource) => {
  const container = Container.instance
    .setDataSource(dataSource)
    .register("User")
    .register("Product")
    .register("Cart")
    .register("CartItem")
    .register("Category")
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

  fastify.register(authRoutes, { prefix: "/auth" });
  fastify.register(userRoutes, { prefix: "/users" });
  fastify.register(productRoutes, { prefix: "/products" });
  fastify.register(categoryRoutes, { prefix: "/categories" });
  fastify.register(cartRoutes, { prefix: "/cart" });

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
