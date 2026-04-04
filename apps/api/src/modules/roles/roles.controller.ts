import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ReqAuthUser } from '../../common/decorators/req-auth-user.decorator';
import { AuthUser } from '../../common/types/auth-user.interface';

import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@Controller({ path: 'roles', version: '1' })
@UseGuards(PermissionGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @RequirePermission('role.create')
  create(@Body() createRoleDto: CreateRoleDto, @ReqAuthUser() authUser?: AuthUser) {
    return this.rolesService.create(createRoleDto, authUser);
  }

  @Get()
  @RequirePermission('role.view')
  findAll(@Query() query: PaginationQueryDto) {
    return this.rolesService.findAll(query);
  }

  @Get('permissions')
  @RequirePermission('role.view', 'role.create', 'role.edit')
  getPermissions() {
    return this.rolesService.getPermissions();
  }

  @Get(':id')
  @RequirePermission('role.view')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('role.edit')
  update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @ReqAuthUser() authUser?: AuthUser
  ) {
    return this.rolesService.update(id, updateRoleDto, authUser);
  }

  @Delete(':id')
  @RequirePermission('role.delete')
  remove(@Param('id') id: string, @ReqAuthUser() authUser?: AuthUser) {
    return this.rolesService.remove(id, authUser);
  }
}
