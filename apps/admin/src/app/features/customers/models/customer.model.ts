/**
 * Vehicle interface - represents a customer's vehicle
 */
export interface Vehicle {
  id: string;
  customerId: string;
  brandId: string | null;
  name: string;
  color: string | null;
  numberPlate: string | null;
  vinNumber: string | null;
  year: number;
  brand?: {
    id: string;
    name: string;
    logoUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Customer interface
 */
export interface Customer {
  id: string;
  userAccountId: string | null;
  name: string;
  phoneNumber: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  photoUrl: string | null;
  branchId: string | null;
  branch?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  vehicles?: Vehicle[];
  user?: {
    id: string;
    email: string;
    isActive: boolean;
    lastLogin?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for creating a customer
 */
export interface CreateCustomerDto {
  name: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  notes?: string;
  branchId?: string;
}

/**
 * DTO for updating a customer
 */
export interface UpdateCustomerDto {
  name?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  notes?: string;
  branchId?: string;
}

/**
 * DTO for creating a vehicle
 */
export interface CreateVehicleDto {
  name: string;
  year: number;
  brandId?: string;
  color?: string;
  numberPlate?: string;
  vinNumber?: string;
}

/**
 * DTO for updating a vehicle
 */
export interface UpdateVehicleDto {
  name?: string;
  year?: number;
  brandId?: string;
  color?: string;
  numberPlate?: string;
  vinNumber?: string;
}
