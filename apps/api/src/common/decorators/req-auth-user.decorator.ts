import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser, AuthUserKey } from '../types/auth-user.interface';

/**
 * Parameter decorator to extract the authenticated user from the request.
 *
 * The user object is attached to the request by the JWT authentication strategy.
 *
 * Usage:
 * - `@ReqAuthUser() authUser: AuthUser` - Get the full AuthUser object
 * - `@ReqAuthUser('id') userId: string` - Get just the user ID
 * - `@ReqAuthUser('staffId') staffId?: string | null` - Get the staff ID (null for customers)
 * - `@ReqAuthUser('customerId') customerId: string | null` - Get the customer ID (null for admins)
 * - `@ReqAuthUser('email') email: string` - Get the user's email
 * - `@ReqAuthUser('accountType') accountType: 'admin' | 'customer'` - Get the account type
 */
export const ReqAuthUser = createParamDecorator(
  (
    data: AuthUserKey | undefined,
    ctx: ExecutionContext
  ): AuthUser | AuthUser[AuthUserKey] | null => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthUser | undefined;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  }
);
