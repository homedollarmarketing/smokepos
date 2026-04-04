import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateCategoryDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    image?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsUUID()
    @IsNotEmpty()
    branchId: string;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) { }

export class CategoryResponseDto {
    id: string;
    name: string;
    description: string;
    image: string;
    isActive: boolean;
    branchId: string;
    createdAt: Date;
    updatedAt: Date;
}
