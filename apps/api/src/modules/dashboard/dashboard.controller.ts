import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@Controller({ path: 'dashboard', version: '1' })
@UseGuards(PermissionGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @RequirePermission('dashboard.view')
  async getStats(@Query('branchId') branchId: string): Promise<DashboardStatsDto> {
    return this.dashboardService.getStats(branchId);
  }
}
