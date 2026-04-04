import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceBooking, BookingStatus } from './entities/service-booking.entity';
import { Branch } from '../branches/entities/branch.entity';
import { CreateServiceBookingDto } from './dto/create-service-booking.dto';

@Injectable()
export class ServiceBookingsService {
  constructor(
    @InjectRepository(ServiceBooking)
    private readonly bookingRepository: Repository<ServiceBooking>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>
  ) {}

  private async getMainBranchId(): Promise<string> {
    const mainBranch = await this.branchRepository.findOne({
      where: { isMain: true, isActive: true },
    });
    if (!mainBranch) {
      throw new NotFoundException('Main branch not configured');
    }
    return mainBranch.id;
  }

  /**
   * Create a new service booking for a customer
   */
  async createForCustomer(
    customerId: string,
    dto: CreateServiceBookingDto
  ): Promise<ServiceBooking> {
    const branchId = await this.getMainBranchId();

    const booking = this.bookingRepository.create({
      customerId,
      branchId,
      serviceType: dto.serviceType,
      vehicleId: dto.vehicleId || null,
      preferredDate: new Date(dto.preferredDate),
      preferredTime: dto.preferredTime || null,
      description: dto.description || null,
      serviceNotes: dto.serviceNotes || null,
      status: BookingStatus.PENDING,
    });

    return this.bookingRepository.save(booking);
  }

  /**
   * Get all bookings for a customer
   */
  async findAllByCustomer(customerId: string): Promise<ServiceBooking[]> {
    return this.bookingRepository.find({
      where: { customerId },
      relations: ['vehicle', 'vehicle.brand'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get a single booking for a customer
   */
  async findOneForCustomer(id: string, customerId: string): Promise<ServiceBooking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['vehicle', 'vehicle.brand'],
    });

    if (!booking) {
      throw new NotFoundException('Service booking not found');
    }

    if (booking.customerId !== customerId) {
      throw new ForbiddenException('You do not have access to this booking');
    }

    return booking;
  }

  /**
   * Cancel a booking for a customer
   */
  async cancelForCustomer(id: string, customerId: string): Promise<ServiceBooking> {
    const booking = await this.findOneForCustomer(id, customerId);

    if (
      booking.status === BookingStatus.COMPLETED ||
      booking.status === BookingStatus.IN_PROGRESS
    ) {
      throw new ForbiddenException('Cannot cancel a booking that is in progress or completed');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new ForbiddenException('Booking is already cancelled');
    }

    booking.status = BookingStatus.CANCELLED;
    return this.bookingRepository.save(booking);
  }
}
