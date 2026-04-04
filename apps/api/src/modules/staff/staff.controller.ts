import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile, UseInterceptors } from '@nestjs/common';
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
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { ReqAuthUser } from '../../common/decorators/req-auth-user.decorator';
import { AuthUser } from '../../common/types/auth-user.interface';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@Controller({ path: 'staff', version: '1' })
@UseGuards(PermissionGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @RequirePermission('staff.create')
  @UseInterceptors(FileInterceptor('photo'))
  create(
    @Body() createStaffDto: CreateStaffDto,
    @UploadedFile() file?: Express.Multer.File,
    @ReqAuthUser() authUser?: AuthUser
  ) {
    return this.staffService.create(createStaffDto, file, authUser);
  }

  @Get()
  @RequirePermission('staff.view')
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.staffService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20
    );
  }

  @Get(':id')
  @RequirePermission('staff.view')
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('staff.edit')
  @UseInterceptors(FileInterceptor('photo'))
  update(
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
    @UploadedFile() file?: Express.Multer.File,
    @ReqAuthUser() authUser?: AuthUser
  ) {
    return this.staffService.update(id, updateStaffDto, file, authUser);
  }

  @Delete(':id')
  @RequirePermission('staff.delete')
  remove(@Param('id') id: string, @ReqAuthUser() authUser?: AuthUser) {
    return this.staffService.remove(id, authUser);
  }
}
