import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ForbiddenException,
} from '@nestjs/common';

import { OrdersService } from './orders.service';
import { OrdersQueryDto } from './dto/orders-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { RecordOrderPaymentDto } from './dto/record-order-payment.dto';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { ReqAuthUser } from '../../common/decorators/req-auth-user.decorator';

@Controller({ path: 'orders', version: '1' })
@UseGuards(PermissionGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @RequirePermission('order.view')
  findAll(@Query() query: OrdersQueryDto) {
    return this.ordersService.findAll(query);
  }

  /**
   * Get pending orders count for sidebar badge
   */
  @Get('stats')
  @RequirePermission('order.view')
  getPendingCount() {
    return this.ordersService.getPendingCount();
  }

  @Get(':id')
  @RequirePermission('order.view')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @RequirePermission('order.edit')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
    @ReqAuthUser('staffId') staffId?: string | null
  ) {
    if (!staffId) {
      throw new ForbiddenException('Staff not found');
    }
    return this.ordersService.updateStatus(id, dto.status, staffId);
  }

  @Post(':id/cancel')
  @RequirePermission('order.edit')
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelOrderDto,
    @ReqAuthUser('staffId') staffId?: string | null
  ) {
    if (!staffId) {
      throw new ForbiddenException('Staff not found');
    }
    return this.ordersService.cancelByStaff(id, dto.reason, staffId);
  }

  @Post(':id/payments')
  @RequirePermission('order.edit')
  recordPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RecordOrderPaymentDto,
    @ReqAuthUser('staffId') staffId?: string | null
  ) {
    if (!staffId) {
      throw new ForbiddenException('Staff not found');
    }
    return this.ordersService.recordPayment(id, dto, staffId);
  }

  @Patch(':id/payments/:paymentId/confirm')
  @RequirePermission('order.edit')
  confirmPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
    @ReqAuthUser('staffId') staffId?: string | null
  ) {
    if (!staffId) {
      throw new ForbiddenException('Staff not found');
    }
    return this.ordersService.confirmPayment(id, paymentId, staffId);
  }

  @Patch(':id/payments/:paymentId/deny')
  @RequirePermission('order.edit')
  denyPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
    @ReqAuthUser('staffId') staffId?: string | null
  ) {
    if (!staffId) {
      throw new ForbiddenException('Staff not found');
    }
    return this.ordersService.denyPayment(id, paymentId, staffId);
  }
}
