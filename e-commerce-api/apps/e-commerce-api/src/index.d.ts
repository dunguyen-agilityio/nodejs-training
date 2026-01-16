import { USER_ROLES } from "#types/user";
import { Container } from "./utils/container";

// using declaration merging, add your plugin props to the appropriate fastify interfaces
// if prop type is defined here, the value will be typechecked when you call decorate{,Request,Reply}
declare module "fastify" {
  interface FastifyRequest {
    container: Container1;
    userId: string;
  }
  interface FastifyReply {}

  interface FastifyInstance {
    container: Container;
  }
}

declare module "@clerk/fastify" {
  interface UserJSON {
    role: USER_ROLES;
  }
}
