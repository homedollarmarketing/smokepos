import { IsOptional, IsString, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
import { ExpenseStatus, ExpenseCategory } from '../entities/expense.entity';

export class ExpensesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ExpenseStatus)
  status?: ExpenseStatus;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsEnum(ExpenseCategory)
  category?: ExpenseCategory;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
