/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class InitDatabase1766646028540 {
    name = 'InitDatabase1766646028540'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "tags" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, CONSTRAINT "UQ_d90243459a697eadb8ad56e9092" UNIQUE ("name"), CONSTRAINT "UQ_d90243459a697eadb8ad56e9092" UNIQUE ("name"))`);
        await queryRunner.query(`CREATE TABLE "posts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar NOT NULL, "content" nvarchar(225) NOT NULL, "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "categoryId" integer)`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name"), CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name"))`);
        await queryRunner.query(`CREATE TABLE "tags_posts_posts" ("tagsId" integer NOT NULL, "postsId" integer NOT NULL, PRIMARY KEY ("tagsId", "postsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fff7d6237fcff2a66b701d6995" ON "tags_posts_posts" ("tagsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c24352ded9a4768d79a9456ec9" ON "tags_posts_posts" ("postsId") `);
        await queryRunner.query(`CREATE TABLE "posts_tags_tags" ("postsId" integer NOT NULL, "tagsId" integer NOT NULL, PRIMARY KEY ("postsId", "tagsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cf364c7e6905b285c4b55a0034" ON "posts_tags_tags" ("postsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ce163a967812183a51b044f740" ON "posts_tags_tags" ("tagsId") `);
        await queryRunner.query(`CREATE TABLE "temporary_posts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar NOT NULL, "content" nvarchar(225) NOT NULL, "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "categoryId" integer, CONSTRAINT "FK_168bf21b341e2ae340748e2541d" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_posts"("id", "title", "content", "created_at", "updated_at", "categoryId") SELECT "id", "title", "content", "created_at", "updated_at", "categoryId" FROM "posts"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`ALTER TABLE "temporary_posts" RENAME TO "posts"`);
        await queryRunner.query(`DROP INDEX "IDX_fff7d6237fcff2a66b701d6995"`);
        await queryRunner.query(`DROP INDEX "IDX_c24352ded9a4768d79a9456ec9"`);
        await queryRunner.query(`CREATE TABLE "temporary_tags_posts_posts" ("tagsId" integer NOT NULL, "postsId" integer NOT NULL, CONSTRAINT "FK_fff7d6237fcff2a66b701d6995e" FOREIGN KEY ("tagsId") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_c24352ded9a4768d79a9456ec98" FOREIGN KEY ("postsId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("tagsId", "postsId"))`);
        await queryRunner.query(`INSERT INTO "temporary_tags_posts_posts"("tagsId", "postsId") SELECT "tagsId", "postsId" FROM "tags_posts_posts"`);
        await queryRunner.query(`DROP TABLE "tags_posts_posts"`);
        await queryRunner.query(`ALTER TABLE "temporary_tags_posts_posts" RENAME TO "tags_posts_posts"`);
        await queryRunner.query(`CREATE INDEX "IDX_fff7d6237fcff2a66b701d6995" ON "tags_posts_posts" ("tagsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c24352ded9a4768d79a9456ec9" ON "tags_posts_posts" ("postsId") `);
        await queryRunner.query(`DROP INDEX "IDX_cf364c7e6905b285c4b55a0034"`);
        await queryRunner.query(`DROP INDEX "IDX_ce163a967812183a51b044f740"`);
        await queryRunner.query(`CREATE TABLE "temporary_posts_tags_tags" ("postsId" integer NOT NULL, "tagsId" integer NOT NULL, CONSTRAINT "FK_cf364c7e6905b285c4b55a00343" FOREIGN KEY ("postsId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_ce163a967812183a51b044f7404" FOREIGN KEY ("tagsId") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("postsId", "tagsId"))`);
        await queryRunner.query(`INSERT INTO "temporary_posts_tags_tags"("postsId", "tagsId") SELECT "postsId", "tagsId" FROM "posts_tags_tags"`);
        await queryRunner.query(`DROP TABLE "posts_tags_tags"`);
        await queryRunner.query(`ALTER TABLE "temporary_posts_tags_tags" RENAME TO "posts_tags_tags"`);
        await queryRunner.query(`CREATE INDEX "IDX_cf364c7e6905b285c4b55a0034" ON "posts_tags_tags" ("postsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ce163a967812183a51b044f740" ON "posts_tags_tags" ("tagsId") `);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "IDX_ce163a967812183a51b044f740"`);
        await queryRunner.query(`DROP INDEX "IDX_cf364c7e6905b285c4b55a0034"`);
        await queryRunner.query(`ALTER TABLE "posts_tags_tags" RENAME TO "temporary_posts_tags_tags"`);
        await queryRunner.query(`CREATE TABLE "posts_tags_tags" ("postsId" integer NOT NULL, "tagsId" integer NOT NULL, PRIMARY KEY ("postsId", "tagsId"))`);
        await queryRunner.query(`INSERT INTO "posts_tags_tags"("postsId", "tagsId") SELECT "postsId", "tagsId" FROM "temporary_posts_tags_tags"`);
        await queryRunner.query(`DROP TABLE "temporary_posts_tags_tags"`);
        await queryRunner.query(`CREATE INDEX "IDX_ce163a967812183a51b044f740" ON "posts_tags_tags" ("tagsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_cf364c7e6905b285c4b55a0034" ON "posts_tags_tags" ("postsId") `);
        await queryRunner.query(`DROP INDEX "IDX_c24352ded9a4768d79a9456ec9"`);
        await queryRunner.query(`DROP INDEX "IDX_fff7d6237fcff2a66b701d6995"`);
        await queryRunner.query(`ALTER TABLE "tags_posts_posts" RENAME TO "temporary_tags_posts_posts"`);
        await queryRunner.query(`CREATE TABLE "tags_posts_posts" ("tagsId" integer NOT NULL, "postsId" integer NOT NULL, PRIMARY KEY ("tagsId", "postsId"))`);
        await queryRunner.query(`INSERT INTO "tags_posts_posts"("tagsId", "postsId") SELECT "tagsId", "postsId" FROM "temporary_tags_posts_posts"`);
        await queryRunner.query(`DROP TABLE "temporary_tags_posts_posts"`);
        await queryRunner.query(`CREATE INDEX "IDX_c24352ded9a4768d79a9456ec9" ON "tags_posts_posts" ("postsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_fff7d6237fcff2a66b701d6995" ON "tags_posts_posts" ("tagsId") `);
        await queryRunner.query(`ALTER TABLE "posts" RENAME TO "temporary_posts"`);
        await queryRunner.query(`CREATE TABLE "posts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar NOT NULL, "content" nvarchar(225) NOT NULL, "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "categoryId" integer)`);
        await queryRunner.query(`INSERT INTO "posts"("id", "title", "content", "created_at", "updated_at", "categoryId") SELECT "id", "title", "content", "created_at", "updated_at", "categoryId" FROM "temporary_posts"`);
        await queryRunner.query(`DROP TABLE "temporary_posts"`);
        await queryRunner.query(`DROP INDEX "IDX_ce163a967812183a51b044f740"`);
        await queryRunner.query(`DROP INDEX "IDX_cf364c7e6905b285c4b55a0034"`);
        await queryRunner.query(`DROP TABLE "posts_tags_tags"`);
        await queryRunner.query(`DROP INDEX "IDX_c24352ded9a4768d79a9456ec9"`);
        await queryRunner.query(`DROP INDEX "IDX_fff7d6237fcff2a66b701d6995"`);
        await queryRunner.query(`DROP TABLE "tags_posts_posts"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`DROP TABLE "tags"`);
    }
}
