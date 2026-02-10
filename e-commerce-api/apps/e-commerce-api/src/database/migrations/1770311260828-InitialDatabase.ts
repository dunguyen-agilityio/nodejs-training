import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialDatabase1770311260828 implements MigrationInterface {
    name = 'InitialDatabase1770311260828'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_30e89257a105eab7648a35c7fce"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "UQ_30e89257a105eab7648a35c7fce"`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_30e89257a105eab7648a35c7fce" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_30e89257a105eab7648a35c7fce"`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "UQ_30e89257a105eab7648a35c7fce" UNIQUE ("product_id")`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_30e89257a105eab7648a35c7fce" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
