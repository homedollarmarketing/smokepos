import type { MigrationInterface, QueryRunner } from "typeorm";

export class ChangePaymentMethodEnums1775589987625 implements MigrationInterface {
    name = 'ChangePaymentMethodEnums1775589987625'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "is_featured"`);
        await queryRunner.query(`ALTER TYPE "public"."sale_payments_method_enum" RENAME TO "sale_payments_method_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."sale_payments_method_enum" AS ENUM('cash', 'bank_transfer', 'mobile_money', 'card', 'other')`);
        await queryRunner.query(`ALTER TABLE "sale_payments" ALTER COLUMN "method" TYPE "public"."sale_payments_method_enum" USING "method"::"text"::"public"."sale_payments_method_enum"`);
        await queryRunner.query(`DROP TYPE "public"."sale_payments_method_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."sale_payments_method_enum_old" AS ENUM('cash', 'bank_transfer', 'mobile_money', 'pos', 'other')`);
        await queryRunner.query(`ALTER TABLE "sale_payments" ALTER COLUMN "method" TYPE "public"."sale_payments_method_enum_old" USING "method"::"text"::"public"."sale_payments_method_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."sale_payments_method_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."sale_payments_method_enum_old" RENAME TO "sale_payments_method_enum"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "is_featured" boolean NOT NULL DEFAULT false`);
    }

}
