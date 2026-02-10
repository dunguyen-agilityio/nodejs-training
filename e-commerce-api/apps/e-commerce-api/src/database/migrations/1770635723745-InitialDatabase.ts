import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialDatabase1770635723745 implements MigrationInterface {
    name = 'InitialDatabase1770635723745'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "payment_secret" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "payment_secret"`);
    }

}
