import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Message, MessageStatus } from './entities/message.entity';
import { CreateMessageDto, ReplyMessageDto } from './dto';
import {
  PaginationQueryDto,
  PaginatedResponse,
  createPaginationMeta,
} from '../../common/dto/pagination.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { EmailService } from '../shared/services/email.service';
import { Branch } from '../branches/entities/branch.entity';
import { AuthUser } from '../../common/types/auth-user.interface';

export interface MessageQueryDto extends PaginationQueryDto {
  status?: MessageStatus;
}

export interface MessageStats {
  unread: number;
  total: number;
}

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    private readonly auditLogsService: AuditLogsService,
    private readonly emailService: EmailService
  ) {}

  /**
   * Create a new message from the contact form (used by site)
   */
  async create(createMessageDto: CreateMessageDto, branchId: string): Promise<Message> {
    const message = this.messageRepository.create({
      ...createMessageDto,
      branchId,
      status: MessageStatus.UNREAD,
    });

    return this.messageRepository.save(message);
  }

  /**
   * Find all messages with pagination and optional status filter
   */
  async findAll(query: MessageQueryDto): Promise<PaginatedResponse<Message>> {
    const { page, limit, status } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.repliedByStaff', 'staff')
      .orderBy('message.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (status) {
      queryBuilder.where('message.status = :status', { status });
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      pagination: createPaginationMeta(query, total),
    };
  }

  /**
   * Find a single message by ID
   */
  async findOne(id: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id },
      relations: ['repliedByStaff', 'branch'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return message;
  }

  /**
   * Mark a message as read
   */
  async markAsRead(id: string, authUser?: AuthUser): Promise<Message> {
    if (!authUser?.staffId) {
      throw new UnauthorizedException('Staff identification required to mark messages as read');
    }

    const message = await this.findOne(id);

    if (message.status === MessageStatus.UNREAD) {
      message.status = MessageStatus.READ;
      await this.messageRepository.save(message);

      if (authUser?.staffId) {
        await this.auditLogsService.logAction({
          staffId: authUser.staffId,
          action: 'UPDATE',
          entity: 'message',
          entityId: message.id,
          description: `Marked message from "${message.email}" as read`,
        });
      }
    }

    return message;
  }

  /**
   * Reply to a message
   */
  async reply(id: string, replyDto: ReplyMessageDto, authUser?: AuthUser): Promise<Message> {
    if (!authUser?.staffId) {
      throw new UnauthorizedException('Staff identification required to reply to messages');
    }

    const message = await this.findOne(id);

    if (message.status === MessageStatus.REPLIED) {
      throw new BadRequestException('This message has already been replied to');
    }

    message.replyContent = replyDto.replyContent;
    message.repliedAt = new Date();
    message.repliedBy = authUser?.staffId || null;
    message.status = MessageStatus.REPLIED;

    const savedMessage = await this.messageRepository.save(message);

    // Send reply email to the customer
    await this.emailService.sendMessageReply({
      to: message.email,
      customerName: message.name,
      originalSubject: message.subject,
      originalMessage: message.message,
      replyContent: replyDto.replyContent,
    });

    if (authUser?.staffId) {
      await this.auditLogsService.logAction({
        staffId: authUser.staffId,
        action: 'REPLY',
        entity: 'message',
        entityId: message.id,
        description: `Replied to message from "${message.email}"`,
      });
    }

    return savedMessage;
  }

  /**
   * Delete a message
   */
  async remove(id: string, authUser?: AuthUser): Promise<void> {
    if (!authUser?.staffId) {
      throw new UnauthorizedException('Staff identification required to delete messages');
    }

    const message = await this.findOne(id);

    await this.messageRepository.remove(message);

    if (authUser?.staffId) {
      await this.auditLogsService.logAction({
        staffId: authUser.staffId,
        action: 'DELETE',
        entity: 'message',
        entityId: id,
        description: `Deleted message from "${message.email}"`,
      });
    }
  }

  /**
   * Get message statistics (unread count)
   */
  async getStats(): Promise<MessageStats> {
    const unread = await this.messageRepository.count({
      where: { status: MessageStatus.UNREAD },
    });

    const total = await this.messageRepository.count();

    return { unread, total };
  }

  /**
   * Get the main branch
   */
  async getMainBranch(): Promise<Branch | null> {
    return this.branchRepository.findOne({
      where: { isMain: true, isActive: true },
    });
  }
}
