import "dotenv/config";
import { clerkClient } from "@clerk/fastify";
import { MigrationInterface, QueryRunner } from "typeorm";
import { USER_ROLES } from "#types/user";

import { faker } from "@faker-js/faker";
import { Product } from "#entities";

export class SeedData1768297791711 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const { data } = await clerkClient.users.getUserList();

    const migrateUserquery = data.reduce(
      (
        prev,
        { firstName, lastName, emailAddresses, imageUrl, id: userId },
        idx,
      ) => {
        const email = emailAddresses[0]?.emailAddress;
        return `
        ${prev}${idx === 0 ? "" : ","}
        ('${userId}', '${firstName}', '${lastName}', '${email}', '${imageUrl}', '${USER_ROLES.USER}')`;
      },
      "INSERT INTO users (id, first_name, last_name, email, avatar, role ) VALUES",
    );

    await queryRunner.query(migrateUserquery);

    await queryRunner.query(`
            INSERT INTO categories (id, name, description) VALUES 
            (1, 'Electronics', 'Gadgets, devices, and more'),
            (2, 'Clothing', 'Apparel, shoes, and accessories'),
            (3, 'Home & Kitchen', 'Furniture, appliances, and decor'),
            (4, 'Books', 'All kinds of books and literature'),
            (5, 'Beauty', 'Skincare, makeup, and personal care')
        `);

    faker.seed(1000);

    const Categories = [
      "Electronics",
      "Clothing",
      "Home & Kitchen",
      "Books",
      "Beauty",
      "Computer",
      "Phone",
      "Car",
    ];

    const MAX = 1000;

    faker.seed(MAX * 10);

    const randomCategory = () =>
      Categories[faker.number.int({ max: Categories.length - 1, min: 0 })];
    let productQuery =
      "INSERT INTO products (name, description, price, stock, category, images) VALUES";
    Array(MAX)
      .fill(0)
      .forEach((_, idx) => {
        productQuery = `${productQuery}
         ('${faker.commerce.productName().replaceAll("'", "`")}', '${faker.commerce.productDescription().replaceAll("'", "`")}', ${faker.commerce.price()}, ${faker.number.int({ min: 500, max: 1000 })}, '${randomCategory()}', '${faker.image.urlPicsumPhotos({ width: 640, height: 480, grayscale: true, blur: 0 })}')${idx >= MAX - 1 ? "" : ","}`;
      });

    // await queryRunner.query(`
    //         INSERT INTO products (name, description, price, stock, category, images) VALUES
    //         ('Smartphone', 'Latest model with high-resolution camera', 799.99, 50, 'Electronics', '${faker.image.urlPicsumPhotos()}'),
    //         ('Laptop', 'Powerful laptop for gaming and work', 1200.00, 30, 'Electronics', '${faker.image.urlPicsumPhotos()}'),
    //         ('Wireless Headphones', 'Noise-cancelling over-ear headphones', 199.99, 100, 'Electronics', '${faker.image.urlPicsumPhotos()}'),
    //         ('T-shirt', 'Comfortable cotton t-shirt', 19.99, 200, 'Clothing', '${faker.image.urlPicsumPhotos()}'),
    //         ('Jeans', 'Classic denim jeans', 49.99, 150, 'Clothing', '${faker.image.urlPicsumPhotos()}'),
    //         ('Coffee Maker', 'Brews delicious coffee in minutes', 89.99, 40, 'Home & Kitchen', '${faker.image.urlPicsumPhotos()}'),
    //         ('Blender', 'High-speed blender for smoothies', 59.99, 60, 'Home & Kitchen', '${faker.image.urlPicsumPhotos()}'),
    //         ('The Great Gatsby', 'Classic novel by F. Scott Fitzgerald', 14.99, 80, 'Books', '${faker.image.urlPicsumPhotos()}'),
    //         ('1984', 'Dystopian novel by George Orwell', 12.99, 90, 'Books', '${faker.image.urlPicsumPhotos()}'),
    //         ('Moisturizer', 'Hydrating face cream for all skin types', 24.99, 120, 'Beauty', '${faker.image.urlPicsumPhotos()}')
    //     `);

    await queryRunner.query(productQuery);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM order_items`);
    await queryRunner.query(`DELETE FROM cart_items`);
    await queryRunner.query(`DELETE FROM orders`);
    await queryRunner.query(`DELETE FROM carts`);
    await queryRunner.query(`DELETE FROM products`);
    await queryRunner.query(`DELETE FROM categories`);
    await queryRunner.query(`DELETE FROM users`);
  }
}
