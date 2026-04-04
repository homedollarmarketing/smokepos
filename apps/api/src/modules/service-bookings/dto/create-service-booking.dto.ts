import { IsEnum, IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';
import { ServiceType } from '../entities/service-booking.entity';

export class CreateServiceBookingDto {
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @IsUUID()
  @IsOptional()
  vehicleId?: string;

  @IsDateString()
  preferredDate: string;

  @IsString()
  @IsOptional()
  preferredTime?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  serviceNotes?: string;
}
