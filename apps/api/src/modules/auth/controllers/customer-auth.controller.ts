import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

import { CustomerAuthService } from '../services/customer-auth.service';
import { StorageService } from '../../shared/services/storage.service';
import { SignupDto } from '../dtos/signup.dto';
import { VerifyEmailDto } from '../dtos/verify-email.dto';
import { CustomerLoginDto } from '../dtos/customer-login.dto';
import { VerifyLoginOtpDto } from '../dtos/verify-login-otp.dto';
import { ResendOtpDto } from '../dtos/resend-otp.dto';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { ReqAuthUser } from '../../../common/decorators/req-auth-user.decorator';

@ApiTags('Customer Auth')
@Controller({ path: 'auth/customers', version: '1' })
export class CustomerAuthController {
  constructor(
    private readonly customerAuthService: CustomerAuthService,
    private readonly storageService: StorageService
  ) {}

  @Post('signup')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new customer account' })
  async signup(@Body() signupDto: SignupDto) {
    return this.customerAuthService.signup(signupDto);
  }

  @Post('verify-email')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email with 6-digit OTP and auto-login' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.customerAuthService.verifyEmail(verifyEmailDto, ipAddress, userAgent);
  }

  @Post('resend-verification')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend email verification OTP' })
  async resendVerification(@Body() resendOtpDto: ResendOtpDto) {
    return this.customerAuthService.resendVerificationOtp(resendOtpDto);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate login with email/password, sends 2FA OTP' })
  async login(@Body() loginDto: CustomerLoginDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.customerAuthService.initiateLogin(loginDto, ipAddress);
  }

  @Post('verify-login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify 2FA OTP to complete login' })
  async verifyLogin(@Body() verifyOtpDto: VerifyLoginOtpDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.customerAuthService.verifyLoginOtp(verifyOtpDto, ipAddress, userAgent);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() body: { refreshToken: string }) {
    return this.customerAuthService.refreshToken(body.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and invalidate session' })
  async logout(@ReqAuthUser('id') userId: string | null, @Body() body: { refreshToken?: string }) {
    if (!userId) {
      throw new ForbiddenException('Authentication required');
    }
    return this.customerAuthService.logout(userId, body.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current customer profile' })
  async getProfile(@ReqAuthUser('id') userId: string | null) {
    if (!userId) {
      throw new ForbiddenException('Authentication required');
    }
    return this.customerAuthService.getProfile(userId);
  }

  @Patch('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update customer profile (name, phone, address)' })
  async updateProfile(
    @ReqAuthUser('id') userId: string | null,
    @Body() updateProfileDto: UpdateProfileDto
  ) {
    if (!userId) {
      throw new ForbiddenException('Authentication required');
    }
    return this.customerAuthService.updateProfile(userId, updateProfileDto);
  }

  @Post('me/change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change customer password' })
  async changePassword(
    @ReqAuthUser('id') userId: string | null,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    if (!userId) {
      throw new ForbiddenException('Authentication required');
    }
    return this.customerAuthService.changePassword(userId, changePasswordDto);
  }

  @Post('me/photo')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
          return callback(new BadRequestException('Only image files are allowed'), false);
        }
        callback(null, true);
      },
    })
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Profile photo (max 2MB, JPEG/PNG/GIF/WebP)',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload customer profile photo' })
  async uploadPhoto(
    @ReqAuthUser('id') userId: string | null,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!userId) {
      throw new ForbiddenException('Authentication required');
    }
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const photoUrl = await this.storageService.uploadImageFile(file, 'customer-photos');
    return this.customerAuthService.updatePhotoUrl(userId, photoUrl);
  }
}
