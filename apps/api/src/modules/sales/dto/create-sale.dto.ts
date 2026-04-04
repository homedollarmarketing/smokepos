import {
  IsUUID,
  IsNumber,
  IsString,
  IsOptional,
  ValidateNested,
  Min,
  IsArray,
  ArrayMinSize,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CustomerSource } from '../entities/sale.entity';

export class CreateSaleItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateSalePaymentDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  method: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateSaleDto {
  @IsUUID()
  customerId: string;

  @IsUUID()
  branchId: string;

  @IsOptional()
  @IsEnum(CustomerSource)
  customerSource?: CustomerSource;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateSalePaymentDto)
  initialPayment?: CreateSalePaymentDto;
}
