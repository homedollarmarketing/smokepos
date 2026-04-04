import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateBrandDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    logoUrl?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsUUID()
    @IsNotEmpty()
    branchId: string;
}

export class UpdateBrandDto extends PartialType(CreateBrandDto) { }

export class BrandResponseDto {
    id: string;
    name: string;
    description: string;
    logoUrl: string;
    isActive: boolean;
    branchId: string;
    createdAt: Date;
    updatedAt: Date;
}
