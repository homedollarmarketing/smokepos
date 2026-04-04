import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from './entities/supplier.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { Branch } from '../branches/entities/branch.entity';
import { Product } from '../products/entities/product.entity';
import { SuppliersService } from './services/suppliers.service';
import { PurchaseOrdersService } from './services/purchase-orders.service';
import { PurchaseOrderPdfService } from './services/purchase-order-pdf.service';
import { SuppliersController } from './controllers/suppliers.controller';
import { PurchaseOrdersController } from './controllers/purchase-orders.controller';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Supplier, PurchaseOrder, PurchaseOrderItem, Branch, Product]),
    AuditLogsModule,
    ProductsModule,
  ],
  controllers: [SuppliersController, PurchaseOrdersController],
  providers: [SuppliersService, PurchaseOrdersService, PurchaseOrderPdfService],
  exports: [SuppliersService, PurchaseOrdersService],
})
export class ProcurementModule {}
