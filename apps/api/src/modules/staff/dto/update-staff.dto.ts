import { PartialType } from '@nestjs/swagger';
import { CreateStaffDto } from './create-staff.dto';
import { IsOptional, IsString, IsArray, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateStaffDto extends PartialType(CreateStaffDto) {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  roles?: string[];

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  branchIds?: string[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
}
