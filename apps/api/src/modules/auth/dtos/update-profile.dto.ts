import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ example: 'John Doe', description: 'Customer full name', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(200, { message: 'Name must not exceed 200 characters' })
  name?: string;

  @ApiProperty({ example: '+256700123456', description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  @MinLength(9, { message: 'Phone number must be at least 9 characters long' })
  @MaxLength(20, { message: 'Phone number must not exceed 20 characters' })
  phoneNumber?: string;

  @ApiProperty({ example: 'Plot 123, Kampala Road', description: 'Address', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Address must not exceed 500 characters' })
  address?: string;
}
