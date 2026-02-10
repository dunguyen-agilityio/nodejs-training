import { MigrationInterface, QueryRunner } from 'typeorm'

export class InitialDatabase1770101666278 implements MigrationInterface {
  name = 'InitialDatabase1770101666278'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "paid_at"`)
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD "paid_at" TIMESTAMP WITH TIME ZONE`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "paid_at"`)
    await queryRunner.query(`ALTER TABLE "invoice" ADD "paid_at" date`)
  }
}
