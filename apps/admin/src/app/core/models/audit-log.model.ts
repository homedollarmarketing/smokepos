export interface AuditLog {
    id: string;
    performedById: string | null;
    targetId: string | null;
    targetType: string | null;
    action: string;
    description: string;
    metadata: Record<string, any> | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
    performedBy?: {
        id: string;
        firstName: string;
        lastName: string;
        email?: string;
    } | null;
}

export interface AuditLogQuery {
    page: number;
    limit: number;
    action?: string;
    targetType?: string;
    performedById?: string;
    startDate?: string;
    endDate?: string;
}
