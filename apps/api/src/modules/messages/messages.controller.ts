import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ReqAuthUser } from '../../common/decorators/req-auth-user.decorator';
import { AuthUser } from '../../common/types/auth-user.interface';

import { MessagesService, MessageQueryDto } from './messages.service';
import { ReplyMessageDto } from './dto';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@Controller({ path: 'messages', version: '1' })
@UseGuards(PermissionGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  @RequirePermission('message.view')
  findAll(@Query() query: MessageQueryDto) {
    return this.messagesService.findAll(query);
  }

  @Get('stats')
  @RequirePermission('message.view')
  getStats() {
    return this.messagesService.getStats();
  }

  @Get(':id')
  @RequirePermission('message.view')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.messagesService.findOne(id);
  }

  @Post(':id/read')
  @RequirePermission('message.view')
  markAsRead(@Param('id', ParseUUIDPipe) id: string, @ReqAuthUser() authUser?: AuthUser) {
    return this.messagesService.markAsRead(id, authUser);
  }

  @Post(':id/reply')
  @RequirePermission('message.reply')
  reply(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() replyDto: ReplyMessageDto,
    @ReqAuthUser() authUser?: AuthUser
  ) {
    return this.messagesService.reply(id, replyDto, authUser);
  }

  @Delete(':id')
  @RequirePermission('message.delete')
  remove(@Param('id', ParseUUIDPipe) id: string, @ReqAuthUser() authUser?: AuthUser) {
    return this.messagesService.remove(id, authUser);
  }
}
