import { IsNumber, IsEnum, IsString, IsOptional, Min } from 'class-validator';
import { OrderPaymentMethod } from '../entities/order-payment.entity';

export class RecordOrderPaymentDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @IsEnum(OrderPaymentMethod)
  method: OrderPaymentMethod;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
