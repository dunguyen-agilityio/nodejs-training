/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class UpdateUserSchema1767169638501 {
    name = 'UpdateUserSchema1767169638501'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "temporary_users" ("email" varchar NOT NULL, "firstName" varchar NOT NULL, "lastName" varchar NOT NULL, "password" varchar NOT NULL, "dateOfBirth" date NOT NULL, "address" varchar NOT NULL, "role" integer NOT NULL DEFAULT (0), "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"))`);
        await queryRunner.query(`INSERT INTO "temporary_users"("email", "firstName", "lastName", "password", "dateOfBirth", "address", "role", "id", "created_at", "updated_at") SELECT "username", "firstName", "lastName", "password", "dateOfBirth", "address", "role", "id", "created_at", "updated_at" FROM "users"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`ALTER TABLE "temporary_users" RENAME TO "users"`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" RENAME TO "temporary_users"`);
        await queryRunner.query(`CREATE TABLE "users" ("username" varchar NOT NULL, "firstName" varchar NOT NULL, "lastName" varchar NOT NULL, "password" varchar NOT NULL, "dateOfBirth" date NOT NULL, "address" varchar NOT NULL, "role" integer NOT NULL DEFAULT (0), "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"))`);
        await queryRunner.query(`INSERT INTO "users"("username", "firstName", "lastName", "password", "dateOfBirth", "address", "role", "id", "created_at", "updated_at") SELECT "email", "firstName", "lastName", "password", "dateOfBirth", "address", "role", "id", "created_at", "updated_at" FROM "temporary_users"`);
        await queryRunner.query(`DROP TABLE "temporary_users"`);
    }
}
