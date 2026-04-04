import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Customer } from './entities/customer.entity';
import { Vehicle } from './entities/vehicle.entity';
import { Wishlist } from './entities/wishlist.entity';
import { CustomersService } from './services/customers.service';
import { VehiclesService } from './services/vehicles.service';
import { WishlistService } from './services/wishlist.service';
import { CustomersController } from './controllers/customers.controller';
import { CustomerAccountController } from './controllers/customer-account.controller';
import { Product } from '../products/entities/product.entity';
import { Branch } from '../branches/entities/branch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Vehicle, Wishlist, Product, Branch])],
  controllers: [CustomerAccountController, CustomersController],
  providers: [CustomersService, VehiclesService, WishlistService],
  exports: [TypeOrmModule, CustomersService, VehiclesService, WishlistService],
})
export class CustomersModule {}
