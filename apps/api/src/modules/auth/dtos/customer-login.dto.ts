import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CustomerLoginDto {
    @ApiProperty({ example: 'customer@example.com' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'SecurePass123!' })
    @IsNotEmpty()
    @IsString()
    password: string;
}
