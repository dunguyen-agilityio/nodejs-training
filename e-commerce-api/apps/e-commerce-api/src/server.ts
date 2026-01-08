import Fastify from "fastify";
import {
  AppDataSource,
  User,
  Category,
  Product,
  Cart,
  CartItem,
  Order,
  OrderItem,
} from "@repo/typeorm-service";

AppDataSource.initialize()
  .then(async () => {
    console.log("Inserting a new user into the database...");
    const user = new User({
      age: 18,
      username: "name",
      avatar: "http://...",
      email: "user@ecommerce.com",
      firstName: "User",
      lastName: "Nguyen",
      password: "123456",
      phone: "09434348544",
    });
    await AppDataSource.manager.save(user);

    const category = new Category({
      name: "Phone",
      description: "This is Iphone",
    });

    await AppDataSource.manager.save(category);

    const product = new Product({
      images: ["http://..."],
      name: "IPhone 17",
      price: 24000000,
      categoryId: category.id,
      description: "This is IPhone 17",
      stock: 200,
    });

    await AppDataSource.manager.save(product);

    const cart = new Cart({ userId: user.id, status: "active" });

    await AppDataSource.manager.save(cart);

    const cartItem = new CartItem({
      cartId: cart.id,
      productId: product.id,
      quantity: 1,
    });

    console.log("cartItem", cartItem);

    await AppDataSource.manager.save(cartItem);

    const order = new Order({
      status: "pending",
      totalAmount: 100,
      userId: user.id,
    });

    await AppDataSource.manager.save(order);

    const orderItem = new OrderItem({
      productId: product.id,
      orderId: order.id,
      priceAtPurchase: 50,
      quantity: 2,
    });
    await AppDataSource.manager.save(orderItem);

    console.log("Saved a new user with id: " + user.id);

    console.log("Loading users from the database...");
    const users = await AppDataSource.manager.find(User);
    console.log("Loaded users: ", users);

    console.log(
      "Here you can setup and run express / fastify / any other framework."
    );
  })
  .catch((error) => console.log(error));

const fastify = Fastify({
  logger: true,
});

// Declare a route
fastify.get("/", function (request, reply) {
  reply.send({ hello: "world" });
});

// Run the server!
fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  // Server is now listening on ${address}
});
