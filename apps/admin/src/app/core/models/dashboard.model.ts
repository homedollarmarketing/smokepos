export interface InventoryHealthItem {
  category: string;
  value: number;
  count: number;
}

export interface FinancialDataPoint {
  month: string;
  sales: number;
  expenses: number;
}

export interface DashboardStats {
  totalSalesToday: number;
  totalExpensesMonth: number;
  availableStockValue: number;
  topSellingProduct: string | null;
  branchId: string;
  branchName: string;

  // Chart data
  inventoryHealth: InventoryHealthItem[];
  financialOverview: FinancialDataPoint[];

  // Additional inventory metrics
  lowStockCount: number;
  outOfStockCount: number;
  totalProductsCount: number;

  // Financial metrics
  totalCostOfAvailableStock: number;
  totalRevenueMonth: number;
  grossProfitMonth: number;
  netProfitMonth: number;
  grossProfitMarginMonth: number;
  netProfitMarginMonth: number;
}
