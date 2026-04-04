import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { User } from '../auth/entities/user.entity';
import { StaffRole } from '../roles/entities/role.entity';
import { Branch } from '../branches/entities/branch.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Staff, User, StaffRole, Branch]),
    AuthModule,
  ],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule { }
