import { Branch } from '../../../core/services/auth.service';
import { Role } from '../../roles/services/roles.service';

// Re-using Role from roles service or defining a subset
// We might need a shared User type too, but for now defining what we need

export interface StaffUser {
    id: string;
    email: string;
    isActive: boolean;
    lastLogin?: string;
}

export interface Staff {
    id: string;
    firstName: string;
    lastName: string;
    primaryPhoneNumber?: string;
    secondaryPhoneNumber?: string;
    photoUrl?: string;
    user: StaffUser;
    roles: Role[];
    assignedBranches: Branch[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateStaffDto {
    firstName: string;
    lastName: string;
    email: string;
    password?: string; // Optional if we auto-gen, but usually required
    phone?: string;
    roles?: string[]; // array of slugs
    branchIds?: string[];
    isActive?: boolean;
}

export interface UpdateStaffDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    phone?: string;
    roles?: string[];
    branchIds?: string[];
    isActive?: boolean;
}
