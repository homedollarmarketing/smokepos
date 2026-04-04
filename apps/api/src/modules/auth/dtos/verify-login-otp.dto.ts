import { IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyLoginOtpDto {
    @ApiProperty({ description: 'Verification token received from login request' })
    @IsNotEmpty()
    @IsUUID()
    verificationToken: string;

    @ApiProperty({ example: '123456', description: '6-digit verification code' })
    @IsNotEmpty()
    @IsString()
    @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
    otp: string;
}
