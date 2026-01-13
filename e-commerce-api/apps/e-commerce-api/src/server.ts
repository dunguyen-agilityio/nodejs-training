import "reflect-metadata";
import "dotenv/config";

import Fastify, { FastifyPluginCallback } from "fastify";
import { clerkPlugin } from "@clerk/fastify";
import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import fastifyPlugin from "fastify-plugin";

import { authRoutes } from "./routes";

import { AppDataSource } from "./configs/data-source";

import { Container } from "./utils/container";
import { productRoutes } from "./routes/product";

const fastify = Fastify({
  logger: true,
}).withTypeProvider<JsonSchemaToTsProvider>();

AppDataSource.initialize().then((dataSource) => {
  const container = new Container(dataSource);
  container.register("Auth", { entityName: "User" });
  container.register("Product");

  const decorates = () => {
    fastify.decorate("container", {
      getter: () => container,
    });
  };

  fastify.register(fastifyPlugin(decorates, { name: "container" }));

  const protectedRoutes: FastifyPluginCallback = (instance, options, done) => {
    instance.register(authRoutes, { prefix: "/auth" });
    done();
  };

  fastify.register(clerkPlugin);

  fastify.register(protectedRoutes);

  const publicRoutes: FastifyPluginCallback = (instance, options, done) => {
    // instance.get("/", async (req, reply) => {
    //   reply.send({ message: "This is a public route." });
    // });

    // instance.get("/:id", async (req, reply) => {
    //   reply.send({ message: "This is a details route." });
    // });

    done();
  };

  fastify.register(productRoutes, { prefix: "/products" });

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
