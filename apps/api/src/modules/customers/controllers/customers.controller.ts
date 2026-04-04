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
  ParseUUIDPipe,
} from '@nestjs/common';
import { CustomersService } from '../services/customers.service';
import { VehiclesService } from '../services/vehicles.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator';

@Controller({ path: 'customers', version: '1' })
@UseGuards(PermissionGuard)
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
    private readonly vehiclesService: VehiclesService
  ) {}

  // ========== Customer CRUD ==========

  @Post()
  @RequirePermission('customer.create')
  create(@Body() createCustomerDto: CreateCustomerDto, @Query('branchId') branchId?: string) {
    return this.customersService.create(createCustomerDto, branchId);
  }

  /**
   * Search customers by name, email, or phone number
   * Used for autocomplete in sale forms
   */
  @Get('search')
  @RequirePermission('customer.view')
  search(
    @Query('q') q: string,
    @Query('limit') limit?: string,
    @Query('branchId') branchId?: string
  ) {
    return this.customersService.search(q, limit ? parseInt(limit, 10) : 10, branchId);
  }

  @Get()
  @RequirePermission('customer.view')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('branchId') branchId?: string
  ) {
    return this.customersService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      branchId
    );
  }

  @Get(':id')
  @RequirePermission('customer.view')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('customer.edit')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @RequirePermission('customer.delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.customersService.remove(id);
  }

  // ========== Vehicle CRUD ==========

  @Get(':customerId/vehicles')
  @RequirePermission('customer.view')
  findVehicles(@Param('customerId', ParseUUIDPipe) customerId: string) {
    return this.vehiclesService.findAllByCustomer(customerId);
  }

  @Post(':customerId/vehicles')
  @RequirePermission('customer.edit')
  createVehicle(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Body() createVehicleDto: CreateVehicleDto
  ) {
    return this.vehiclesService.create(customerId, createVehicleDto);
  }

  @Patch(':customerId/vehicles/:vehicleId')
  @RequirePermission('customer.edit')
  updateVehicle(
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
    @Body() updateVehicleDto: UpdateVehicleDto
  ) {
    return this.vehiclesService.update(vehicleId, updateVehicleDto);
  }

  @Delete(':customerId/vehicles/:vehicleId')
  @RequirePermission('customer.edit')
  removeVehicle(@Param('vehicleId', ParseUUIDPipe) vehicleId: string) {
    return this.vehiclesService.remove(vehicleId);
  }
}
