import { IsOptional, IsUUID, IsEnum, IsDateString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
import { StockAdjustmentType } from '../entities/stock-adjustment.entity';

export class StockAdjustmentsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsEnum(StockAdjustmentType)
  adjustmentType?: StockAdjustmentType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
