import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ExpenseStatus } from '../entities/expense.entity';

export class ReviewExpenseDto {
  @IsEnum(ExpenseStatus, {
    message: 'Status must be either approved or rejected',
  })
  @ValidateIf((o) => o.status !== ExpenseStatus.PENDING)
  status: ExpenseStatus.APPROVED | ExpenseStatus.REJECTED;

  @ValidateIf((o) => o.status === ExpenseStatus.REJECTED)
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
