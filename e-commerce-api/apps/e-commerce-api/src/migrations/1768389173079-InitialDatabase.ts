import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialDatabase1768389173079 implements MigrationInterface {
    name = 'InitialDatabase1768389173079'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_carts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "status" varchar NOT NULL DEFAULT ('active'), "user_id" varchar, CONSTRAINT "REL_2ec1c94a977b940d85a4f498ae" UNIQUE ("user_id"), CONSTRAINT "FK_2ec1c94a977b940d85a4f498aea" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_carts"("id", "created_at", "updated_at", "status", "user_id") SELECT "id", "created_at", "updated_at", "status", "user_id" FROM "carts"`);
        await queryRunner.query(`DROP TABLE "carts"`);
        await queryRunner.query(`ALTER TABLE "temporary_carts" RENAME TO "carts"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "carts" RENAME TO "temporary_carts"`);
        await queryRunner.query(`CREATE TABLE "carts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "status" varchar NOT NULL, "user_id" varchar, CONSTRAINT "REL_2ec1c94a977b940d85a4f498ae" UNIQUE ("user_id"), CONSTRAINT "FK_2ec1c94a977b940d85a4f498aea" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "carts"("id", "created_at", "updated_at", "status", "user_id") SELECT "id", "created_at", "updated_at", "status", "user_id" FROM "temporary_carts"`);
        await queryRunner.query(`DROP TABLE "temporary_carts"`);
    }

}
