import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BranchesService } from './branches.service';
import { CreateBranchDto, UpdateBranchDto } from './dto';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('Branches')
@Controller({ path: 'branches', version: '1' })
@ApiBearerAuth()
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @RequirePermission('branch.create')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Create a new branch' })
  async create(@Body() dto: CreateBranchDto) {
    return this.branchesService.create(dto);
  }

  @Get()
  @RequirePermission('branch.view')
  @ApiOperation({ summary: 'Get all branches' })
  async findAll() {
    return this.branchesService.findAll();
  }

  @Get(':id')
  @RequirePermission('branch.view')
  @ApiOperation({ summary: 'Get a branch by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.branchesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('branch.edit')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Update a branch' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBranchDto,
  ) {
    return this.branchesService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('branch.delete')
  @ApiOperation({ summary: 'Delete a branch' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.branchesService.remove(id);
  }
}
