import { IsEnum, IsOptional, IsString, IsIn } from 'class-validator';
import { PaymentStatus } from '../entities/sale-payment.entity';

export class PaymentApprovalDto {
  @IsEnum(PaymentStatus)
  @IsIn([PaymentStatus.CONFIRMED, PaymentStatus.DENIED], {
    message: 'Status must be either confirmed or denied',
  })
  status: PaymentStatus.CONFIRMED | PaymentStatus.DENIED;

  @IsOptional()
  @IsString()
  notes?: string;
}
