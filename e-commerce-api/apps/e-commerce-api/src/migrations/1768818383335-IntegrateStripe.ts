import { MigrationInterface, QueryRunner } from "typeorm";

export class IntegrateStripe1768818383335 implements MigrationInterface {
    name = 'IntegrateStripe1768818383335'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_orders" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "status" varchar NOT NULL, "total_amount" decimal NOT NULL, "user_id" varchar, CONSTRAINT "REL_a922b820eeef29ac1c6800e826" UNIQUE ("user_id"), CONSTRAINT "FK_a922b820eeef29ac1c6800e826a" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_orders"("id", "created_at", "updated_at", "status", "total_amount", "user_id") SELECT "id", "created_at", "updated_at", "status", "total_amount", "user_id" FROM "orders"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`ALTER TABLE "temporary_orders" RENAME TO "orders"`);
        await queryRunner.query(`CREATE TABLE "temporary_order_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" integer NOT NULL, "price_at_purchase" decimal NOT NULL, "order_id" integer, "product_id" integer, CONSTRAINT "REL_9263386c35b6b242540f9493b0" UNIQUE ("product_id"), CONSTRAINT "REL_145532db85752b29c57d2b7b1f" UNIQUE ("order_id"), CONSTRAINT "FK_9263386c35b6b242540f9493b00" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_order_items"("id", "quantity", "price_at_purchase", "order_id", "product_id") SELECT "id", "quantity", "price_at_purchase", "order_id", "product_id" FROM "order_items"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`ALTER TABLE "temporary_order_items" RENAME TO "order_items"`);
        await queryRunner.query(`CREATE TABLE "temporary_orders" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "status" varchar NOT NULL, "total_amount" decimal NOT NULL, "user_id" varchar, CONSTRAINT "REL_a922b820eeef29ac1c6800e826" UNIQUE ("user_id"))`);
        await queryRunner.query(`INSERT INTO "temporary_orders"("id", "created_at", "updated_at", "status", "total_amount", "user_id") SELECT "id", "created_at", "updated_at", "status", "total_amount", "user_id" FROM "orders"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`ALTER TABLE "temporary_orders" RENAME TO "orders"`);
        await queryRunner.query(`CREATE TABLE "temporary_orders" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "status" varchar NOT NULL, "total_amount" decimal NOT NULL, "user_id" varchar NOT NULL, CONSTRAINT "REL_a922b820eeef29ac1c6800e826" UNIQUE ("user_id"))`);
        await queryRunner.query(`INSERT INTO "temporary_orders"("id", "created_at", "updated_at", "status", "total_amount", "user_id") SELECT "id", "created_at", "updated_at", "status", "total_amount", "user_id" FROM "orders"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`ALTER TABLE "temporary_orders" RENAME TO "orders"`);
        await queryRunner.query(`CREATE TABLE "temporary_order_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" integer NOT NULL, "price_at_purchase" decimal NOT NULL, "order_id" integer, "product_id" integer, CONSTRAINT "REL_9263386c35b6b242540f9493b0" UNIQUE ("product_id"), CONSTRAINT "REL_145532db85752b29c57d2b7b1f" UNIQUE ("order_id"))`);
        await queryRunner.query(`INSERT INTO "temporary_order_items"("id", "quantity", "price_at_purchase", "order_id", "product_id") SELECT "id", "quantity", "price_at_purchase", "order_id", "product_id" FROM "order_items"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`ALTER TABLE "temporary_order_items" RENAME TO "order_items"`);
        await queryRunner.query(`CREATE TABLE "temporary_order_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" integer NOT NULL, "price_at_purchase" decimal NOT NULL, "order_id" integer, "product_id" integer, CONSTRAINT "REL_9263386c35b6b242540f9493b0" UNIQUE ("product_id"), CONSTRAINT "REL_145532db85752b29c57d2b7b1f" UNIQUE ("order_id"))`);
        await queryRunner.query(`INSERT INTO "temporary_order_items"("id", "quantity", "price_at_purchase", "order_id", "product_id") SELECT "id", "quantity", "price_at_purchase", "order_id", "product_id" FROM "order_items"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`ALTER TABLE "temporary_order_items" RENAME TO "order_items"`);
        await queryRunner.query(`CREATE TABLE "temporary_orders" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "status" varchar NOT NULL, "total_amount" decimal NOT NULL, "user_id" varchar NOT NULL, CONSTRAINT "REL_a922b820eeef29ac1c6800e826" UNIQUE ("user_id"), CONSTRAINT "FK_a922b820eeef29ac1c6800e826a" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_orders"("id", "created_at", "updated_at", "status", "total_amount", "user_id") SELECT "id", "created_at", "updated_at", "status", "total_amount", "user_id" FROM "orders"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`ALTER TABLE "temporary_orders" RENAME TO "orders"`);
        await queryRunner.query(`CREATE TABLE "temporary_order_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" integer NOT NULL, "price_at_purchase" decimal NOT NULL, "order_id" integer, "product_id" integer, CONSTRAINT "REL_9263386c35b6b242540f9493b0" UNIQUE ("product_id"), CONSTRAINT "REL_145532db85752b29c57d2b7b1f" UNIQUE ("order_id"), CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_9263386c35b6b242540f9493b00" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_order_items"("id", "quantity", "price_at_purchase", "order_id", "product_id") SELECT "id", "quantity", "price_at_purchase", "order_id", "product_id" FROM "order_items"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`ALTER TABLE "temporary_order_items" RENAME TO "order_items"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" RENAME TO "temporary_order_items"`);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" integer NOT NULL, "price_at_purchase" decimal NOT NULL, "order_id" integer, "product_id" integer, CONSTRAINT "REL_9263386c35b6b242540f9493b0" UNIQUE ("product_id"), CONSTRAINT "REL_145532db85752b29c57d2b7b1f" UNIQUE ("order_id"))`);
        await queryRunner.query(`INSERT INTO "order_items"("id", "quantity", "price_at_purchase", "order_id", "product_id") SELECT "id", "quantity", "price_at_purchase", "order_id", "product_id" FROM "temporary_order_items"`);
        await queryRunner.query(`DROP TABLE "temporary_order_items"`);
        await queryRunner.query(`ALTER TABLE "orders" RENAME TO "temporary_orders"`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "status" varchar NOT NULL, "total_amount" decimal NOT NULL, "user_id" varchar NOT NULL, CONSTRAINT "REL_a922b820eeef29ac1c6800e826" UNIQUE ("user_id"))`);
        await queryRunner.query(`INSERT INTO "orders"("id", "created_at", "updated_at", "status", "total_amount", "user_id") SELECT "id", "created_at", "updated_at", "status", "total_amount", "user_id" FROM "temporary_orders"`);
        await queryRunner.query(`DROP TABLE "temporary_orders"`);
        await queryRunner.query(`ALTER TABLE "order_items" RENAME TO "temporary_order_items"`);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" integer NOT NULL, "price_at_purchase" decimal NOT NULL, "order_id" integer, "product_id" integer, CONSTRAINT "REL_9263386c35b6b242540f9493b0" UNIQUE ("product_id"), CONSTRAINT "REL_145532db85752b29c57d2b7b1f" UNIQUE ("order_id"))`);
        await queryRunner.query(`INSERT INTO "order_items"("id", "quantity", "price_at_purchase", "order_id", "product_id") SELECT "id", "quantity", "price_at_purchase", "order_id", "product_id" FROM "temporary_order_items"`);
        await queryRunner.query(`DROP TABLE "temporary_order_items"`);
        await queryRunner.query(`ALTER TABLE "order_items" RENAME TO "temporary_order_items"`);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" integer NOT NULL, "price_at_purchase" decimal NOT NULL, "order_id" integer, "product_id" integer, CONSTRAINT "REL_9263386c35b6b242540f9493b0" UNIQUE ("product_id"), CONSTRAINT "REL_145532db85752b29c57d2b7b1f" UNIQUE ("order_id"), CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "order_items"("id", "quantity", "price_at_purchase", "order_id", "product_id") SELECT "id", "quantity", "price_at_purchase", "order_id", "product_id" FROM "temporary_order_items"`);
        await queryRunner.query(`DROP TABLE "temporary_order_items"`);
        await queryRunner.query(`ALTER TABLE "orders" RENAME TO "temporary_orders"`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "status" varchar NOT NULL, "total_amount" decimal NOT NULL, "user_id" varchar, CONSTRAINT "REL_a922b820eeef29ac1c6800e826" UNIQUE ("user_id"))`);
        await queryRunner.query(`INSERT INTO "orders"("id", "created_at", "updated_at", "status", "total_amount", "user_id") SELECT "id", "created_at", "updated_at", "status", "total_amount", "user_id" FROM "temporary_orders"`);
        await queryRunner.query(`DROP TABLE "temporary_orders"`);
        await queryRunner.query(`ALTER TABLE "orders" RENAME TO "temporary_orders"`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "status" varchar NOT NULL, "total_amount" decimal NOT NULL, "user_id" varchar, CONSTRAINT "REL_a922b820eeef29ac1c6800e826" UNIQUE ("user_id"), CONSTRAINT "FK_a922b820eeef29ac1c6800e826a" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "orders"("id", "created_at", "updated_at", "status", "total_amount", "user_id") SELECT "id", "created_at", "updated_at", "status", "total_amount", "user_id" FROM "temporary_orders"`);
        await queryRunner.query(`DROP TABLE "temporary_orders"`);
        await queryRunner.query(`ALTER TABLE "order_items" RENAME TO "temporary_order_items"`);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" integer NOT NULL, "price_at_purchase" decimal NOT NULL, "order_id" integer, "product_id" integer, CONSTRAINT "REL_9263386c35b6b242540f9493b0" UNIQUE ("product_id"), CONSTRAINT "REL_145532db85752b29c57d2b7b1f" UNIQUE ("order_id"), CONSTRAINT "FK_9263386c35b6b242540f9493b00" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "order_items"("id", "quantity", "price_at_purchase", "order_id", "product_id") SELECT "id", "quantity", "price_at_purchase", "order_id", "product_id" FROM "temporary_order_items"`);
        await queryRunner.query(`DROP TABLE "temporary_order_items"`);
        await queryRunner.query(`ALTER TABLE "orders" RENAME TO "temporary_orders"`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "status" varchar NOT NULL, "total_amount" decimal NOT NULL, "user_id" varchar, CONSTRAINT "REL_a922b820eeef29ac1c6800e826" UNIQUE ("user_id"), CONSTRAINT "FK_a922b820eeef29ac1c6800e826a" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "orders"("id", "created_at", "updated_at", "status", "total_amount", "user_id") SELECT "id", "created_at", "updated_at", "status", "total_amount", "user_id" FROM "temporary_orders"`);
        await queryRunner.query(`DROP TABLE "temporary_orders"`);
    }

}
