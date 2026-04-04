import { IsNotEmpty, IsString, Length, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
    @ApiProperty({ example: 'uuid-verification-token', description: 'Verification token received from signup' })
    @IsNotEmpty()
    @IsUUID()
    verificationToken: string;

    @ApiProperty({ example: '123456', description: '6-digit verification code' })
    @IsNotEmpty()
    @IsString()
    @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
    otp: string;
}
