import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialDatabase1767868048909 implements MigrationInterface {
    name = 'InitialDatabase1767868048909'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "orders" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "status" varchar NOT NULL, "total_amount" decimal NOT NULL, "user_id" integer, CONSTRAINT "REL_a922b820eeef29ac1c6800e826" UNIQUE ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "product_id" integer NOT NULL, "quantity" integer NOT NULL, "price_at_purchase" decimal NOT NULL, "order_id" integer, CONSTRAINT "REL_145532db85752b29c57d2b7b1f" UNIQUE ("order_id"))`);
        await queryRunner.query(`CREATE TABLE "products" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "description" varchar NOT NULL, "price" decimal NOT NULL, "stock" integer NOT NULL, "images" text NOT NULL, "category_id" integer NOT NULL, "cartItemId" integer, "orderItemId" integer)`);
        await queryRunner.query(`CREATE TABLE "cart_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "product_id" integer NOT NULL, "quantity" integer NOT NULL, "cart_id" integer, CONSTRAINT "REL_6385a745d9e12a89b859bb2562" UNIQUE ("cart_id"))`);
        await queryRunner.query(`CREATE TABLE "carts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "status" varchar NOT NULL, "user_id" integer, CONSTRAINT "REL_2ec1c94a977b940d85a4f498ae" UNIQUE ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "username" varchar NOT NULL, "first_name" varchar NOT NULL, "last_name" varchar, "age" integer, "email" varchar NOT NULL, "phone" varchar NOT NULL, "avatar" varchar, "password" varchar NOT NULL, CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"))`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" varchar NOT NULL, CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name"))`);
        await queryRunner.query(`CREATE TABLE "temporary_orders" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "status" varchar NOT NULL, "total_amount" decimal NOT NULL, "user_id" integer, CONSTRAINT "REL_a922b820eeef29ac1c6800e826" UNIQUE ("user_id"), CONSTRAINT "FK_a922b820eeef29ac1c6800e826a" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_orders"("id", "created_at", "updated_at", "status", "total_amount", "user_id") SELECT "id", "created_at", "updated_at", "status", "total_amount", "user_id" FROM "orders"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`ALTER TABLE "temporary_orders" RENAME TO "orders"`);
        await queryRunner.query(`CREATE TABLE "temporary_order_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "product_id" integer NOT NULL, "quantity" integer NOT NULL, "price_at_purchase" decimal NOT NULL, "order_id" integer, CONSTRAINT "REL_145532db85752b29c57d2b7b1f" UNIQUE ("order_id"), CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_order_items"("id", "product_id", "quantity", "price_at_purchase", "order_id") SELECT "id", "product_id", "quantity", "price_at_purchase", "order_id" FROM "order_items"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`ALTER TABLE "temporary_order_items" RENAME TO "order_items"`);
        await queryRunner.query(`CREATE TABLE "temporary_products" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "description" varchar NOT NULL, "price" decimal NOT NULL, "stock" integer NOT NULL, "images" text NOT NULL, "category_id" integer NOT NULL, "cartItemId" integer, "orderItemId" integer, CONSTRAINT "FK_d9e533a885f4fc4202e8dc0202c" FOREIGN KEY ("cartItemId") REFERENCES "cart_items" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_3a518d2bfa9c01360d0d6ce1ff3" FOREIGN KEY ("orderItemId") REFERENCES "order_items" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_products"("id", "created_at", "updated_at", "name", "description", "price", "stock", "images", "category_id", "cartItemId", "orderItemId") SELECT "id", "created_at", "updated_at", "name", "description", "price", "stock", "images", "category_id", "cartItemId", "orderItemId" FROM "products"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`ALTER TABLE "temporary_products" RENAME TO "products"`);
        await queryRunner.query(`CREATE TABLE "temporary_cart_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "product_id" integer NOT NULL, "quantity" integer NOT NULL, "cart_id" integer, CONSTRAINT "REL_6385a745d9e12a89b859bb2562" UNIQUE ("cart_id"), CONSTRAINT "FK_6385a745d9e12a89b859bb25623" FOREIGN KEY ("cart_id") REFERENCES "carts" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_cart_items"("id", "product_id", "quantity", "cart_id") SELECT "id", "product_id", "quantity", "cart_id" FROM "cart_items"`);
        await queryRunner.query(`DROP TABLE "cart_items"`);
        await queryRunner.query(`ALTER TABLE "temporary_cart_items" RENAME TO "cart_items"`);
        await queryRunner.query(`CREATE TABLE "temporary_carts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "status" varchar NOT NULL, "user_id" integer, CONSTRAINT "REL_2ec1c94a977b940d85a4f498ae" UNIQUE ("user_id"), CONSTRAINT "FK_2ec1c94a977b940d85a4f498aea" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_carts"("id", "created_at", "updated_at", "status", "user_id") SELECT "id", "created_at", "updated_at", "status", "user_id" FROM "carts"`);
        await queryRunner.query(`DROP TABLE "carts"`);
        await queryRunner.query(`ALTER TABLE "temporary_carts" RENAME TO "carts"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "carts" RENAME TO "temporary_carts"`);
        await queryRunner.query(`CREATE TABLE "carts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "status" varchar NOT NULL, "user_id" integer, CONSTRAINT "REL_2ec1c94a977b940d85a4f498ae" UNIQUE ("user_id"))`);
        await queryRunner.query(`INSERT INTO "carts"("id", "created_at", "updated_at", "status", "user_id") SELECT "id", "created_at", "updated_at", "status", "user_id" FROM "temporary_carts"`);
        await queryRunner.query(`DROP TABLE "temporary_carts"`);
        await queryRunner.query(`ALTER TABLE "cart_items" RENAME TO "temporary_cart_items"`);
        await queryRunner.query(`CREATE TABLE "cart_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "product_id" integer NOT NULL, "quantity" integer NOT NULL, "cart_id" integer, CONSTRAINT "REL_6385a745d9e12a89b859bb2562" UNIQUE ("cart_id"))`);
        await queryRunner.query(`INSERT INTO "cart_items"("id", "product_id", "quantity", "cart_id") SELECT "id", "product_id", "quantity", "cart_id" FROM "temporary_cart_items"`);
        await queryRunner.query(`DROP TABLE "temporary_cart_items"`);
        await queryRunner.query(`ALTER TABLE "products" RENAME TO "temporary_products"`);
        await queryRunner.query(`CREATE TABLE "products" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "description" varchar NOT NULL, "price" decimal NOT NULL, "stock" integer NOT NULL, "images" text NOT NULL, "category_id" integer NOT NULL, "cartItemId" integer, "orderItemId" integer)`);
        await queryRunner.query(`INSERT INTO "products"("id", "created_at", "updated_at", "name", "description", "price", "stock", "images", "category_id", "cartItemId", "orderItemId") SELECT "id", "created_at", "updated_at", "name", "description", "price", "stock", "images", "category_id", "cartItemId", "orderItemId" FROM "temporary_products"`);
        await queryRunner.query(`DROP TABLE "temporary_products"`);
        await queryRunner.query(`ALTER TABLE "order_items" RENAME TO "temporary_order_items"`);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "product_id" integer NOT NULL, "quantity" integer NOT NULL, "price_at_purchase" decimal NOT NULL, "order_id" integer, CONSTRAINT "REL_145532db85752b29c57d2b7b1f" UNIQUE ("order_id"))`);
        await queryRunner.query(`INSERT INTO "order_items"("id", "product_id", "quantity", "price_at_purchase", "order_id") SELECT "id", "product_id", "quantity", "price_at_purchase", "order_id" FROM "temporary_order_items"`);
        await queryRunner.query(`DROP TABLE "temporary_order_items"`);
        await queryRunner.query(`ALTER TABLE "orders" RENAME TO "temporary_orders"`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "status" varchar NOT NULL, "total_amount" decimal NOT NULL, "user_id" integer, CONSTRAINT "REL_a922b820eeef29ac1c6800e826" UNIQUE ("user_id"))`);
        await queryRunner.query(`INSERT INTO "orders"("id", "created_at", "updated_at", "status", "total_amount", "user_id") SELECT "id", "created_at", "updated_at", "status", "total_amount", "user_id" FROM "temporary_orders"`);
        await queryRunner.query(`DROP TABLE "temporary_orders"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "carts"`);
        await queryRunner.query(`DROP TABLE "cart_items"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP TABLE "orders"`);
    }

}
