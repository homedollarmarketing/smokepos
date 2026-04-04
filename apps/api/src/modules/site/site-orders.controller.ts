import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ForbiddenException,
} from '@nestjs/common';

import { OrdersService } from '../orders/orders.service';
import { CreateOrderDto } from '../orders/dto/create-order.dto';
import { OrdersQueryDto } from '../orders/dto/orders-query.dto';
import { CancelOrderDto } from '../orders/dto/cancel-order.dto';
import { ReqAuthUser } from '../../common/decorators/req-auth-user.decorator';
import { CustomersService } from '../customers/services/customers.service';

@Controller({ path: 'site/orders', version: '1' })
export class SiteOrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly customersService: CustomersService
  ) {}

  /**
   * Create a new order from cart
   */
  @Post()
  async create(@Body() dto: CreateOrderDto, @ReqAuthUser('customerId') customerId: string | null) {
    if (!customerId) {
      throw new ForbiddenException('Authentication required');
    }

    return this.ordersService.create(dto, customerId);
  }

  /**
   * Get customer's orders
   */
  @Get()
  async findAll(
    @Query() query: OrdersQueryDto,
    @ReqAuthUser('customerId') customerId: string | null
  ) {
    if (!customerId) {
      throw new ForbiddenException('Authentication required');
    }

    return this.ordersService.findAllByCustomer(customerId, query);
  }

  /**
   * Get customer's order stats (for dashboard)
   */
  @Get('stats')
  async getStats(@ReqAuthUser('customerId') customerId: string | null) {
    if (!customerId) {
      throw new ForbiddenException('Authentication required');
    }

    return this.ordersService.getCustomerStats(customerId);
  }

  /**
   * Get a specific order (verify ownership)
   */
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @ReqAuthUser('customerId') customerId: string | null
  ) {
    if (!customerId) {
      throw new ForbiddenException('Authentication required');
    }

    const order = await this.ordersService.findOne(id);

    // Verify ownership
    if (order.customerId !== customerId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return order;
  }

  /**
   * Cancel an order (only PENDING or CONFIRMED)
   */
  @Post(':id/cancel')
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelOrderDto,
    @ReqAuthUser('customerId') customerId: string | null
  ) {
    if (!customerId) {
      throw new ForbiddenException('Authentication required');
    }

    return this.ordersService.cancelByCustomer(id, dto.reason, customerId);
  }

  /**
   * Get customer's saved shipping address
   */
  @Get('profile/shipping-address')
  async getShippingAddress(@ReqAuthUser('customerId') customerId: string | null) {
    if (!customerId) {
      throw new ForbiddenException('Authentication required');
    }

    const customer = await this.customersService.findOne(customerId);
    return { shippingAddress: customer?.shippingAddress || null };
  }
}
