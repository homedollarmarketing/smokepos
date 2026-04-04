/**
 * Represents the authenticated user extracted from the JWT token.
 * This is attached to the request by the JWT strategy.
 */
export interface AuthUser {
  /** The User entity ID (UUID) */
  id: string;

  /** User's email address */
  email: string;

  /** Type of account: 'admin' for staff/admin users, 'customer' for customer users */
  accountType: 'admin' | 'customer';

  /** Staff ID - only populated for admin accounts, null for customers */
  staffId?: string | null;

  /** Customer ID - only populated for customer accounts, null for admins */
  customerId: string | null;
}

/**
 * Keys that can be extracted from AuthUser using @ReqAuthUser decorator
 */
export type AuthUserKey = keyof AuthUser;
