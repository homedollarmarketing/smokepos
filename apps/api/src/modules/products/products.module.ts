import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { StockAdjustment } from './entities/stock-adjustment.entity';
import { BrandsController } from './controllers/brands.controller';
import { CategoriesController } from './controllers/categories.controller';
import { ProductsController } from './controllers/products.controller';
import { BrandsService } from './services/brands.service';
import { CategoriesService } from './services/categories.service';
import { ProductsService } from './services/products.service';
import { StockAdjustmentsService } from './services/stock-adjustments.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Brand, Category, Product, StockAdjustment]),
        AuditLogsModule,
    ],
    controllers: [BrandsController, CategoriesController, ProductsController],
    providers: [BrandsService, CategoriesService, ProductsService, StockAdjustmentsService],
    exports: [BrandsService, CategoriesService, ProductsService, StockAdjustmentsService],
})
export class ProductsModule { }
