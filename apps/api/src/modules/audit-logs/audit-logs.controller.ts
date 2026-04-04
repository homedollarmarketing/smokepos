import { Controller, Get, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { AuditLogsService, AuditLogQueryDto } from './audit-logs.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller({ path: 'audit-logs', version: '1' })
@UseGuards(AuthGuard, PermissionGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @RequirePermission('auditLog.view')
  @ApiOperation({ summary: 'Get audit logs with pagination and filters' })
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(@Query() query: AuditLogQueryDto) {
    return this.auditLogsService.findAll(query);
  }

  @Get('actions')
  @RequirePermission('auditLog.view')
  @ApiOperation({ summary: 'Get distinct action types' })
  getActionTypes() {
    return this.auditLogsService.getActionTypes();
  }

  @Get('entities')
  @RequirePermission('auditLog.view')
  @ApiOperation({ summary: 'Get distinct entity types' })
  getEntityTypes() {
    return this.auditLogsService.getEntityTypes();
  }
}
