import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from './entities/branch.entity';

import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';

import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Branch]), AuthModule],
  controllers: [BranchesController],
  providers: [BranchesService],
  exports: [TypeOrmModule, BranchesService],
})
export class BranchesModule {}
