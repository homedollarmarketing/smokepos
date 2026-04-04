import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { OTP } from './entities/otp.entity';
import { Session } from './entities/session.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Branch } from '../branches/entities/branch.entity';
import { EnvService } from '../../config/env.config';
import { SharedModule } from '../shared/shared.module';
import { AdminAuthService } from './services/admin-auth.service';
import { CustomerAuthService } from './services/customer-auth.service';
import { AdminAuthController } from './controllers/admin-auth.controller';
import { CustomerAuthController } from './controllers/customer-auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, OTP, Session, Customer, Branch]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        secret: envService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: envService.get('JWT_EXPIRES_IN') as any,
        },
      }),
    }),
    SharedModule,
  ],
  controllers: [AdminAuthController, CustomerAuthController],
  providers: [AdminAuthService, CustomerAuthService, JwtStrategy],
  exports: [AdminAuthService, CustomerAuthService, JwtModule],
})
export class AuthModule {}
