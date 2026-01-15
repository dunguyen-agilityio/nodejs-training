import "dotenv/config";
import { clerkClient } from "@clerk/fastify";
import { MigrationInterface, QueryRunner } from "typeorm";
import { USER_ROLES } from "#types/user";

export class SeedData1768297791711 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const { data } =
      await clerkClient.organizations.getOrganizationMembershipList({
        organizationId: process.env.CLERK_ORGANIZATION_ID!,
      });

    const migrateUserquery = data.reduce(
      (prev, { role, publicUserData }, idx) => {
        if (!publicUserData) return prev;
        const { firstName, lastName, identifier, imageUrl, userId } =
          publicUserData;
        return `
        ${prev}${idx === 0 ? "" : ","}
        ('${userId}', '${firstName}', '${lastName}', '${identifier}', '${imageUrl}', '${role.split(":")[1] || USER_ROLES.USER}')`;
      },
      "INSERT INTO users (id, first_name, last_name, email, avatar, role ) VALUES"
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

    await queryRunner.query(`
            INSERT INTO products (name, description, price, stock, category) VALUES 
            ('Smartphone', 'Latest model with high-resolution camera', 799.99, 50, 'Electronics'),
            ('Laptop', 'Powerful laptop for gaming and work', 1200.00, 30, 'Electronics'),
            ('Wireless Headphones', 'Noise-cancelling over-ear headphones', 199.99, 100, 'Electronics'),
            ('T-shirt', 'Comfortable cotton t-shirt', 19.99, 200, 'Clothing'),
            ('Jeans', 'Classic denim jeans', 49.99, 150, 'Clothing'),
            ('Coffee Maker', 'Brews delicious coffee in minutes', 89.99, 40, 'Home & Kitchen'),
            ('Blender', 'High-speed blender for smoothies', 59.99, 60, 'Home & Kitchen'),
            ('The Great Gatsby', 'Classic novel by F. Scott Fitzgerald', 14.99, 80, 'Books'),
            ('1984', 'Dystopian novel by George Orwell', 12.99, 90, 'Books'),
            ('Moisturizer', 'Hydrating face cream for all skin types', 24.99, 120, 'Beauty')
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM products`);
    await queryRunner.query(`DELETE FROM categories`);
    await queryRunner.query(`DELETE FROM users`);
  }
}
