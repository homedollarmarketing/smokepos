import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EnvService } from '../../../config/env.config';
import { User } from '../entities/user.entity';
import { AuthUser } from '../../../common/types/auth-user.interface';

/**
 * JWT token payload structure.
 * This matches what is encoded in the JWT token during login.
 */
export interface JwtPayload {
  /** User ID (maps to User.id) */
  sub: string;
  /** User's email address */
  email: string;
  /** Account type: 'admin' or 'customer' */
  accountType: 'admin' | 'customer';
  /** Staff ID - included for admin accounts */
  staffId?: string;
  /** Customer ID - included for customer accounts */
  customerId?: string;
  /** Issued at timestamp */
  iat?: number;
  /** Expiration timestamp */
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly envService: EnvService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: envService.get('JWT_SECRET'),
    });
  }

  /**
   * Validates the JWT payload and returns the AuthUser object.
   * This is called by Passport after the JWT is verified.
   */
  async validate(payload: JwtPayload): Promise<AuthUser> {
    this.logger.debug(
      `Validating JWT for user: ${payload.sub}, accountType: ${payload.accountType}`
    );

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Return AuthUser object with staffId and customerId from token
    // No DB fallback - tokens must include the correct IDs
    return {
      id: payload.sub,
      email: payload.email,
      accountType: payload.accountType,
      staffId: payload.staffId ?? null,
      customerId: payload.customerId ?? null,
    };
  }
}
