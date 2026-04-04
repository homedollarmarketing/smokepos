import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Like,
  FindOptionsWhere,
  MoreThanOrEqual,
  LessThanOrEqual,
  Between,
} from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto, UpdateProductDto, UpdateStockDto } from '../dtos/product.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
import { PaginatedResultDto } from '../dtos/pagination-response.dto';
import { ScopedQueryDto } from '../dtos/scoped-query.dto';
import { generateSlug } from '../../../common/utils/slug.util';
import { StorageService } from '../../shared/services/storage.service';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';
import { AuthUser } from '../../../common/types/auth-user.interface';
import { StockAdjustmentsService } from './stock-adjustments.service';
import { StockAdjustmentType } from '../entities/stock-adjustment.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly storageService: StorageService,
    private readonly auditLogsService: AuditLogsService,
    private readonly stockAdjustmentsService: StockAdjustmentsService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    files?: Express.Multer.File[],
    authUser?: AuthUser
  ): Promise<Product> {
    if (!authUser?.staffId) {
      throw new UnauthorizedException('Staff identification required to create products');
    }

    // Upload images if provided
    let images: string[] = [];
    if (files && files.length > 0) {
      images = await Promise.all(
        files.map((file) => this.storageService.uploadImageFile(file, 'products'))
      );
    }

    // Default costPrice to price if not provided
    if (createProductDto.costPrice === undefined || createProductDto.costPrice === null) {
      createProductDto.costPrice = createProductDto.price;
    }

    // Auto-generate slug from name
    const slug = generateSlug(createProductDto.name);
    const product = this.productRepository.create({ ...createProductDto, slug, images });
    const savedProduct = await this.productRepository.save(product);

    if (authUser?.staffId) {
      await this.auditLogsService.logAction({
        staffId: authUser.staffId,
        action: 'CREATE',
        entity: 'product',
        entityId: savedProduct.id,
        description: `Created product "${savedProduct.name}"`,
      });
    }

    return savedProduct;
  }

  async findAll(query: ScopedQueryDto): Promise<PaginatedResultDto<Product>> {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.category', 'category');

    // Branch filter
    if (query.branchId) {
      qb.andWhere('product.branchId = :branchId', { branchId: query.branchId });
    }

    // Active status filter
    if (query.isActive !== undefined) {
      const isActive = query.isActive === 'true';
      qb.andWhere('product.isActive = :isActive', { isActive });
    }

    // Brand filter
    if (query.brandId) {
      qb.andWhere('product.brandId = :brandId', { brandId: query.brandId });
    }

    // Category filter
    if (query.categoryId) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId: query.categoryId });
    }

    // Price range filter
    if (query.minPrice) {
      qb.andWhere('product.price >= :minPrice', { minPrice: parseFloat(query.minPrice) });
    }
    if (query.maxPrice) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice: parseFloat(query.maxPrice) });
    }

    // Stock status filter
    if (query.stockStatus) {
      switch (query.stockStatus) {
        case 'out_of_stock':
          qb.andWhere('product.quantity = 0');
          break;
        case 'low_stock':
          qb.andWhere('product.quantity > 0 AND product.quantity <= product.lowStockThreshold');
          break;
        case 'in_stock':
          qb.andWhere('product.quantity > product.lowStockThreshold');
          break;
      }
    }

    // Search filter (name or SKU)
    if (query.search) {
      qb.andWhere('(product.name ILIKE :search OR product.sku ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    // Ordering and pagination
    qb.orderBy('product.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['brand', 'category'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    files?: Express.Multer.File[],
    authUser?: AuthUser
  ): Promise<Product> {
    if (!authUser?.staffId) {
      throw new UnauthorizedException('Staff identification required to update products');
    }

    const product = await this.findOne(id);

    // Upload new images if provided
    if (files && files.length > 0) {
      const newImages = await Promise.all(
        files.map((file) => this.storageService.uploadImageFile(file, 'products'))
      );
      // Replace existing images with new ones
      product.images = newImages;
    }

    Object.assign(product, updateProductDto);
    const savedProduct = await this.productRepository.save(product);

    if (authUser?.staffId) {
      await this.auditLogsService.logAction({
        staffId: authUser.staffId,
        action: 'UPDATE',
        entity: 'product',
        entityId: savedProduct.id,
        description: `Updated product "${savedProduct.name}"`,
      });
    }

    return savedProduct;
  }

  async remove(id: string, authUser?: AuthUser): Promise<void> {
    if (!authUser?.staffId) {
      throw new UnauthorizedException('Staff identification required to delete products');
    }

    const product = await this.findOne(id);
    await this.productRepository.remove(product);

    if (authUser?.staffId) {
      await this.auditLogsService.logAction({
        staffId: authUser.staffId,
        action: 'DELETE',
        entity: 'product',
        entityId: id,
        description: `Deleted product${product.name ? ` "${product.name}"` : ''}`,
      });
    }
  }

  async updateStock(
    id: string,
    updateStockDto: UpdateStockDto,
    authUser?: AuthUser
  ): Promise<Product> {
    if (!authUser?.staffId) {
      throw new UnauthorizedException('Staff identification required to adjust stock');
    }

    const product = await this.findOne(id);
    const previousQuantity = product.quantity;
    const previousCostPrice = product.costPrice;
    product.quantity = updateStockDto.quantity;

    // Allow optional cost price update on manual adjustment
    if (updateStockDto.costPrice !== undefined) {
      product.costPrice = updateStockDto.costPrice;
    }

    const savedProduct = await this.productRepository.save(product);

    // Create stock adjustment record
    const quantityChange = updateStockDto.quantity - previousQuantity;
    await this.stockAdjustmentsService.createAdjustment({
      productId: savedProduct.id,
      branchId: savedProduct.branchId,
      adjustmentType: StockAdjustmentType.MANUAL,
      quantityChange,
      previousQuantity,
      newQuantity: savedProduct.quantity,
      unitCost: savedProduct.costPrice,
      previousCostPrice,
      newCostPrice: savedProduct.costPrice,
      reason: updateStockDto.reason || null,
      staffId: authUser.staffId,
    });

    await this.auditLogsService.logAction({
      staffId: authUser.staffId,
      action: 'UPDATE',
      entity: 'product',
      entityId: savedProduct.id,
      description: `Adjusted stock for "${savedProduct.name}" from ${previousQuantity} to ${updateStockDto.quantity}${updateStockDto.reason ? ` - Reason: ${updateStockDto.reason}` : ''}`,
    });

    return savedProduct;
  }
}
