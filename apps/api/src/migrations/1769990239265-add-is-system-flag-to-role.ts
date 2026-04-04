import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsSystemFlagToRole1769990239265 implements MigrationInterface {
  name = 'AddIsSystemFlagToRole1769990239265';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "staff_roles" ADD "is_system" boolean NOT NULL DEFAULT false`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "staff_roles" DROP COLUMN "is_system"`);
  }
}
