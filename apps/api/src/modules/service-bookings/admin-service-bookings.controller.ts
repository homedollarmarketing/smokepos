import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminServiceBookingsService } from './admin-service-bookings.service';
import {
  AdminCreateServiceBookingDto,
  AdminUpdateServiceBookingDto,
} from './dto/admin-service-booking.dto';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { BookingStatus } from './entities/service-booking.entity';

@ApiTags('Admin Service Bookings')
@Controller({ path: 'service-bookings', version: '1' })
@ApiBearerAuth()
@UseGuards(PermissionGuard)
export class AdminServiceBookingsController {
  constructor(private readonly bookingsService: AdminServiceBookingsService) {}

  @Get()
  @RequirePermission('serviceBooking.view')
  @ApiOperation({ summary: 'Get all service bookings for a branch' })
  @ApiQuery({ name: 'branchId', required: true })
  @ApiQuery({ name: 'status', required: false, enum: BookingStatus })
  @ApiQuery({ name: 'customerId', required: false })
  findAll(
    @Query('branchId', ParseUUIDPipe) branchId: string,
    @Query() query: PaginationQueryDto & { status?: BookingStatus; customerId?: string }
  ) {
    return this.bookingsService.findAll(branchId, query);
  }

  @Get('stats')
  @RequirePermission('serviceBooking.view')
  @ApiOperation({ summary: 'Get service booking stats for badge' })
  @ApiQuery({ name: 'branchId', required: true })
  getStats(@Query('branchId', ParseUUIDPipe) branchId: string) {
    return this.bookingsService.getStats(branchId);
  }

  @Get(':id')
  @RequirePermission('serviceBooking.view')
  @ApiOperation({ summary: 'Get a specific service booking' })
  @ApiQuery({ name: 'branchId', required: true })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('branchId', ParseUUIDPipe) branchId: string
  ) {
    return this.bookingsService.findOne(id, branchId);
  }

  @Post()
  @RequirePermission('serviceBooking.create')
  @ApiOperation({ summary: 'Create a new service booking' })
  @ApiQuery({ name: 'branchId', required: true })
  create(
    @Query('branchId', ParseUUIDPipe) branchId: string,
    @Body() dto: AdminCreateServiceBookingDto
  ) {
    return this.bookingsService.create(branchId, dto);
  }

  @Patch(':id')
  @RequirePermission('serviceBooking.edit')
  @ApiOperation({ summary: 'Update a service booking' })
  @ApiQuery({ name: 'branchId', required: true })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('branchId', ParseUUIDPipe) branchId: string,
    @Body() dto: AdminUpdateServiceBookingDto
  ) {
    return this.bookingsService.update(id, branchId, dto);
  }

  @Delete(':id')
  @RequirePermission('serviceBooking.delete')
  @ApiOperation({ summary: 'Delete a service booking' })
  @ApiQuery({ name: 'branchId', required: true })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('branchId', ParseUUIDPipe) branchId: string
  ) {
    return this.bookingsService.remove(id, branchId);
  }
}
