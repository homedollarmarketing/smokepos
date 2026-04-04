import { IsOptional, IsEnum, IsString, IsNumber, IsDateString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceType, BookingStatus } from '../entities/service-booking.entity';

export class AdminCreateServiceBookingDto {
  @IsUUID()
  customerId: string;

  @IsUUID()
  @IsOptional()
  vehicleId?: string;

  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  preferredDate: string;

  @IsString()
  @IsOptional()
  preferredTime?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  estimatedCost?: number;

  @IsString()
  @IsOptional()
  adminNotes?: string;

  @IsString()
  @IsOptional()
  serviceNotes?: string;
}

export class AdminUpdateServiceBookingDto {
  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @IsDateString()
  @IsOptional()
  confirmedDate?: string;

  @IsString()
  @IsOptional()
  confirmedTime?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  estimatedCost?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  actualCost?: number;

  @IsString()
  @IsOptional()
  adminNotes?: string;

  @IsString()
  @IsOptional()
  serviceNotes?: string;
}
