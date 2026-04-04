import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { VehiclesService } from '../services/vehicles.service';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { ReqAuthUser } from '../../../common/decorators/req-auth-user.decorator';

@ApiTags('Customer Profile')
@Controller({ path: 'customers/me', version: '1' })
@ApiBearerAuth()
export class CustomerAccountController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get('vehicles')
  @ApiOperation({ summary: 'List my vehicles' })
  async getMyVehicles(@ReqAuthUser('customerId') customerId: string | null) {
    if (!customerId) {
      throw new ForbiddenException('Customer not found');
    }
    return this.vehiclesService.findAllByCustomer(customerId);
  }

  @Post('vehicles')
  @ApiOperation({ summary: 'Add a vehicle to my profile' })
  async addVehicle(
    @ReqAuthUser('customerId') customerId: string | null,
    @Body() createVehicleDto: CreateVehicleDto
  ) {
    if (!customerId) {
      throw new ForbiddenException('Customer not found');
    }
    return this.vehiclesService.create(customerId, createVehicleDto);
  }

  @Patch('vehicles/:id')
  @ApiOperation({ summary: 'Update one of my vehicles' })
  async updateVehicle(
    @ReqAuthUser('customerId') customerId: string | null,
    @Param('id', ParseUUIDPipe) vehicleId: string,
    @Body() updateVehicleDto: UpdateVehicleDto
  ) {
    if (!customerId) {
      throw new ForbiddenException('Customer not found');
    }

    const vehicle = await this.vehiclesService.findOne(vehicleId);
    if (vehicle.customerId !== customerId) {
      throw new ForbiddenException('You do not own this vehicle');
    }

    return this.vehiclesService.update(vehicleId, updateVehicleDto);
  }

  @Delete('vehicles/:id')
  @ApiOperation({ summary: 'Delete one of my vehicles' })
  async deleteVehicle(
    @ReqAuthUser('customerId') customerId: string | null,
    @Param('id', ParseUUIDPipe) vehicleId: string
  ) {
    if (!customerId) {
      throw new ForbiddenException('Customer not found');
    }

    const vehicle = await this.vehiclesService.findOne(vehicleId);
    if (vehicle.customerId !== customerId) {
      throw new ForbiddenException('You do not own this vehicle');
    }

    return this.vehiclesService.remove(vehicleId);
  }
}
