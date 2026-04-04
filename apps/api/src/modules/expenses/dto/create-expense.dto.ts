import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsUUID,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExpenseCategory } from '../entities/expense.entity';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount: number;

  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @IsDateString()
  expenseDate: string;

  @IsUUID()
  branchId: string;

  @IsOptional()
  @IsUUID()
  staffId?: string;
}
