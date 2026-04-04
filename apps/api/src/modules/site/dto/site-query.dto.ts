import { Transform } from 'class-transformer';
import { IsOptional, IsBoolean, IsNumber, IsString } from 'class-validator';

export class SiteProductsQueryDto {
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  page?: number;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 20))
  @IsNumber()
  limit?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsString()
  category?: string; // category slug

  @IsOptional()
  @IsString()
  brand?: string; // brand slug

  @IsOptional()
  @IsString()
  search?: string;
}

export class SiteCategoriesQueryDto {
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  page?: number;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 50))
  @IsNumber()
  limit?: number;
}

export class SiteBrandsQueryDto {
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 50))
  @IsNumber()
  page?: number;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 50))
  @IsNumber()
  limit?: number;
}
