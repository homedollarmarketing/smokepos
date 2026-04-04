import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../entities/brand.entity';
import { CreateBrandDto, UpdateBrandDto } from '../dtos/brand.dto';
import { ScopedQueryDto } from '../dtos/scoped-query.dto';
import { StorageService } from '../../shared/services/storage.service';
import { generateSlug } from '../../../common/utils/slug.util';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';
import { AuthUser } from '../../../common/types/auth-user.interface';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private brandsRepository: Repository<Brand>,
    private readonly storageService: StorageService,
    private readonly auditLogsService: AuditLogsService
  ) {}

  async create(
    createBrandDto: CreateBrandDto,
    file?: Express.Multer.File,
    authUser?: AuthUser
  ): Promise<Brand> {
    if (!authUser?.staffId) {
      throw new UnauthorizedException('Staff identification required to create brands');
    }

    if (file) {
      createBrandDto.logoUrl = await this.storageService.uploadImageFile(file, 'brands');
    }
    // Auto-generate slug from name
    const slug = generateSlug(createBrandDto.name);
    const brand = this.brandsRepository.create({ ...createBrandDto, slug });
    const savedBrand = await this.brandsRepository.save(brand);

    if (authUser?.staffId) {
      await this.auditLogsService.logAction({
        staffId: authUser.staffId,
        action: 'CREATE',
        entity: 'brand',
        entityId: savedBrand.id,
        description: `Created brand "${savedBrand.name}"`,
      });
    }

    return savedBrand;
  }

  async findAll(query: ScopedQueryDto) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const qb = this.brandsRepository.createQueryBuilder('brand');

    // Branch filter
    if (query.branchId) {
      qb.andWhere('brand.branchId = :branchId', { branchId: query.branchId });
    }

    // Active status filter
    if (query.isActive !== undefined) {
      const isActive = query.isActive === 'true';
      qb.andWhere('brand.isActive = :isActive', { isActive });
    }

    // Search filter (name or description)
    if (query.search) {
      qb.andWhere('(brand.name ILIKE :search OR brand.description ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    // Ordering and pagination
    qb.orderBy('brand.name', 'ASC').skip(skip).take(limit);

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

  async findOne(id: string): Promise<Brand> {
    const brand = await this.brandsRepository.findOne({ where: { id } });
    if (!brand) throw new NotFoundException(`Brand with ID ${id} not found`);
    return brand;
  }

  async update(
    id: string,
    updateBrandDto: UpdateBrandDto,
    file?: Express.Multer.File,
    authUser?: AuthUser
  ): Promise<Brand> {
    if (!authUser?.staffId) {
      throw new UnauthorizedException('Staff identification required to update brands');
    }

    const brand = await this.findOne(id);
    if (file) {
      updateBrandDto.logoUrl = await this.storageService.uploadImageFile(file, 'brands');
    }
    Object.assign(brand, updateBrandDto);
    const savedBrand = await this.brandsRepository.save(brand);

    if (authUser?.staffId) {
      await this.auditLogsService.logAction({
        staffId: authUser.staffId,
        action: 'UPDATE',
        entity: 'brand',
        entityId: savedBrand.id,
        description: `Updated brand "${savedBrand.name}"`,
      });
    }

    return savedBrand;
  }

  async remove(id: string, authUser?: AuthUser): Promise<void> {
    if (!authUser?.staffId) {
      throw new UnauthorizedException('Staff identification required to delete brands');
    }

    const brand = await this.findOne(id);
    await this.brandsRepository.remove(brand);

    if (authUser?.staffId) {
      await this.auditLogsService.logAction({
        staffId: authUser.staffId,
        action: 'DELETE',
        entity: 'brand',
        entityId: id,
        description: `Deleted brand${brand.name ? ` "${brand.name}"` : ''}`,
      });
    }
  }
}
