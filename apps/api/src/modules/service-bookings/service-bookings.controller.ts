import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  ParseUUIDPipe,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ServiceBookingsService } from './service-bookings.service';
import { CreateServiceBookingDto } from './dto/create-service-booking.dto';
import { ReqAuthUser } from '../../common/decorators/req-auth-user.decorator';

@ApiTags('Customer Service Bookings')
@Controller({ path: 'customers/me/service-bookings', version: '1' })
@ApiBearerAuth()
export class ServiceBookingsController {
  constructor(private readonly bookingsService: ServiceBookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new service booking' })
  async create(
    @ReqAuthUser('customerId') customerId: string | null,
    @Body() dto: CreateServiceBookingDto
  ) {
    if (!customerId) {
      throw new ForbiddenException('Customer not found');
    }
    return this.bookingsService.createForCustomer(customerId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get my service bookings' })
  async findAll(@ReqAuthUser('customerId') customerId: string | null) {
    if (!customerId) {
      throw new ForbiddenException('Customer not found');
    }
    return this.bookingsService.findAllByCustomer(customerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific service booking' })
  async findOne(
    @ReqAuthUser('customerId') customerId: string | null,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    if (!customerId) {
      throw new ForbiddenException('Customer not found');
    }
    return this.bookingsService.findOneForCustomer(id, customerId);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a service booking' })
  async cancel(
    @ReqAuthUser('customerId') customerId: string | null,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    if (!customerId) {
      throw new ForbiddenException('Customer not found');
    }
    return this.bookingsService.cancelForCustomer(id, customerId);
  }
}
