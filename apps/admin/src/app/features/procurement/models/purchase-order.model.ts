export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  PARTIALLY_RECEIVED = 'partially_received',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  productId: string;
  productName: string;
  productSku: string | null;
  quantity: number;
  unitCost: number;
  receivedQuantity: number;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplier?: {
    id: string;
    name: string;
    code: string;
  };
  branchId: string;
  branch?: {
    id: string;
    name: string;
  };
  status: PurchaseOrderStatus;
  expectedDeliveryDate: string | null;
  totalAmount: number;
  notes: string | null;
  createdById: string;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  approvedById: string | null;
  approvedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  approvedAt: string | null;
  rejectionReason: string | null;
  items: PurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseOrderItemDto {
  productId: string;
  quantity: number;
  unitCost: number;
}

export interface CreatePurchaseOrderDto {
  supplierId: string;
  branchId: string;
  expectedDeliveryDate?: string;
  notes?: string;
  status?: PurchaseOrderStatus;
  items: CreatePurchaseOrderItemDto[];
}

export interface UpdatePurchaseOrderItemDto {
  id?: string;
  productId?: string;
  quantity?: number;
  unitCost?: number;
}

export interface UpdatePurchaseOrderDto {
  supplierId?: string;
  expectedDeliveryDate?: string;
  notes?: string;
  status?: PurchaseOrderStatus;
  items?: UpdatePurchaseOrderItemDto[];
}

export interface PurchaseOrdersQuery {
  page?: number;
  limit?: number;
  branchId?: string;
  supplierId?: string;
  status?: PurchaseOrderStatus;
  search?: string;
}

export interface ReceiveItemDto {
  itemId: string;
  quantityReceived: number;
}

export interface ReceiveItemsDto {
  items: ReceiveItemDto[];
}

export interface RejectPurchaseOrderDto {
  reason: string;
}

export const PurchaseOrderStatusLabels: Record<PurchaseOrderStatus, string> = {
  [PurchaseOrderStatus.DRAFT]: 'Draft',
  [PurchaseOrderStatus.PENDING_APPROVAL]: 'Pending Approval',
  [PurchaseOrderStatus.APPROVED]: 'Approved',
  [PurchaseOrderStatus.PARTIALLY_RECEIVED]: 'Partially Received',
  [PurchaseOrderStatus.RECEIVED]: 'Received',
  [PurchaseOrderStatus.CANCELLED]: 'Cancelled',
};

export type TagSeverity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast';

export const PurchaseOrderStatusSeverity: Record<PurchaseOrderStatus, TagSeverity> = {
  [PurchaseOrderStatus.DRAFT]: 'secondary',
  [PurchaseOrderStatus.PENDING_APPROVAL]: 'warn',
  [PurchaseOrderStatus.APPROVED]: 'info',
  [PurchaseOrderStatus.PARTIALLY_RECEIVED]: 'info',
  [PurchaseOrderStatus.RECEIVED]: 'success',
  [PurchaseOrderStatus.CANCELLED]: 'danger',
};
