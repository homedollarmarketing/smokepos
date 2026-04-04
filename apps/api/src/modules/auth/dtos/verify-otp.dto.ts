import { IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
    @ApiProperty({ example: 'uuid-verification-token' })
    @IsUUID()
    @IsNotEmpty()
    verificationToken: string;

    @ApiProperty({ example: '123456' })
    @IsString()
    @IsNotEmpty()
    @Length(6, 6)
    otp: string;
}
