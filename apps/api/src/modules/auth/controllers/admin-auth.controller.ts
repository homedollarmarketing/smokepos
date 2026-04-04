import { Controller, Post, Get, Body, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

import { AdminAuthService } from '../services/admin-auth.service';
import { LoginDto } from '../dtos/login.dto';
import { VerifyOtpDto } from '../dtos/verify-otp.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { ReqAuthUser } from '../../../common/decorators/req-auth-user.decorator';
import { AuthUser } from '../../../common/types/auth-user.interface';

@ApiTags('Admin Auth')
@Controller({ path: 'auth/admins', version: '1' })
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate admin login with email/password, sends OTP' })
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.adminAuthService.initiateLogin(loginDto, ipAddress);
  }

  @Post('verify-otp')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP to complete admin login' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.adminAuthService.verifyOtp(verifyOtpDto, ipAddress, userAgent);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.adminAuthService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and invalidate session' })
  async logout(@ReqAuthUser() authUser: AuthUser, @Body() body: { refreshToken?: string }) {
    return this.adminAuthService.logout(authUser, body.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current admin profile with permissions' })
  async getProfile(@ReqAuthUser('id') userId: string) {
    return this.adminAuthService.getProfile(userId);
  }
}
