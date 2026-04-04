import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddStockAdjustments1773730566184 implements MigrationInterface {
    name = 'AddStockAdjustments1773730566184'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."stock_adjustments_adjustment_type_enum" AS ENUM('procurement_receipt', 'sale', 'sale_cancellation', 'manual')`);
        await queryRunner.query(`CREATE TABLE "stock_adjustments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "product_id" uuid NOT NULL, "branch_id" uuid NOT NULL, "adjustment_type" "public"."stock_adjustments_adjustment_type_enum" NOT NULL, "quantity_change" integer NOT NULL, "previous_quantity" integer NOT NULL, "new_quantity" integer NOT NULL, "unit_cost" numeric, "previous_cost_price" numeric, "new_cost_price" numeric, "reference_type" character varying(50), "reference_id" uuid, "reference_code" character varying(100), "reason" text, "staff_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7dc03d92f242dd489d33b80d063" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0397e6c062356a6ca2e36dc4e9" ON "stock_adjustments" ("branch_id", "created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_a8d672079a8cd5ace49d5ae1f6" ON "stock_adjustments" ("product_id", "created_at") `);
        await queryRunner.query(`ALTER TABLE "stock_adjustments" ADD CONSTRAINT "FK_aec247181f0d73ffe0393013a15" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_adjustments" ADD CONSTRAINT "FK_0d82739bce821a3aca8bbdbc896" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_adjustments" ADD CONSTRAINT "FK_55e6448ef8816a07f29282cae42" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stock_adjustments" DROP CONSTRAINT "FK_55e6448ef8816a07f29282cae42"`);
        await queryRunner.query(`ALTER TABLE "stock_adjustments" DROP CONSTRAINT "FK_0d82739bce821a3aca8bbdbc896"`);
        await queryRunner.query(`ALTER TABLE "stock_adjustments" DROP CONSTRAINT "FK_aec247181f0d73ffe0393013a15"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a8d672079a8cd5ace49d5ae1f6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0397e6c062356a6ca2e36dc4e9"`);
        await queryRunner.query(`DROP TABLE "stock_adjustments"`);
        await queryRunner.query(`DROP TYPE "public"."stock_adjustments_adjustment_type_enum"`);
    }

}
