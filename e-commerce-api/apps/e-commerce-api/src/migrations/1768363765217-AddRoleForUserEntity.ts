import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoleForUserEntity1768363765217 implements MigrationInterface {
    name = 'AddRoleForUserEntity1768363765217'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_users" ("id" varchar PRIMARY KEY NOT NULL, "username" varchar, "first_name" varchar NOT NULL, "last_name" varchar, "age" integer, "email" varchar NOT NULL, "phone" varchar, "avatar" varchar, "password" varchar, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "role" varchar, CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"))`);
        await queryRunner.query(`INSERT INTO "temporary_users"("id", "username", "first_name", "last_name", "age", "email", "phone", "avatar", "password", "created_at", "updated_at") SELECT "id", "username", "first_name", "last_name", "age", "email", "phone", "avatar", "password", "created_at", "updated_at" FROM "users"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`ALTER TABLE "temporary_users" RENAME TO "users"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME TO "temporary_users"`);
        await queryRunner.query(`CREATE TABLE "users" ("id" varchar PRIMARY KEY NOT NULL, "username" varchar, "first_name" varchar NOT NULL, "last_name" varchar, "age" integer, "email" varchar NOT NULL, "phone" varchar, "avatar" varchar, "password" varchar, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"))`);
        await queryRunner.query(`INSERT INTO "users"("id", "username", "first_name", "last_name", "age", "email", "phone", "avatar", "password", "created_at", "updated_at") SELECT "id", "username", "first_name", "last_name", "age", "email", "phone", "avatar", "password", "created_at", "updated_at" FROM "temporary_users"`);
        await queryRunner.query(`DROP TABLE "temporary_users"`);
    }

}
