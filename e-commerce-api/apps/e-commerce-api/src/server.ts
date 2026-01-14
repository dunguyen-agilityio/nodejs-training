import "reflect-metadata";
import "dotenv/config";

import Fastify, { FastifyPluginCallback } from "fastify";
import { clerkClient, clerkPlugin, getAuth } from "@clerk/fastify";
import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import fastifyPlugin from "fastify-plugin";

import { authRoutes, cartRoutes, categoryRoutes, userRoutes } from "./routes";

import { AppDataSource } from "./configs/data-source";

import { Container } from "./utils/container";
import { productRoutes } from "./routes/product";

const fastify = Fastify({
  logger: true,
}).withTypeProvider<JsonSchemaToTsProvider>();

fastify.register(clerkPlugin);

AppDataSource.initialize().then((dataSource) => {
  const container = new Container(dataSource);
  container.register("Auth", { entityName: "User" });
  container.register("User", { entityName: "User" });
  container.register("Product");
  container.register("Category");
  container.register("Cart");
  container.register("CartItem");

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
    // Server is now listening on ${address}
  });
});

// Gracefull shutdown
// close database
// close third paty
