import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendOtpDto {
    @ApiProperty({ example: 'customer@example.com' })
    @IsNotEmpty()
    @IsEmail()
    email: string;
}
