import { IsString, IsOptional, IsBoolean, IsEmail, MaxLength, ValidateIf } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @IsOptional()
  @ValidateIf((o) => o.email !== '' && o.email != null)
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isMain?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  accentColor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  txtOnAccentColor?: string;
}
