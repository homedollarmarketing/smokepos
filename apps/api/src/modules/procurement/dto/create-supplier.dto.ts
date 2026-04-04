import { IsString, IsOptional, IsEmail, IsUUID, MaxLength, IsBoolean } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  contactPerson?: string;

  @IsUUID()
  branchId: string;
}
