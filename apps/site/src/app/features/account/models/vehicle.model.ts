export interface Brand {
    id: string;
    name: string;
    logoUrl?: string;
}

export interface Vehicle {
    id: string;
    customerId: string;
    brandId: string | null;
    name: string;
    color: string | null;
    numberPlate: string | null;
    vinNumber: string | null;
    year: number;
    brand?: Brand;
    createdAt: string;
    updatedAt: string;
}

export interface CreateVehicleDto {
    name: string;
    year: number;
    brandId?: string;
    color?: string;
    numberPlate?: string;
    vinNumber?: string;
}

export interface UpdateVehicleDto {
    name?: string;
    year?: number;
    brandId?: string;
    color?: string;
    numberPlate?: string;
    vinNumber?: string;
}
