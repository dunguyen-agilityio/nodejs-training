import "dotenv/config";

import Fastify, { FastifyPluginCallback } from "fastify";
import { clerkClient, clerkPlugin, getAuth } from "@clerk/fastify";
import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";

import { UserCreatedMinimal } from "./types/user-created";
import { User } from "@repo/typeorm-service";
import { UserRepository } from "./repositories/user";
import { AppDataSource } from "./configs/data-source";
import { AuthService } from "./services/auth";
import { AuthController } from "./controllers/auth";

// import {
//   User,
//   Category,
//   Product,
//   Cart,
//   CartItem,
//   Order,
//   OrderItem,
// } from "@repo/typeorm-service";
// import { AppDataSource } from "./configs/data-source";

// AppDataSource.initialize()
//   .then(async () => {
//     console.log("Inserting a new user into the database...");
//     const user = new User({
//       age: 18,
//       username: "name",
//       avatar: "http://...",
//       email: "user@ecommerce.com",
//       firstName: "User",
//       lastName: "Nguyen",
//       password: "123456",
//       phone: "09434348544",
//     });
//     await AppDataSource.manager.save(user);

//     const category = new Category({
//       name: "Phone",
//       description: "This is Iphone",
//     });

//     await AppDataSource.manager.save(category);

//     const product = new Product({
//       images: ["http://..."],
//       name: "IPhone 17",
//       price: 24000000,
//       categoryId: category.id,
//       description: "This is IPhone 17",
//       stock: 200,
//     });

//     await AppDataSource.manager.save(product);

//     const cart = new Cart({ userId: user.id, status: "active" });

//     await AppDataSource.manager.save(cart);

//     const cartItem = new CartItem({
//       cartId: cart.id,
//       productId: product.id,
//       quantity: 1,
//     });

//     console.log("cartItem", cartItem);

//     await AppDataSource.manager.save(cartItem);

//     const order = new Order({
//       status: "pending",
//       totalAmount: 100,
//       userId: user.id,
//     });

//     await AppDataSource.manager.save(order);

//     const orderItem = new OrderItem({
//       productId: product.id,
//       orderId: order.id,
//       priceAtPurchase: 50,
//       quantity: 2,
//     });
//     await AppDataSource.manager.save(orderItem);

//     console.log("Saved a new user with id: " + user.id);

//     console.log("Loading users from the database...");
//     const users = await AppDataSource.manager.find(User);
//     console.log("Loaded users: ", users);

//     console.log(
//       "Here you can setup and run express / fastify / any other framework."
//     );
//   })
//   .catch((error) => console.log(error));

const fastify = Fastify({
  logger: true,
}).withTypeProvider<JsonSchemaToTsProvider>();

const protectedRoutes: FastifyPluginCallback = (instance, options, done) => {
  instance.register(clerkPlugin);

  const userRepository = new UserRepository(AppDataSource.getRepository(User));
  const authService = new AuthService(userRepository);
  const authController = new AuthController(authService);
  instance.post("/auth/login", authController.login);

  // instance.post("/auth/login", async (req, reply) => {
  //   // Use `getAuth()` to access `isAuthenticated` and the user's ID
  //   const { isAuthenticated, userId } = getAuth(req);

  //   const userCreated = req.body as UserCreatedMinimal;
  //   const {
  //     email_addresses,
  //     first_name: firstName,
  //     id,
  //     image_url,
  //     last_name: lastName,
  //     username,
  //     created_at: createdAt,
  //     updated_at: updatedAt,
  //     phone_numbers,
  //   } = userCreated.data;

  //   const newUser = new User({
  //     avatar: image_url,
  //     lastName,
  //     id,
  //     username,
  //     firstName,
  //     email: email_addresses[0]?.email_address || "",
  //     createdAt: new Date(createdAt),
  //     updatedAt: new Date(updatedAt),
  //     phone: phone_numbers[0]?.phone_number || "",
  //   });

  //   // Protect the route from unauthenticated users
  //   if (!isAuthenticated) {
  //     return reply
  //       .code(403)
  //       .send({ message: "Access denied. Authentication required." });
  //   }

  //   // Use `clerkClient` to access Clerk's JS Backend SDK methods
  //   const user = await clerkClient.users.getUser(userId);

  //   // Only authenticated users will see the following message
  //   reply.send({ message: "This is a protected route.", user });
  // });

  done();
};

const publicRoutes: FastifyPluginCallback = (instance, options, done) => {
  instance.get("/", async (req, reply) => {
    reply.send({ message: "This is a public route." });
  });

  done();
};

fastify.register(protectedRoutes);
fastify.register(publicRoutes);

// Run the server!
fastify.listen({ port: 8080 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  // Server is now listening on ${address}
});
