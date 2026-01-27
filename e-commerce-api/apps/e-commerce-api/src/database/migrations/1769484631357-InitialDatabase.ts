import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialDatabase1769484631357 implements MigrationInterface {
    name = 'InitialDatabase1769484631357'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" varchar PRIMARY KEY NOT NULL, "username" varchar, "first_name" varchar NOT NULL, "last_name" varchar, "age" integer, "email" varchar NOT NULL, "phone" varchar, "avatar" varchar, "password" varchar, "stripe_id" varchar, "created_at" datetime, "role" varchar, "updated_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"), CONSTRAINT "UQ_57c299c1793b1cffc299d5c28c6" UNIQUE ("stripe_id"))`);
        await queryRunner.query(`CREATE TABLE "carts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "status" varchar NOT NULL DEFAULT ('active'), "user_id" varchar, CONSTRAINT "REL_2ec1c94a977b940d85a4f498ae" UNIQUE ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "cart_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" integer NOT NULL, "cart_id" integer, "product_id" integer)`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" varchar NOT NULL, CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name"))`);
        await queryRunner.query(`CREATE TABLE "products" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "description" varchar NOT NULL, "price" decimal NOT NULL, "stock" integer NOT NULL, "images" text, "category" varchar)`);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" integer NOT NULL, "price_at_purchase" decimal NOT NULL, "order_id" integer, "product_id" integer)`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "status" varchar NOT NULL, "total_amount" decimal NOT NULL, "invoice_id" varchar, "user_id" varchar)`);
        await queryRunner.query(`CREATE TABLE "temporary_carts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "status" varchar NOT NULL DEFAULT ('active'), "user_id" varchar, CONSTRAINT "REL_2ec1c94a977b940d85a4f498ae" UNIQUE ("user_id"), CONSTRAINT "FK_2ec1c94a977b940d85a4f498aea" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_carts"("id", "created_at", "updated_at", "status", "user_id") SELECT "id", "created_at", "updated_at", "status", "user_id" FROM "carts"`);
        await queryRunner.query(`DROP TABLE "carts"`);
        await queryRunner.query(`ALTER TABLE "temporary_carts" RENAME TO "carts"`);
        await queryRunner.query(`CREATE TABLE "temporary_cart_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" integer NOT NULL, "cart_id" integer, "product_id" integer, CONSTRAINT "FK_6385a745d9e12a89b859bb25623" FOREIGN KEY ("cart_id") REFERENCES "carts" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_30e89257a105eab7648a35c7fce" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_cart_items"("id", "quantity", "cart_id", "product_id") SELECT "id", "quantity", "cart_id", "product_id" FROM "cart_items"`);
        await queryRunner.query(`DROP TABLE "cart_items"`);
        await queryRunner.query(`ALTER TABLE "temporary_cart_items" RENAME TO "cart_items"`);
        await queryRunner.query(`CREATE TABLE "temporary_products" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "description" varchar NOT NULL, "price" decimal NOT NULL, "stock" integer NOT NULL, "images" text, "category" varchar, CONSTRAINT "FK_c3932231d2385ac248d0888d955" FOREIGN KEY ("category") REFERENCES "categories" ("name") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_products"("id", "created_at", "updated_at", "name", "description", "price", "stock", "images", "category") SELECT "id", "created_at", "updated_at", "name", "description", "price", "stock", "images", "category" FROM "products"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`ALTER TABLE "temporary_products" RENAME TO "products"`);
        await queryRunner.query(`CREATE TABLE "temporary_order_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" integer NOT NULL, "price_at_purchase" decimal NOT NULL, "order_id" integer, "product_id" integer, CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_9263386c35b6b242540f9493b00" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_order_items"("id", "quantity", "price_at_purchase", "order_id", "product_id") SELECT "id", "quantity", "price_at_purchase", "order_id", "product_id" FROM "order_items"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`ALTER TABLE "temporary_order_items" RENAME TO "order_items"`);
        await queryRunner.query(`CREATE TABLE "temporary_orders" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "status" varchar NOT NULL, "total_amount" decimal NOT NULL, "invoice_id" varchar, "user_id" varchar, CONSTRAINT "FK_a922b820eeef29ac1c6800e826a" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_orders"("id", "created_at", "updated_at", "status", "total_amount", "invoice_id", "user_id") SELECT "id", "created_at", "updated_at", "status", "total_amount", "invoice_id", "user_id" FROM "orders"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`ALTER TABLE "temporary_orders" RENAME TO "orders"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" RENAME TO "temporary_orders"`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "status" varchar NOT NULL, "total_amount" decimal NOT NULL, "invoice_id" varchar, "user_id" varchar)`);
        await queryRunner.query(`INSERT INTO "orders"("id", "created_at", "updated_at", "status", "total_amount", "invoice_id", "user_id") SELECT "id", "created_at", "updated_at", "status", "total_amount", "invoice_id", "user_id" FROM "temporary_orders"`);
        await queryRunner.query(`DROP TABLE "temporary_orders"`);
        await queryRunner.query(`ALTER TABLE "order_items" RENAME TO "temporary_order_items"`);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" integer NOT NULL, "price_at_purchase" decimal NOT NULL, "order_id" integer, "product_id" integer)`);
        await queryRunner.query(`INSERT INTO "order_items"("id", "quantity", "price_at_purchase", "order_id", "product_id") SELECT "id", "quantity", "price_at_purchase", "order_id", "product_id" FROM "temporary_order_items"`);
        await queryRunner.query(`DROP TABLE "temporary_order_items"`);
        await queryRunner.query(`ALTER TABLE "products" RENAME TO "temporary_products"`);
        await queryRunner.query(`CREATE TABLE "products" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "description" varchar NOT NULL, "price" decimal NOT NULL, "stock" integer NOT NULL, "images" text, "category" varchar)`);
        await queryRunner.query(`INSERT INTO "products"("id", "created_at", "updated_at", "name", "description", "price", "stock", "images", "category") SELECT "id", "created_at", "updated_at", "name", "description", "price", "stock", "images", "category" FROM "temporary_products"`);
        await queryRunner.query(`DROP TABLE "temporary_products"`);
        await queryRunner.query(`ALTER TABLE "cart_items" RENAME TO "temporary_cart_items"`);
        await queryRunner.query(`CREATE TABLE "cart_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" integer NOT NULL, "cart_id" integer, "product_id" integer)`);
        await queryRunner.query(`INSERT INTO "cart_items"("id", "quantity", "cart_id", "product_id") SELECT "id", "quantity", "cart_id", "product_id" FROM "temporary_cart_items"`);
        await queryRunner.query(`DROP TABLE "temporary_cart_items"`);
        await queryRunner.query(`ALTER TABLE "carts" RENAME TO "temporary_carts"`);
        await queryRunner.query(`CREATE TABLE "carts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "status" varchar NOT NULL DEFAULT ('active'), "user_id" varchar, CONSTRAINT "REL_2ec1c94a977b940d85a4f498ae" UNIQUE ("user_id"))`);
        await queryRunner.query(`INSERT INTO "carts"("id", "created_at", "updated_at", "status", "user_id") SELECT "id", "created_at", "updated_at", "status", "user_id" FROM "temporary_carts"`);
        await queryRunner.query(`DROP TABLE "temporary_carts"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "cart_items"`);
        await queryRunner.query(`DROP TABLE "carts"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
