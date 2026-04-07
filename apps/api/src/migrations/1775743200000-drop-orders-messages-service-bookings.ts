import type { MigrationInterface, QueryRunner } from 'typeorm';

export class DropOrdersMessagesServiceBookings1775743200000 implements MigrationInterface {
  name = 'DropOrdersMessagesServiceBookings1775743200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop dependent tables first (foreign key order)
    await queryRunner.query(`DROP TABLE IF EXISTS "order_payments" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "order_items" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "orders" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "messages" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "service_bookings" CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Re-creating these tables is not supported. Restore from backup if needed.
  }
}
