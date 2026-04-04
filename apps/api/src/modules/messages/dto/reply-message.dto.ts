import { IsString, IsNotEmpty } from 'class-validator';

export class ReplyMessageDto {
  @IsString()
  @IsNotEmpty()
  replyContent: string;
}
