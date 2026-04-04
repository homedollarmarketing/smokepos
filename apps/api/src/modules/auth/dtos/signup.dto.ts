import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
    @ApiProperty({ example: 'John Doe', description: 'Customer full name' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ example: '+256700123456', description: 'Phone number' })
    @IsNotEmpty()
    @IsString()
    phoneNumber: string;

    @ApiProperty({ example: 'customer@example.com' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'SecurePass123!', minLength: 8 })
    @IsNotEmpty()
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;

    @ApiProperty({ example: 'SecurePass123!' })
    @IsNotEmpty()
    @IsString()
    confirmPassword: string;
}
