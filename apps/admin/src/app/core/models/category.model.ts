export interface Category {
    id: string;
    name: string;
    description?: string;
    image?: string;
    isActive: boolean;
    branchId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateCategoryDto {
    name: string;
    description?: string;
    image?: string;
    isActive?: boolean;
    branchId: string;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> { }
