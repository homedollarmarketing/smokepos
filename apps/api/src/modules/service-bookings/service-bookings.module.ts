import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceBooking } from './entities/service-booking.entity';
import { ServiceBookingsService } from './service-bookings.service';
import { ServiceBookingsController } from './service-bookings.controller';
import { AdminServiceBookingsService } from './admin-service-bookings.service';
import { AdminServiceBookingsController } from './admin-service-bookings.controller';
import { Branch } from '../branches/entities/branch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceBooking, Branch])],
  controllers: [ServiceBookingsController, AdminServiceBookingsController],
  providers: [ServiceBookingsService, AdminServiceBookingsService],
  exports: [ServiceBookingsService, AdminServiceBookingsService],
})
export class ServiceBookingsModule {}
