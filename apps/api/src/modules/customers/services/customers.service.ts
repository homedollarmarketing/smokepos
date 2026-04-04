import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';

import { Customer } from '../entities/customer.entity';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>
  ) {}

  async create(createCustomerDto: CreateCustomerDto, branchId?: string): Promise<Customer> {
    const customer = this.customerRepository.create({
      ...createCustomerDto,
      branchId: createCustomerDto.branchId || branchId || null,
      userAccountId: null, // Admin-created customers don't have user accounts
    });
    return this.customerRepository.save(customer);
  }

  /**
   * Search customers by name, email, or phone number
   * Returns top N matches for autocomplete
   * Optionally filter by branch
   */
  async search(query: string, limit: number = 10, branchId?: string): Promise<Customer[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const searchTerm = `%${query.trim()}%`;

    const qb = this.customerRepository
      .createQueryBuilder('customer')
      .where(
        '(customer.name ILIKE :search OR customer.email ILIKE :search OR customer.phoneNumber ILIKE :search)',
        { search: searchTerm }
      );

    // Filter by branch if provided
    if (branchId) {
      qb.andWhere('(customer.branchId = :branchId OR customer.branchId IS NULL)', { branchId });
    }

    return qb.orderBy('customer.name', 'ASC').limit(limit).getMany();
  }

  async findAll(page: number = 1, limit: number = 20, branchId?: string) {
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Customer> = {};
    if (branchId) {
      where.branchId = branchId;
    }

    const [data, total] = await this.customerRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
      relations: ['branch', 'vehicles'],
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['vehicles', 'vehicles.brand', 'user', 'branch'],
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID "${id}" not found`);
    }

    return customer;
  }

  async findByUserId(userId: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { userAccountId: userId },
      relations: ['vehicles', 'vehicles.brand'],
    });

    if (!customer) {
      throw new NotFoundException(`Customer profile not found for user "${userId}"`);
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    Object.assign(customer, updateCustomerDto);
    return this.customerRepository.save(customer);
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);
    await this.customerRepository.remove(customer);
  }
}
