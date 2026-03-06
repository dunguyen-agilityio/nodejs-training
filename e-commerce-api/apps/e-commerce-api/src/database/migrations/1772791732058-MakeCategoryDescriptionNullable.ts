import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeCategoryDescriptionNullable1772791732058 implements MigrationInterface {
    name = 'MakeCategoryDescriptionNullable1772791732058'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" ALTER COLUMN "description" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" ALTER COLUMN "description" SET NOT NULL`);
    }

}
