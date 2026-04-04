import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'CurrentPass123!', description: 'Current password' })
  @IsNotEmpty({ message: 'Current password is required' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'NewSecurePass123!', description: 'New password', minLength: 8 })
  @IsNotEmpty({ message: 'New password is required' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  newPassword: string;
}
