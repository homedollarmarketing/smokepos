import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}

  async findAll() {
    return this.branchRepository.find({
      where: { isActive: true },
      order: { isMain: 'DESC', name: 'ASC' },
    });
  }

  async findOne(id: string) {
    return this.branchRepository.findOne({ where: { id } });
  }
}
