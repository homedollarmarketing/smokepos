import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceBooking, BookingStatus } from './entities/service-booking.entity';
import {
  AdminCreateServiceBookingDto,
  AdminUpdateServiceBookingDto,
} from './dto/admin-service-booking.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@Injectable()
export class AdminServiceBookingsService {
  constructor(
    @InjectRepository(ServiceBooking)
    private readonly bookingRepository: Repository<ServiceBooking>
  ) {}

  /**
   * Get paginated list of service bookings for a branch
   */
  async findAll(
    branchId: string,
    query: PaginationQueryDto & { status?: BookingStatus; customerId?: string }
  ) {
    const { page = 1, limit = 20, status, customerId } = query;

    const qb = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('booking.vehicle', 'vehicle')
      .leftJoinAndSelect('vehicle.brand', 'brand')
      .where('booking.branchId = :branchId', { branchId })
      .orderBy('booking.createdAt', 'DESC');

    if (status) {
      qb.andWhere('booking.status = :status', { status });
    }

    if (customerId) {
      qb.andWhere('booking.customerId = :customerId', { customerId });
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

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

  /**
   * Get a single booking by ID for a branch
   */
  async findOne(id: string, branchId: string): Promise<ServiceBooking> {
    const booking = await this.bookingRepository.findOne({
      where: { id, branchId },
      relations: ['customer', 'vehicle', 'vehicle.brand', 'branch'],
    });

    if (!booking) {
      throw new NotFoundException('Service booking not found');
    }

    return booking;
  }

  /**
   * Create a new service booking (admin initiated)
   */
  async create(branchId: string, dto: AdminCreateServiceBookingDto): Promise<ServiceBooking> {
    const booking = this.bookingRepository.create({
      branchId,
      customerId: dto.customerId,
      vehicleId: dto.vehicleId || null,
      serviceType: dto.serviceType,
      description: dto.description || null,
      preferredDate: new Date(dto.preferredDate),
      preferredTime: dto.preferredTime || null,
      estimatedCost: dto.estimatedCost || null,
      adminNotes: dto.adminNotes || null,
      status: BookingStatus.PENDING,
    });

    return this.bookingRepository.save(booking);
  }

  /**
   * Update a service booking
   */
  async update(
    id: string,
    branchId: string,
    dto: AdminUpdateServiceBookingDto
  ): Promise<ServiceBooking> {
    const booking = await this.findOne(id, branchId);

    if (dto.status !== undefined) {
      booking.status = dto.status;
      // If completed, set completedAt
      if (dto.status === BookingStatus.COMPLETED && !booking.completedAt) {
        booking.completedAt = new Date();
      }
    }

    if (dto.confirmedDate !== undefined) {
      booking.confirmedDate = dto.confirmedDate ? new Date(dto.confirmedDate) : null;
    }

    if (dto.confirmedTime !== undefined) {
      booking.confirmedTime = dto.confirmedTime || null;
    }

    if (dto.estimatedCost !== undefined) {
      booking.estimatedCost = dto.estimatedCost;
    }

    if (dto.actualCost !== undefined) {
      booking.actualCost = dto.actualCost;
    }

    if (dto.adminNotes !== undefined) {
      booking.adminNotes = dto.adminNotes || null;
    }

    if (dto.serviceNotes !== undefined) {
      booking.serviceNotes = dto.serviceNotes || null;
    }

    return this.bookingRepository.save(booking);
  }

  /**
   * Get stats for badge count
   */
  async getStats(branchId: string): Promise<{ pending: number; today: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pending = await this.bookingRepository.count({
      where: { branchId, status: BookingStatus.PENDING },
    });

    const todayCount = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.branchId = :branchId', { branchId })
      .andWhere('booking.preferredDate = :today', { today: today.toISOString().split('T')[0] })
      .andWhere('booking.status NOT IN (:...statuses)', {
        statuses: [BookingStatus.CANCELLED, BookingStatus.COMPLETED],
      })
      .getCount();

    return { pending, today: todayCount };
  }

  /**
   * Delete a service booking
   */
  async remove(id: string, branchId: string): Promise<void> {
    const booking = await this.findOne(id, branchId);
    await this.bookingRepository.remove(booking);
  }
}
