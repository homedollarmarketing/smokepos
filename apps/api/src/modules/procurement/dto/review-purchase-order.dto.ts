import { IsString, IsOptional } from 'class-validator';

export class RejectPurchaseOrderDto {
  @IsString()
  reason: string;
}

export class ApprovePurchaseOrderDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
