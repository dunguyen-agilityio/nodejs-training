import { MigrationInterface, QueryRunner } from 'typeorm'

export class InitialDatabase1770110764568 implements MigrationInterface {
  name = 'InitialDatabase1770110764568'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" ADD "deleted" boolean`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "deleted"`)
  }
}
