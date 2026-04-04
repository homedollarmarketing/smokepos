export interface CreateAuditLogDto {
  staffId?: string | null;
  action: string;
  entity: string;
  entityId: string;
  description?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}
