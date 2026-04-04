import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSaleType1769986742798 implements MigrationInterface {
  name = 'AddSaleType1769986742798';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."sales_customer_source_enum" AS ENUM('walk_in', 'referral', 'online', 'staff_support', 'returning_customer', 'other')`
    );
    await queryRunner.query(
      `ALTER TABLE "sales" ADD "customer_source" "public"."sales_customer_source_enum" NOT NULL DEFAULT 'walk_in'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sales" DROP COLUMN "customer_source"`);
    await queryRunner.query(`DROP TYPE "public"."sales_customer_source_enum"`);
  }
}
