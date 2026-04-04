import { IsString, MinLength } from 'class-validator';

export class CancelOrderDto {
  @IsString()
  @MinLength(10, { message: 'Cancellation reason must be at least 10 characters' })
  reason: string;
}
