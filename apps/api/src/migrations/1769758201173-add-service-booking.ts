import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServiceBooking1769758201173 implements MigrationInterface {
  name = 'AddServiceBooking1769758201173';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."service_bookings_service_type_enum" AS ENUM('maintenance', 'repair', 'diagnostic', 'oil_change', 'brake_service', 'tire_service', 'electrical', 'engine', 'transmission', 'suspension', 'other')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."service_bookings_status_enum" AS ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')`
    );
    await queryRunner.query(
      `CREATE TABLE "service_bookings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customer_id" uuid NOT NULL, "vehicle_id" uuid, "branch_id" uuid NOT NULL, "service_type" "public"."service_bookings_service_type_enum" NOT NULL DEFAULT 'maintenance', "description" text, "preferred_date" date NOT NULL, "preferred_time" character varying(10), "status" "public"."service_bookings_status_enum" NOT NULL DEFAULT 'pending', "admin_notes" text, "estimated_cost" numeric(12,2), "actual_cost" numeric(12,2), "confirmed_date" date, "confirmed_time" character varying(10), "completed_at" TIMESTAMP, "service_notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2a5ef9f3eb208896d1e1b9b2a7b" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "service_bookings" ADD CONSTRAINT "FK_b24262d603131f617bac1500cf0" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "service_bookings" ADD CONSTRAINT "FK_f8fb10c11c75e1a298c02fbed3e" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "service_bookings" ADD CONSTRAINT "FK_ea3b5dd2330610fbedd6d5b6e45" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_bookings" DROP CONSTRAINT "FK_ea3b5dd2330610fbedd6d5b6e45"`
    );
    await queryRunner.query(
      `ALTER TABLE "service_bookings" DROP CONSTRAINT "FK_f8fb10c11c75e1a298c02fbed3e"`
    );
    await queryRunner.query(
      `ALTER TABLE "service_bookings" DROP CONSTRAINT "FK_b24262d603131f617bac1500cf0"`
    );
    await queryRunner.query(`DROP TABLE "service_bookings"`);
    await queryRunner.query(`DROP TYPE "public"."service_bookings_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."service_bookings_service_type_enum"`);
  }
}
