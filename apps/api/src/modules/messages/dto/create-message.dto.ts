import { IsString, IsNotEmpty, IsEmail, IsOptional, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  subject: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
