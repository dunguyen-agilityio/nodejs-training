import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialDatabase1770654622347 implements MigrationInterface {
    name = 'InitialDatabase1770654622347'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stock_reservation" ADD "invoice_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stock_reservation" DROP COLUMN "invoice_id"`);
    }

}
