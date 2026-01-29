import { clerkClient } from "@clerk/fastify";
import { MigrationInterface, QueryRunner } from "typeorm";
import { USER_ROLES } from "#types/user";

import { faker } from "@faker-js/faker";
import { StripePaymentGatewayProvider } from "#providers";

export class SeedData1768297791711 implements MigrationInterface {
  stripe = new StripePaymentGatewayProvider();

  public async up(queryRunner: QueryRunner): Promise<void> {
    const { data } = await clerkClient.users.getUserList();

    if (data.length > 0) {
      await Promise.all(
        data.map(async (user) => {
          const {
            firstName,
            lastName,
            emailAddresses,
            imageUrl,
            id: userId,
          } = user;
          const email = emailAddresses[0]?.emailAddress;
          const customer = await this.stripe.findOrCreateCustomer({
            email,
            name: [firstName, lastName].filter(Boolean).join(" "),
          });
          await queryRunner.query(
            `INSERT INTO users (id, first_name, last_name, email, avatar, role, stripe_id ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              userId,
              firstName,
              lastName,
              email,
              imageUrl,
              USER_ROLES.USER,
              customer.id,
            ],
          );
        }),
      );
    }

    const CATEGORIES_COUNT = 20;
    const MAX_PRODUCTS = 2;

    faker.seed(MAX_PRODUCTS * 1000);

    const categories = faker.helpers.uniqueArray(
      faker.commerce.department,
      CATEGORIES_COUNT,
    );

    await Promise.all(
      categories.map((category) =>
        queryRunner.query(
          `INSERT INTO categories (name, description) 
          VALUES ($1, $2)`,
          [
            category,
            `${faker.commerce.productMaterial()} ${faker.commerce.productAdjective()}`,
          ],
        ),
      ),
    );

    const randomCategory = () =>
      categories[
        faker.number.int({ max: categories.length - 1, min: 0 })
      ] as string;

    await Promise.all(
      Array(MAX_PRODUCTS)
        .fill(0)
        .map(async () => {
          const name = faker.commerce.productName().replaceAll("'", "`");
          const description = faker.commerce
            .productDescription()
            .replaceAll("'", "`");
          const price = faker.commerce.price({ max: 1000, min: 10 });
          const stock = faker.number.int({ min: 500, max: 1000 });
          const imageUrl = faker.image.urlPicsumPhotos({
            width: 640,
            height: 480,
            grayscale: false,
            blur: 0,
          });

          const category = randomCategory();

          const { id: productId } = await this.stripe.createProduct({
            name,
            description,
            default_price_data: {
              currency: "usd",
              unit_amount: Math.round(parseFloat(price) * 100),
            },
            active: true,
            images: [imageUrl],
          });

          await queryRunner.query(
            `INSERT INTO products (id, name, description, price, stock, category, images) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)
            `,
            [productId, name, description, price, stock, category, imageUrl],
          );
        }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM stock_reservation`);
    await queryRunner.query(`DELETE FROM invoice_items`);
    await queryRunner.query(`DELETE FROM invoices`);
    await queryRunner.query(`DELETE FROM order_items`);
    await queryRunner.query(`DELETE FROM cart_items`);
    await queryRunner.query(`DELETE FROM orders`);
    await queryRunner.query(`DELETE FROM carts`);
    await queryRunner.query(`DELETE FROM products`);
    await queryRunner.query(`DELETE FROM categories`);
    await queryRunner.query(`DELETE FROM users`);
  }
}
