import "reflect-metadata";
import "dotenv/config";

import Fastify, { FastifyPluginCallback } from "fastify";
import { clerkPlugin } from "@clerk/fastify";
import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import fastifyPlugin from "fastify-plugin";

import { AuthService } from "@repo/typeorm-service/services";
import { UserRepository } from "@repo/typeorm-service/repositories";
import { User } from "@repo/typeorm-service/entity";

import { createAuthroutes } from "./routes";

import { AuthController } from "./controllers/auth";

import { AppDataSource } from "./configs/data-source";

const fastify = Fastify({
  logger: true,
}).withTypeProvider<JsonSchemaToTsProvider>();

AppDataSource.initialize().then((dataSource) => {
  const userRepository = new UserRepository(dataSource.getRepository(User));
  const authService = new AuthService(userRepository);
  const authController = new AuthController(authService);

  const decorates = () => {
    fastify.decorateRequest("AuthService", {
      getter: () => authService,
    });
  };

  fastify.register(fastifyPlugin(decorates, { name: "user" }));

  const protectedRoutes: FastifyPluginCallback = (instance, options, done) => {
    instance.register(createAuthroutes(authController), { prefix: "/auth" });
    done();
  };

  const publicRoutes: FastifyPluginCallback = (instance, options, done) => {
    instance.get("/", async (req, reply) => {
      reply.send({ message: "This is a public route." });
    });

    instance.get("/:id", async (req, reply) => {
      reply.send({ message: "This is a details route." });
    });

    done();
  };

  fastify.register(clerkPlugin);

  fastify.register(protectedRoutes);
  fastify.register(publicRoutes, { prefix: "/products" });

  // Run the server!
  fastify.listen({ port: 8080 }, function (err, address) {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    // Server is now listening on ${address}
  });
});
