import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StaffRole, AllPermissions } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import {
  PaginationQueryDto,
  PaginatedResponse,
  createPaginationMeta,
} from '../../common/dto/pagination.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuthUser } from '../../common/types/auth-user.interface';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(StaffRole)
    private readonly roleRepository: Repository<StaffRole>,
    private readonly auditLogsService: AuditLogsService
  ) {}

  async create(createRoleDto: CreateRoleDto, authUser?: AuthUser) {
    if (!authUser?.staffId) {
      throw new UnauthorizedException('Staff identification required to create roles');
    }

    const existing = await this.roleRepository.findOne({
      where: { slug: createRoleDto.slug },
    });

    if (existing) {
      throw new ConflictException('Role with this slug already exists');
    }

    const role = this.roleRepository.create(createRoleDto);
    const savedRole = await this.roleRepository.save(role);

    if (authUser?.staffId) {
      await this.auditLogsService.logAction({
        staffId: authUser.staffId,
        action: 'CREATE',
        entity: 'role',
        entityId: savedRole.id,
        description: `Created role "${savedRole.name}"`,
      });
    }

    return savedRole;
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResponse<StaffRole>> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.roleRepository.findAndCount({
      order: { name: 'ASC' },
      skip,
      take: limit,
    });

    return {
      data,
      pagination: createPaginationMeta(query, total),
    };
  }

  async findOne(id: string) {
    const role = await this.roleRepository.findOne({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, authUser?: AuthUser) {
    if (!authUser?.staffId) {
      throw new UnauthorizedException('Staff identification required to update roles');
    }

    const role = await this.findOne(id);

    if (updateRoleDto.slug && updateRoleDto.slug !== role.slug) {
      const existing = await this.roleRepository.findOne({
        where: { slug: updateRoleDto.slug },
      });
      if (existing) {
        throw new ConflictException('Role with this slug already exists');
      }
    }

    Object.assign(role, updateRoleDto);
    const savedRole = await this.roleRepository.save(role);

    if (authUser?.staffId) {
      await this.auditLogsService.logAction({
        staffId: authUser.staffId,
        action: 'UPDATE',
        entity: 'role',
        entityId: savedRole.id,
        description: `Updated role "${savedRole.name}"`,
      });
    }

    return savedRole;
  }

  async remove(id: string, authUser?: AuthUser) {
    if (!authUser?.staffId) {
      throw new UnauthorizedException('Staff identification required to delete roles');
    }

    const role = await this.findOne(id);

    if (role.isSystem) {
      throw new ForbiddenException('Cannot delete system role');
    }

    await this.roleRepository.remove(role);

    if (authUser?.staffId) {
      await this.auditLogsService.logAction({
        staffId: authUser.staffId,
        action: 'DELETE',
        entity: 'role',
        entityId: id,
        description: `Deleted role${role.name ? ` "${role.name}"` : ''}`,
      });
    }
  }

  getPermissions() {
    return AllPermissions;
  }
}
