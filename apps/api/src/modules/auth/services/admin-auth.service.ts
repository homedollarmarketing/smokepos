import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../entities/user.entity';
import { OTP, OTPType } from '../entities/otp.entity';
import { Session } from '../entities/session.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { EnvService } from '../../../config/env.config';
import { EmailService } from '../../shared/services/email.service';
import { LoginDto } from '../dtos/login.dto';
import { VerifyOtpDto } from '../dtos/verify-otp.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';
import { AuthUser } from '../../../common/types/auth-user.interface';

@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger(AdminAuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OTP)
    private readonly otpRepository: Repository<OTP>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    private readonly jwtService: JwtService,
    private readonly envService: EnvService,
    private readonly emailService: EmailService,
    private readonly dataSource: DataSource,
    private readonly auditLogsService: AuditLogsService
  ) {}

  /**
   * Initiate login: validate credentials, generate OTP, send email
   * Returns loginToken for client to use in OTP verification
   */
  async initiateLogin(loginDto: LoginDto, ipAddress?: string) {
    const { email, password } = loginDto;

    // Find user with password
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.hashedPassword')
      .where('user.email = :email', { email: email.toLowerCase() })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Only admin/staff accounts can log in via this flow
    if (user.accountType !== 'admin') {
      throw new UnauthorizedException('Invalid account type for this login');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate OTP
    const otpCode = this.generateOTP();
    const verificationToken = uuidv4();
    const expiresAt = new Date(Date.now() + this.envService.get('OTP_EXPIRES_IN'));

    // Invalidate any existing OTPs for this user
    await this.otpRepository.update(
      { userId: user.id, type: OTPType.LOGIN, usedAt: undefined },
      { usedAt: new Date() }
    );

    // Create new OTP
    const otp = this.otpRepository.create({
      userId: user.id,
      token: otpCode,
      verificationToken,
      type: OTPType.LOGIN,
      expiresAt,
      ipAddress,
    });

    await this.otpRepository.save(otp);

    // Send OTP via email
    await this.emailService.sendOTP({
      to: user.email,
      otp: otpCode,
      type: 'login',
    });

    this.logger.log(`OTP sent to ${user.email}`);

    return {
      verificationToken,
      message: 'OTP sent to your email',
    };
  }

  /**
   * Verify OTP and create session
   * Returns access token, refresh token, user data with permissions and branches
   */
  async verifyOtp(verifyOtpDto: VerifyOtpDto, ipAddress?: string, userAgent?: string) {
    const { verificationToken, otp } = verifyOtpDto;

    // Find OTP by verificationToken
    const otpRecord = await this.otpRepository.findOne({
      where: { verificationToken, type: OTPType.LOGIN },
      relations: ['user'],
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired login session');
    }

    if (otpRecord.usedAt) {
      throw new BadRequestException('OTP already used');
    }

    if (otpRecord.expiresAt < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    if (otpRecord.token !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    const user = otpRecord.user;

    // Mark OTP as used
    otpRecord.usedAt = new Date();
    await this.otpRepository.save(otpRecord);

    // Get staff profile with roles and branches
    const staff = await this.dataSource.getRepository(Staff).findOne({
      where: { userAccountId: user.id },
      relations: ['roles', 'assignedBranches'],
    });

    if (!staff) {
      throw new UnauthorizedException('Staff profile not found');
    }

    // Collect all permissions from roles
    const permissions: string[] = [];
    staff.roles.forEach((role) => {
      permissions.push(...role.permissions);
    });
    const uniquePermissions = [...new Set(permissions)];

    // Create session with refresh token
    const refreshToken = uuidv4();
    const refreshExpiresAt = this.parseExpiresIn(this.envService.get('JWT_REFRESH_EXPIRES_IN'));

    const session = this.sessionRepository.create({
      userId: user.id,
      refreshToken,
      expiresAt: refreshExpiresAt,
      ipAddress,
      userAgent,
    });
    await this.sessionRepository.save(session);

    // Generate access token with staffId
    const accessToken = this.generateAccessToken(user, staff.id);

    // Log successful login
    if (staff) {
      await this.auditLogsService.logAction({
        staffId: staff.id,
        action: 'LOGIN',
        entity: 'auth',
        entityId: user.id,
        description: `User ${user.email} logged in`,
        ipAddress,
        userAgent,
      });
    }

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: staff.firstName,
        lastName: staff.lastName,
        accountType: user.accountType,
      },
      permissions: uniquePermissions,
      branches: staff.assignedBranches.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        isMain: b.isMain,
      })),
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    const session = await this.sessionRepository.findOne({
      where: { refreshToken },
      relations: ['user'],
    });

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (session.expiresAt < new Date()) {
      await this.sessionRepository.remove(session);
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = session.user;

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Get staffId for admin users
    let staffId: string | undefined;
    if (user.accountType === 'admin') {
      const staff = await this.dataSource.getRepository(Staff).findOne({
        where: { userAccountId: user.id },
        select: ['id'],
      });
      staffId = staff?.id;
    }

    // Generate new tokens
    const newAccessToken = this.generateAccessToken(user, staffId);
    const newRefreshToken = uuidv4();
    const newExpiresAt = this.parseExpiresIn(this.envService.get('JWT_REFRESH_EXPIRES_IN'));

    // Update session
    session.refreshToken = newRefreshToken;
    session.expiresAt = newExpiresAt;
    await this.sessionRepository.save(session);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout - invalidate session
   * @param authUser - The authenticated user (contains both userId and staffId)
   * @param refreshToken - Optional specific refresh token to invalidate
   */
  async logout(authUser: AuthUser, refreshToken?: string) {
    const { id: userId, staffId } = authUser;

    if (refreshToken) {
      await this.sessionRepository.delete({ userId, refreshToken });
    } else {
      // Logout from all sessions
      await this.sessionRepository.delete({ userId });
    }

    // Log logout (only if staffId is available)
    if (staffId) {
      await this.auditLogsService.logAction({
        staffId,
        action: 'LOGOUT',
        entity: 'auth',
        entityId: userId,
        description: 'User logged out',
      });
    }

    return { message: 'Logged out successfully' };
  }

  /**
   * Get current user profile with permissions and branches
   */
  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const staff = await this.dataSource.getRepository(Staff).findOne({
      where: { userAccountId: userId },
      relations: ['roles', 'assignedBranches'],
    });

    if (!staff) {
      throw new UnauthorizedException('Staff profile not found');
    }

    const permissions: string[] = [];
    staff.roles.forEach((role) => {
      permissions.push(...role.permissions);
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: staff.firstName,
        lastName: staff.lastName,
        accountType: user.accountType,
      },
      permissions: [...new Set(permissions)],
      branches: staff.assignedBranches.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        isMain: b.isMain,
      })),
    };
  }

  // --- Helper Methods ---

  private generateOTP(): string {
    const length = this.envService.get('OTP_LENGTH');
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10).toString();
    }
    return otp;
  }

  private generateAccessToken(user: User, staffId?: string): string {
    const payload: Record<string, any> = {
      sub: user.id,
      email: user.email,
      accountType: user.accountType,
    };

    // Include staffId in token for admin users
    if (staffId) {
      payload.staffId = staffId;
    }

    return this.jwtService.sign(payload);
  }

  private parseExpiresIn(expiresIn: string): Date {
    const now = Date.now();
    const match = expiresIn.match(/^(\d+)([smhd])$/);

    if (!match) {
      // Default to 7 days if format is invalid
      return new Date(now + 7 * 24 * 60 * 60 * 1000);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    let ms: number;
    switch (unit) {
      case 's':
        ms = value * 1000;
        break;
      case 'm':
        ms = value * 60 * 1000;
        break;
      case 'h':
        ms = value * 60 * 60 * 1000;
        break;
      case 'd':
        ms = value * 24 * 60 * 60 * 1000;
        break;
      default:
        ms = 7 * 24 * 60 * 60 * 1000;
    }

    return new Date(now + ms);
  }
}
