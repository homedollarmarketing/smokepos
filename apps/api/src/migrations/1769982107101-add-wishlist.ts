import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWishlist1769982107101 implements MigrationInterface {
  name = 'AddWishlist1769982107101';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "wishlists" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customer_id" uuid NOT NULL, "product_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_66291670c9d1443777a62c16c65" UNIQUE ("customer_id", "product_id"), CONSTRAINT "PK_d0a37f2848c5d268d315325f359" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1ecae3acee67b8f1b5ae9f5149" ON "wishlists" ("customer_id") `
    );
    await queryRunner.query(
      `ALTER TABLE "wishlists" ADD CONSTRAINT "FK_1ecae3acee67b8f1b5ae9f51498" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "wishlists" ADD CONSTRAINT "FK_2662acbb3868b1f0077fda61dd2" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wishlists" DROP CONSTRAINT "FK_2662acbb3868b1f0077fda61dd2"`
    );
    await queryRunner.query(
      `ALTER TABLE "wishlists" DROP CONSTRAINT "FK_1ecae3acee67b8f1b5ae9f51498"`
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_1ecae3acee67b8f1b5ae9f5149"`);
    await queryRunner.query(`DROP TABLE "wishlists"`);
  }
}
