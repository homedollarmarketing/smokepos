import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { CreateBranchDto, UpdateBranchDto } from './dto';
import slugify from 'slugify';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}

  async findAll() {
    return this.branchRepository.find({
      order: { isMain: 'DESC', name: 'ASC' },
    });
  }

  async findOne(id: string) {
    const branch = await this.branchRepository.findOne({ where: { id } });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }
    return branch;
  }

  async create(dto: CreateBranchDto) {
    const slug = await this.generateUniqueSlug(dto.name);

    // If this branch is set as main, unset the current main branch
    if (dto.isMain) {
      await this.unsetCurrentMainBranch();
    }

    const branch = this.branchRepository.create({
      ...dto,
      slug,
    });

    return this.branchRepository.save(branch);
  }

  async update(id: string, dto: UpdateBranchDto) {
    const branch = await this.findOne(id);

    // If name is changing, regenerate slug
    if (dto.name && dto.name !== branch.name) {
      branch.slug = await this.generateUniqueSlug(dto.name, id);
    }

    // If setting this branch as main, unset the current main branch
    if (dto.isMain && !branch.isMain) {
      await this.unsetCurrentMainBranch();
    }

    // Prevent unsetting isMain if this is the only main branch
    if (dto.isMain === false && branch.isMain) {
      throw new BadRequestException(
        'Cannot unset main branch. Set another branch as main first.',
      );
    }

    Object.assign(branch, dto);
    return this.branchRepository.save(branch);
  }

  async remove(id: string) {
    const branch = await this.findOne(id);

    if (branch.isMain) {
      throw new BadRequestException(
        'Cannot delete the main branch. Set another branch as main first.',
      );
    }

    await this.branchRepository.remove(branch);
    return { message: 'Branch deleted successfully' };
  }

  private async unsetCurrentMainBranch() {
    await this.branchRepository.update({ isMain: true }, { isMain: false });
  }

  private async generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
    let slug = slugify(name, { lower: true, strict: true, trim: true });
    let suffix = 0;
    let candidate = slug;

    while (true) {
      const existing = await this.branchRepository.findOne({
        where: { slug: candidate },
      });

      if (!existing || existing.id === excludeId) {
        return candidate;
      }

      suffix++;
      candidate = `${slug}-${suffix}`;
    }
  }
}
