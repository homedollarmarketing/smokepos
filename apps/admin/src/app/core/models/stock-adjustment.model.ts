export type StockAdjustmentType = 'procurement_receipt' | 'sale' | 'sale_cancellation' | 'manual';

export interface StockAdjustment {
  id: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    sku?: string;
  };
  branchId: string;
  branch?: {
    id: string;
    name: string;
  };
  adjustmentType: StockAdjustmentType;
  quantityChange: number;
  previousQuantity: number;
  newQuantity: number;
  unitCost: number | null;
  previousCostPrice: number | null;
  newCostPrice: number | null;
  referenceType: string | null;
  referenceId: string | null;
  referenceCode: string | null;
  reason: string | null;
  staffId: string;
  staff?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export const StockAdjustmentTypeLabels: Record<StockAdjustmentType, string> = {
  procurement_receipt: 'Procurement Receipt',
  sale: 'Sale',
  sale_cancellation: 'Sale Cancellation',
  manual: 'Manual Adjustment',
};
