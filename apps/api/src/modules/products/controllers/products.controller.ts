import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ReqAuthUser } from '../../../common/decorators/req-auth-user.decorator';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { AuthUser } from '../../../common/types/auth-user.interface';
import { ProductsService } from '../services/products.service';
import { StockAdjustmentsService } from '../services/stock-adjustments.service';
import { CreateProductDto, UpdateProductDto, UpdateStockDto } from '../dtos/product.dto';
import { ScopedQueryDto } from '../dtos/scoped-query.dto';
import { StockAdjustmentsQueryDto } from '../dtos/stock-adjustments-query.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

@Controller({ path: 'products', version: '1' })
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly stockAdjustmentsService: StockAdjustmentsService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 10))
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files?: Express.Multer.File[],
    @ReqAuthUser() authUser?: AuthUser
  ) {
    return this.productsService.create(createProductDto, files, authUser);
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(@Query() query: ScopedQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get('stock-adjustments/all')
  @UseGuards(PermissionGuard)
  @RequirePermission('product.view')
  @UsePipes(new ValidationPipe({ transform: true }))
  getAllStockAdjustments(@Query() query: StockAdjustmentsQueryDto) {
    return this.stockAdjustmentsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 10))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files?: Express.Multer.File[],
    @ReqAuthUser() authUser?: AuthUser
  ) {
    return this.productsService.update(id, updateProductDto, files, authUser);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @ReqAuthUser() authUser?: AuthUser) {
    return this.productsService.remove(id, authUser);
  }

  @Patch(':id/stock')
  @UseGuards(PermissionGuard)
  @RequirePermission('inventory.adjust')
  updateStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStockDto: UpdateStockDto,
    @ReqAuthUser() authUser?: AuthUser
  ) {
    return this.productsService.updateStock(id, updateStockDto, authUser);
  }

  @Get(':id/stock-adjustments')
  @UseGuards(PermissionGuard)
  @RequirePermission('product.view')
  @UsePipes(new ValidationPipe({ transform: true }))
  getStockAdjustments(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.stockAdjustmentsService.findByProduct(id, query);
  }
}
