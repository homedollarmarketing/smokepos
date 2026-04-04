import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Staff } from './entities/staff.entity';
import { User } from '../auth/entities/user.entity';
import { StaffRole } from '../roles/entities/role.entity';
import { Branch } from '../branches/entities/branch.entity';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StorageService } from '../shared/services/storage.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuthUser } from '../../common/types/auth-user.interface';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(StaffRole)
    private readonly roleRepository: Repository<StaffRole>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    private readonly dataSource: DataSource,
    private readonly storageService: StorageService,
    private readonly auditLogsService: AuditLogsService
  ) {}

  async create(createStaffDto: CreateStaffDto, file?: Express.Multer.File, authUser?: AuthUser) {
    if (!authUser?.staffId) {
      throw new UnauthorizedException('Staff identification required to create staff members');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if user exists
      const existingUser = await this.userRepository.findOne({
        where: { email: createStaffDto.email },
      });
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Upload Photo if exists
      let photoUrl: string | null = null;
      if (file) {
        photoUrl = await this.storageService.uploadImageFile(file, 'staff-photos');
      }

      // Create User
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(createStaffDto.password, salt);

      const user = this.userRepository.create({
        email: createStaffDto.email,
        hashedPassword,
        accountType: 'admin',
        isActive: createStaffDto.isActive ?? true,
      });
      const savedUser = await queryRunner.manager.save(user);

      // Prepare Roles
      const roleSlugs = [];
      if (createStaffDto.role) roleSlugs.push(createStaffDto.role.toLowerCase());
      if (createStaffDto.roles) roleSlugs.push(...createStaffDto.roles.map((r) => r.toLowerCase()));

      const roles = await this.roleRepository.find({
        where: { slug: In(roleSlugs) },
      });

      // Prepare Branches
      const branchIds = [];
      if (createStaffDto.branchId) branchIds.push(createStaffDto.branchId);
      if (createStaffDto.branchIds) branchIds.push(...createStaffDto.branchIds);

      const branches = await this.branchRepository.find({
        where: { id: In(branchIds) },
      });

      // Create Staff
      const staff = this.staffRepository.create({
        userAccountId: savedUser.id,
        firstName: createStaffDto.firstName,
        lastName: createStaffDto.lastName,
        primaryPhoneNumber: createStaffDto.phone,
        photoUrl,
        roles,
        assignedBranches: branches,
      });

      const savedStaff = await queryRunner.manager.save(staff);

      await queryRunner.commitTransaction();

      if (authUser?.staffId) {
        await this.auditLogsService.logAction({
          staffId: authUser.staffId,
          action: 'CREATE',
          entity: 'staff',
          entityId: savedStaff.id,
          description: `Created staff member "${savedStaff.firstName} ${savedStaff.lastName}"`,
        });
      }

      return this.findOne(savedStaff.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(page: number = 1, limit: number = 20) {
    const [data, total] = await this.staffRepository.findAndCount({
      relations: ['user', 'roles', 'assignedBranches'],
      order: { firstName: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const staff = await this.staffRepository.findOne({
      where: { id },
      relations: ['user', 'roles', 'assignedBranches'],
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    return staff;
  }

  async findByUserId(userId: string) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const staff = await this.staffRepository.findOne({
      where: { userAccountId: userId },
      relations: ['user', 'roles', 'assignedBranches'],
    });

    if (!staff) {
      throw new NotFoundException('Staff not found for this user');
    }

    return staff;
  }

  async update(
    id: string,
    updateStaffDto: UpdateStaffDto,
    file?: Express.Multer.File,
    authUser?: AuthUser
  ) {
    if (!authUser?.staffId) {
      throw new UnauthorizedException('Staff identification required to update staff members');
    }

    const staff = await this.findOne(id);
    const user = staff.user;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update User fields
      if (updateStaffDto.email && updateStaffDto.email !== user.email) {
        const existing = await this.userRepository.findOne({
          where: { email: updateStaffDto.email },
        });
        if (existing && existing.id !== user.id) {
          throw new ConflictException('Email already in use');
        }
        user.email = updateStaffDto.email;
      }

      if (updateStaffDto.password) {
        const salt = await bcrypt.genSalt();
        user.hashedPassword = await bcrypt.hash(updateStaffDto.password, salt);
      }

      if (updateStaffDto.isActive !== undefined) {
        user.isActive = updateStaffDto.isActive;
      }

      await queryRunner.manager.save(user);

      // Update Staff fields
      if (updateStaffDto.firstName) staff.firstName = updateStaffDto.firstName;
      if (updateStaffDto.lastName) staff.lastName = updateStaffDto.lastName;
      if (updateStaffDto.phone) staff.primaryPhoneNumber = updateStaffDto.phone;

      if (file) {
        staff.photoUrl = await this.storageService.uploadImageFile(file, 'staff-photos');
      }

      // Update Roles
      const roleSlugs = [];
      if (updateStaffDto.role) roleSlugs.push(updateStaffDto.role.toLowerCase());
      if (updateStaffDto.roles) roleSlugs.push(...updateStaffDto.roles.map((r) => r.toLowerCase()));

      if (roleSlugs.length > 0) {
        const roles = await this.roleRepository.find({
          where: { slug: In(roleSlugs) },
        });
        staff.roles = roles;
      }

      // Update Branches
      const branchIds = [];
      if (updateStaffDto.branchId) branchIds.push(updateStaffDto.branchId);
      if (updateStaffDto.branchIds) branchIds.push(...updateStaffDto.branchIds);

      if (
        branchIds.length > 0 ||
        updateStaffDto.branchId === '' ||
        (updateStaffDto.branchIds && updateStaffDto.branchIds.length === 0)
      ) {
        const branches = await this.branchRepository.find({
          where: { id: In(branchIds) },
        });
        staff.assignedBranches = branches;
      }

      await queryRunner.manager.save(staff);
      await queryRunner.commitTransaction();

      if (authUser?.staffId) {
        await this.auditLogsService.logAction({
          staffId: authUser.staffId,
          action: 'UPDATE',
          entity: 'staff',
          entityId: id,
          description: `Updated staff member "${staff.firstName} ${staff.lastName}"`,
        });
      }

      return this.findOne(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string, authUser?: AuthUser) {
    if (!authUser?.staffId) {
      throw new UnauthorizedException('Staff identification required to deactivate staff members');
    }

    const staff = await this.findOne(id);
    const user = staff.user;
    user.isActive = false;
    await this.userRepository.save(user);
    await this.userRepository.save(user);

    if (authUser?.staffId) {
      await this.auditLogsService.logAction({
        staffId: authUser.staffId,
        action: 'DELETE',
        entity: 'staff',
        entityId: id,
        description: `Deactivated staff member "${staff.firstName} ${staff.lastName}"`,
      });
    }

    return { message: 'Staff deactivated successfully' };
  }

  /**
   * Find staff members who have a specific permission through their roles
   */
  async findByPermission(permission: string): Promise<Staff[]> {
    const staffMembers = await this.staffRepository.find({
      relations: ['roles', 'user'],
      where: {
        user: {
          isActive: true,
        },
      },
    });

    // Filter staff who have the required permission in any of their roles
    return staffMembers.filter((staff) =>
      staff.roles?.some((role) => role.permissions?.includes(permission))
    );
  }
}
