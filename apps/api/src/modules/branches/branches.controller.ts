import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BranchesService } from './branches.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@ApiTags('Branches')
@Controller({ path: 'branches', version: '1' })
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active branches' })
  async findAll() {
    return this.branchesService.findAll();
  }
}
