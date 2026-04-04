import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Vehicle } from '../entities/vehicle.entity';
import { Customer } from '../entities/customer.entity';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
    constructor(
        @InjectRepository(Vehicle)
        private readonly vehicleRepository: Repository<Vehicle>,
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
    ) { }

    async create(customerId: string, createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
        // Verify customer exists
        const customer = await this.customerRepository.findOne({
            where: { id: customerId },
        });

        if (!customer) {
            throw new NotFoundException(`Customer with ID "${customerId}" not found`);
        }

        const vehicle = this.vehicleRepository.create({
            ...createVehicleDto,
            customerId,
        });

        return this.vehicleRepository.save(vehicle);
    }

    async findAllByCustomer(customerId: string): Promise<Vehicle[]> {
        return this.vehicleRepository.find({
            where: { customerId },
            relations: ['brand'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Vehicle> {
        const vehicle = await this.vehicleRepository.findOne({
            where: { id },
            relations: ['brand', 'customer'],
        });

        if (!vehicle) {
            throw new NotFoundException(`Vehicle with ID "${id}" not found`);
        }

        return vehicle;
    }

    async update(id: string, updateVehicleDto: UpdateVehicleDto): Promise<Vehicle> {
        const vehicle = await this.findOne(id);
        Object.assign(vehicle, updateVehicleDto);
        return this.vehicleRepository.save(vehicle);
    }

    async remove(id: string): Promise<void> {
        const vehicle = await this.findOne(id);
        await this.vehicleRepository.remove(vehicle);
    }
}
