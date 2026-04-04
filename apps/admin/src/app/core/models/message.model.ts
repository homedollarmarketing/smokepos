export type MessageStatus = 'unread' | 'read' | 'replied';

export interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: MessageStatus;
  branchId: string;
  replyContent: string | null;
  repliedAt: string | null;
  repliedBy: string | null;
  repliedByStaff?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReplyMessageDto {
  replyContent: string;
}

export interface MessageStats {
  unread: number;
  total: number;
}
