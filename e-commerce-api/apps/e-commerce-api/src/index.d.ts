import type { USER_ROLES } from "#types/user";
import type { Container, TContainer } from "./utils/container";
import type { Stripe } from "stripe";
import type { MailService } from "@sendgrid/mail";

// using declaration merging, add your plugin props to the appropriate fastify interfaces
// if prop type is defined here, the value will be typechecked when you call decorate{,Request,Reply}
declare module "fastify" {
  interface FastifyRequest {
    container: Container;
    auth: { userId: string; orgRole: string; stripeId: string };
  }
  interface FastifyReply {}

  interface FastifyInstance {
    container1: TContainer;
    container: Container;
    stripe: Stripe;
    sendgrid: MailService;
  }
}

declare module "@clerk/fastify" {
  interface UserJSON {
    role: USER_ROLES;
  }
}
