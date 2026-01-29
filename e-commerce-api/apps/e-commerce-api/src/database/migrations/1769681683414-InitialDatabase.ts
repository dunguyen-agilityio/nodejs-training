import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialDatabase1769681683414 implements MigrationInterface {
    name = 'InitialDatabase1769681683414'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stock_reservation" DROP COLUMN "expires_at"`);
        await queryRunner.query(`ALTER TABLE "stock_reservation" ADD "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stock_reservation" DROP COLUMN "expires_at"`);
        await queryRunner.query(`ALTER TABLE "stock_reservation" ADD "expires_at" date NOT NULL`);
    }

}
