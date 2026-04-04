import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { SalePayment } from './entities/sale-payment.entity';
import { Product } from '../products/entities/product.entity';
import { Branch } from '../branches/entities/branch.entity';
import { Customer } from '../customers/entities/customer.entity';
import { SalesService } from './services/sales.service';
import { SalesPaymentsService } from './services/sales-payments.service';
import { SalesController } from './controllers/sales.controller';
import { SalesPaymentsController } from './controllers/sales-payments.controller';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { Staff } from '../staff/entities/staff.entity';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sale, SaleItem, SalePayment, Product, Branch, Customer, Staff]),
    AuditLogsModule,
    ProductsModule,
  ],
  controllers: [SalesPaymentsController, SalesController],
  providers: [SalesService, SalesPaymentsService],
  exports: [SalesService],
})
export class SalesModule {}
