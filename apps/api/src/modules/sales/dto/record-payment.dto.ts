import {
    IsUUID,
    IsNumber,
    IsEnum,
    IsString,
    IsOptional,
    Min,
} from 'class-validator';
import { PaymentMethod } from '../entities/sale-payment.entity';

export class RecordPaymentDto {
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    amount: number;

    @IsEnum(PaymentMethod)
    method: PaymentMethod;

    @IsOptional()
    @IsString()
    reference?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}
