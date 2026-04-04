import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStaffLinkToExpense1769977073857 implements MigrationInterface {
  name = 'AddStaffLinkToExpense1769977073857';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "expenses" ADD "staff_id" uuid`);
    await queryRunner.query(
      `ALTER TYPE "public"."expenses_category_enum" RENAME TO "expenses_category_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."expenses_category_enum" AS ENUM('rent', 'transport', 'salary', 'allowance', 'utilities', 'supplies', 'maintenance', 'marketing', 'insurance', 'taxes', 'equipment', 'communication', 'travel', 'training', 'food', 'miscellaneous')`
    );
    await queryRunner.query(
      `ALTER TABLE "expenses" ALTER COLUMN "category" TYPE "public"."expenses_category_enum" USING "category"::"text"::"public"."expenses_category_enum"`
    );
    await queryRunner.query(`DROP TYPE "public"."expenses_category_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "expenses" ADD CONSTRAINT "FK_3cd2576bb86b04c92ef3647df24" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "expenses" DROP CONSTRAINT "FK_3cd2576bb86b04c92ef3647df24"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."expenses_category_enum_old" AS ENUM('rent', 'transport', 'salary', 'allowance', 'utilities', 'supplies', 'maintenance', 'marketing', 'insurance', 'taxes', 'equipment', 'communication', 'travel', 'training', 'miscellaneous')`
    );
    await queryRunner.query(
      `ALTER TABLE "expenses" ALTER COLUMN "category" TYPE "public"."expenses_category_enum_old" USING "category"::"text"::"public"."expenses_category_enum_old"`
    );
    await queryRunner.query(`DROP TYPE "public"."expenses_category_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."expenses_category_enum_old" RENAME TO "expenses_category_enum"`
    );
    await queryRunner.query(`ALTER TABLE "expenses" DROP COLUMN "staff_id"`);
  }
}
