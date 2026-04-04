import { IsOptional, IsUUID, IsString, IsEnum } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
import { PurchaseOrderStatus } from '../entities/purchase-order.entity';

export class PurchaseOrdersQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @IsOptional()
  @IsEnum(PurchaseOrderStatus)
  status?: PurchaseOrderStatus;

  @IsOptional()
  @IsString()
  search?: string;
}
