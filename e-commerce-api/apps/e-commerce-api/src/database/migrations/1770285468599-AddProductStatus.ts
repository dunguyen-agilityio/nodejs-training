import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddProductStatus1770285468599 implements MigrationInterface {
  name = 'AddProductStatus1770285468599'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."products_status_enum" AS ENUM('draft', 'published', 'archived', 'deleted')`,
    )
    await queryRunner.query(
      `ALTER TABLE "products" ADD "status" "public"."products_status_enum" DEFAULT 'draft'`,
    )

    // Data Migration
    await queryRunner.query(
      `UPDATE "products" SET "status" = 'published' WHERE "deleted" IS NULL OR "deleted" = false`,
    )
    await queryRunner.query(
      `UPDATE "products" SET "status" = 'deleted' WHERE "deleted" = true`,
    )

    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "status" SET NOT NULL`,
    )
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "deleted"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" ADD "deleted" boolean`)

    // Data Migration Reversal
    await queryRunner.query(
      `UPDATE "products" SET "deleted" = true WHERE "status" = 'deleted'`,
    )
    await queryRunner.query(
      `UPDATE "products" SET "deleted" = false WHERE "status" != 'deleted'`,
    )

    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "status"`)
    await queryRunner.query(`DROP TYPE "public"."products_status_enum"`)
  }
}
