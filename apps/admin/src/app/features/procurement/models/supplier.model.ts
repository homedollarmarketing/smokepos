export interface Supplier {
  id: string;
  code: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  contactPerson: string | null;
  isActive: boolean;
  branchId: string;
  branch?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierDto {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  branchId: string;
}

export interface UpdateSupplierDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  isActive?: boolean;
}

export interface SuppliersQuery {
  page?: number;
  limit?: number;
  branchId?: string;
  isActive?: boolean;
  search?: string;
}
