import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
import { PaymentStatus } from '../entities/sale-payment.entity';

export class PaymentsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsUUID()
  branchId?: string;
}
