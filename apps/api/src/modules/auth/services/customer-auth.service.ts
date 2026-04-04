import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../entities/user.entity';
import { OTP, OTPType } from '../entities/otp.entity';
import { Session } from '../entities/session.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { EnvService } from '../../../config/env.config';
import { EmailService } from '../../shared/services/email.service';
import { SignupDto } from '../dtos/signup.dto';
import { VerifyEmailDto } from '../dtos/verify-email.dto';
import { CustomerLoginDto } from '../dtos/customer-login.dto';
import { VerifyLoginOtpDto } from '../dtos/verify-login-otp.dto';
import { ResendOtpDto } from '../dtos/resend-otp.dto';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { ChangePasswordDto } from '../dtos/change-password.dto';

@Injectable()
export class CustomerAuthService {
  private readonly logger = new Logger(CustomerAuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OTP)
    private readonly otpRepository: Repository<OTP>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    private readonly jwtService: JwtService,
    private readonly envService: EnvService,
    private readonly emailService: EmailService,
    private readonly dataSource: DataSource
  ) {}

  /**
   * Register a new customer account
   * Creates User + Customer records, sends verification email
   */
  async signup(signupDto: SignupDto) {
    const { name, phoneNumber, email, password, confirmPassword } = signupDto;

    // Validate password match
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and customer in transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get main branch for site signups
      const mainBranch = await queryRunner.manager.findOne(Branch, {
        where: { isMain: true },
      });

      // Create user
      const user = queryRunner.manager.create(User, {
        email: email.toLowerCase(),
        hashedPassword,
        accountType: 'customer',
        emailVerified: false,
        isActive: true,
      });
      await queryRunner.manager.save(user);

      // Create customer profile (assigned to main branch)
      const customer = queryRunner.manager.create(Customer, {
        userAccountId: user.id,
        name,
        phoneNumber,
        email: email.toLowerCase(),
        branchId: mainBranch?.id || null,
        photoUrl: `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(name)}`,
      });

      await queryRunner.manager.save(customer);

      // Generate verification OTP
      const otpCode = this.generateOTP();
      const verificationToken = uuidv4();
      const expiresAt = new Date(Date.now() + this.envService.get('OTP_EXPIRES_IN'));

      const otp = queryRunner.manager.create(OTP, {
        userId: user.id,
        token: otpCode,
        verificationToken, // Used as verification token
        type: OTPType.EMAIL_VERIFICATION,
        expiresAt,
      });
      await queryRunner.manager.save(otp);

      await queryRunner.commitTransaction();

      // Send verification email
      await this.emailService.sendOTP({
        to: user.email,
        otp: otpCode,
        type: 'email_verification',
      });

      this.logger.log(`New customer registered: ${user.email}`);

      return {
        message: 'Account created successfully. Please verify your email.',
        email: user.email,
        verificationToken,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Verify email with OTP and automatically log in the user
   */
  async verifyEmail(verifyEmailDto: VerifyEmailDto, ipAddress?: string, userAgent?: string) {
    const { verificationToken, otp } = verifyEmailDto;

    // Find OTP
    const otpRecord = await this.otpRepository.findOne({
      where: {
        verificationToken,
        type: OTPType.EMAIL_VERIFICATION,
      },
      relations: ['user'],
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired verification session');
    }

    if (otpRecord.usedAt) {
      throw new BadRequestException('OTP already used');
    }

    if (otpRecord.token !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (otpRecord.expiresAt < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    const user = otpRecord.user;

    if (user.emailVerified) {
      return { message: 'Email already verified' };
    }

    // Mark OTP as used and verify email
    otpRecord.usedAt = new Date();
    await this.otpRepository.save(otpRecord);

    user.emailVerified = true;
    await this.userRepository.save(user);

    this.logger.log(`Email verified for: ${user.email}`);

    // Get customer profile
    const customer = await this.customerRepository.findOne({
      where: { userAccountId: user.id },
    });

    if (!customer) {
      throw new BadRequestException('Customer profile not found');
    }

    // Create session for auto-login
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

    // Generate access token with customerId
    const accessToken = this.generateAccessToken(user, customer.id);

    // Return tokens and customer data (same format as login)
    return {
      accessToken,
      refreshToken,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
      },
    };
  }

  /**
   * Resend verification OTP
   */
  async resendVerificationOtp(resendOtpDto: ResendOtpDto) {
    const { email } = resendOtpDto;

    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, a verification code has been sent' };
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Invalidate existing OTPs (optional logic change: update all previous to used)
    await this.otpRepository.update(
      { userId: user.id, type: OTPType.EMAIL_VERIFICATION, usedAt: undefined },
      { usedAt: new Date() }
    );

    // Generate new OTP
    const otpCode = this.generateOTP();
    const verificationToken = uuidv4();
    const expiresAt = new Date(Date.now() + this.envService.get('OTP_EXPIRES_IN'));

    const otp = this.otpRepository.create({
      userId: user.id,
      token: otpCode,
      verificationToken,
      type: OTPType.EMAIL_VERIFICATION,
      expiresAt,
    });
    await this.otpRepository.save(otp);

    // Send email
    await this.emailService.sendOTP({
      to: user.email,
      otp: otpCode,
      type: 'email_verification',
    });

    // Return token so frontend can verify
    return {
      message: 'Verification code sent',
      verificationToken,
    };
  }

  /**
   * Initiate login: validate credentials, send 2FA OTP
   */
  async initiateLogin(loginDto: CustomerLoginDto, ipAddress?: string) {
    const { email, password } = loginDto;

    // Find user with password
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.hashedPassword')
      .where('user.email = :email', { email: email.toLowerCase() })
      .andWhere('user.accountType = :type', { type: 'customer' })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate login OTP
    const otpCode = this.generateOTP();
    const verificationToken = uuidv4();
    const expiresAt = new Date(Date.now() + this.envService.get('OTP_EXPIRES_IN'));

    // Invalidate any existing login OTPs
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

    this.logger.log(`Login OTP sent to ${user.email}`);

    return {
      verificationToken,
      message: 'Verification code sent to your email',
    };
  }

  /**
   * Verify login OTP and create session
   */
  async verifyLoginOtp(verifyOtpDto: VerifyLoginOtpDto, ipAddress?: string, userAgent?: string) {
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

    // Get customer profile
    const customer = await this.customerRepository.findOne({
      where: { userAccountId: user.id },
    });

    if (!customer) {
      throw new UnauthorizedException('Customer profile not found');
    }

    // Create session
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

    // Generate access token with customerId
    const accessToken = this.generateAccessToken(user, customer.id);

    return {
      accessToken,
      refreshToken,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
      },
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshTokenValue: string) {
    const session = await this.sessionRepository.findOne({
      where: { refreshToken: refreshTokenValue },
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

    // Get customerId for customer accounts
    let customerId: string | undefined;
    if (user.accountType === 'customer') {
      const customer = await this.customerRepository.findOne({
        where: { userAccountId: user.id },
        select: ['id'],
      });
      customerId = customer?.id;
    }

    // Generate new tokens with customerId
    const newAccessToken = this.generateAccessToken(user, customerId);
    const newRefreshToken = uuidv4();
    const newExpiresAt = this.parseExpiresIn(this.envService.get('JWT_REFRESH_EXPIRES_IN'));

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
   */
  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.sessionRepository.delete({ userId, refreshToken });
    } else {
      await this.sessionRepository.delete({ userId });
    }

    return { message: 'Logged out successfully' };
  }

  /**
   * Get customer profile
   */
  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const customer = await this.customerRepository.findOne({
      where: { userAccountId: userId },
    });

    if (!customer) {
      throw new UnauthorizedException('Customer profile not found');
    }

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      address: customer.address,
      photoUrl: customer.photoUrl,
    };
  }

  /**
   * Update customer profile (name, phone, address)
   */
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const customer = await this.customerRepository.findOne({
      where: { userAccountId: userId },
    });

    if (!customer) {
      throw new UnauthorizedException('Customer profile not found');
    }

    // Update only provided fields
    if (updateProfileDto.name !== undefined) {
      customer.name = updateProfileDto.name;
    }
    if (updateProfileDto.phoneNumber !== undefined) {
      customer.phoneNumber = updateProfileDto.phoneNumber;
    }
    if (updateProfileDto.address !== undefined) {
      customer.address = updateProfileDto.address;
    }

    await this.customerRepository.save(customer);

    this.logger.log(`Profile updated for customer: ${customer.id}`);

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      address: customer.address,
      photoUrl: customer.photoUrl,
    };
  }

  /**
   * Change customer password
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.hashedPassword);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash and save new password
    user.hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    this.logger.log(`Password changed for user: ${user.id}`);

    return { message: 'Password changed successfully' };
  }

  /**
   * Update customer profile photo URL
   */
  async updatePhotoUrl(userId: string, photoUrl: string) {
    const customer = await this.customerRepository.findOne({
      where: { userAccountId: userId },
    });

    if (!customer) {
      throw new UnauthorizedException('Customer profile not found');
    }

    customer.photoUrl = photoUrl;
    await this.customerRepository.save(customer);

    this.logger.log(`Profile photo updated for customer: ${customer.id}`);

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      address: customer.address,
      photoUrl: customer.photoUrl,
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

  private generateAccessToken(user: User, customerId?: string): string {
    const payload: Record<string, any> = {
      sub: user.id,
      email: user.email,
      accountType: user.accountType,
    };

    // Include customerId in token for customer accounts
    if (customerId) {
      payload.customerId = customerId;
    }

    return this.jwtService.sign(payload);
  }

  private parseExpiresIn(expiresIn: string): Date {
    const now = Date.now();
    const match = expiresIn.match(/^(\d+)([smhd])$/);

    if (!match) {
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
