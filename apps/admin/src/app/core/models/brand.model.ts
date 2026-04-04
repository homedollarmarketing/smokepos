export interface Brand {
    id: string;
    name: string;
    description?: string;
    logoUrl?: string;
    isActive: boolean;
    branchId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateBrandDto {
    name: string;
    description?: string;
    logoUrl?: string;
    isActive?: boolean;
    branchId: string;
}

export interface UpdateBrandDto extends Partial<CreateBrandDto> { }
