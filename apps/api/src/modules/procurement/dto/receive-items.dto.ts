import { IsArray, ValidateNested, IsUUID, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ReceiveItemDto {
  @IsUUID()
  itemId: string;

  @IsNumber()
  @Min(1)
  quantityReceived: number;
}

export class ReceiveItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiveItemDto)
  items: ReceiveItemDto[];
}
