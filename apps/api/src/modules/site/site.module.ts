import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteController } from './site.controller';
import { SiteOrdersController } from './site-orders.controller';
import { SiteWishlistController } from './site-wishlist.controller';
import { SiteService } from './site.service';
import { Product } from '../products/entities/product.entity';
import { Category } from '../products/entities/category.entity';
import { Brand } from '../products/entities/brand.entity';
import { Branch } from '../branches/entities/branch.entity';
import { OrdersModule } from '../orders/orders.module';
import { CustomersModule } from '../customers/customers.module';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category, Brand, Branch]),
    OrdersModule,
    CustomersModule,
    MessagesModule,
  ],
  controllers: [SiteController, SiteOrdersController, SiteWishlistController],
  providers: [SiteService],
  exports: [SiteService],
})
export class SiteModule {}
