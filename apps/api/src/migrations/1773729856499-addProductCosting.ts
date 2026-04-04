import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductCosting1773729856499 implements MigrationInterface {
    name = 'AddProductCosting1773729856499'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "cost_price" numeric`);
        await queryRunner.query(`ALTER TABLE "sale_items" ADD "unit_cost" numeric`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sale_items" DROP COLUMN "unit_cost"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "cost_price"`);
    }

}
