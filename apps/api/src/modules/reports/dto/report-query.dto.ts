import { IsDateString, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class ReportQueryDto {
  @IsUUID()
  branchId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
