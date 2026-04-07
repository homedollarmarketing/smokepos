export interface BranchModel {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phoneNumber: string | null;
  email: string | null;
  isActive: boolean;
  isMain: boolean;
  accentColor: string;
  txtOnAccentColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBranchDto {
  name: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  isActive?: boolean;
  isMain?: boolean;
  accentColor?: string;
  txtOnAccentColor?: string;
}

export interface UpdateBranchDto extends Partial<CreateBranchDto> {}
