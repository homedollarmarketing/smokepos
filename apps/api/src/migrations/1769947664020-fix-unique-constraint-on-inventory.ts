import type { MigrationInterface, QueryRunner } from 'typeorm';

export class FixUniqueConstraintOnInventory1769947664020 implements MigrationInterface {
  name = 'FixUniqueConstraintOnInventory1769947664020';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878"`
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09"`
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_5f641129265a386fc2908ce554"`);
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "UQ_4c9fb58de893725258746385e16"`
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "UQ_464f927ae360106b783ed0b4106"`
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "UQ_c44ac33a05b144dd0d9ddcf9327"`
    );
    await queryRunner.query(
      `ALTER TABLE "brands" DROP CONSTRAINT "UQ_96db6bbbaa6f23cad26871339b6"`
    );
    await queryRunner.query(
      `ALTER TABLE "brands" DROP CONSTRAINT "UQ_b15428f362be2200922952dc268"`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5f641129265a386fc2908ce554" ON "products" ("name", "sku") `
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "UQ_fb93d78059ff4f270e6814376d0" UNIQUE ("slug", "branch_id")`
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "UQ_4a4d05351ce1db14799d976476b" UNIQUE ("name", "branch_id")`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "UQ_d41b1da4fa1a7cc98df9e223a93" UNIQUE ("sku", "branch_id")`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "UQ_ff837076541de5cfe88f1601f9d" UNIQUE ("slug", "branch_id")`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "UQ_6c961be921970fb907afba8eece" UNIQUE ("name", "branch_id")`
    );
    await queryRunner.query(
      `ALTER TABLE "brands" ADD CONSTRAINT "UQ_c3e5fd9b3ffd48320937993786d" UNIQUE ("slug", "branch_id")`
    );
    await queryRunner.query(
      `ALTER TABLE "brands" ADD CONSTRAINT "UQ_9708b19a4817823e782ac398be8" UNIQUE ("name", "branch_id")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "brands" DROP CONSTRAINT "UQ_9708b19a4817823e782ac398be8"`
    );
    await queryRunner.query(
      `ALTER TABLE "brands" DROP CONSTRAINT "UQ_c3e5fd9b3ffd48320937993786d"`
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "UQ_6c961be921970fb907afba8eece"`
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "UQ_ff837076541de5cfe88f1601f9d"`
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "UQ_d41b1da4fa1a7cc98df9e223a93"`
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "UQ_4a4d05351ce1db14799d976476b"`
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "UQ_fb93d78059ff4f270e6814376d0"`
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_5f641129265a386fc2908ce554"`);
    await queryRunner.query(
      `ALTER TABLE "brands" ADD CONSTRAINT "UQ_b15428f362be2200922952dc268" UNIQUE ("slug")`
    );
    await queryRunner.query(
      `ALTER TABLE "brands" ADD CONSTRAINT "UQ_96db6bbbaa6f23cad26871339b6" UNIQUE ("name")`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "UQ_c44ac33a05b144dd0d9ddcf9327" UNIQUE ("sku")`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "UQ_464f927ae360106b783ed0b4106" UNIQUE ("slug")`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "UQ_4c9fb58de893725258746385e16" UNIQUE ("name")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5f641129265a386fc2908ce554" ON "products" ("name", "sku") `
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09" UNIQUE ("slug")`
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name")`
    );
  }
}
