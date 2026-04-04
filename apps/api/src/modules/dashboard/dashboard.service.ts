import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Sale, SaleStatus } from '../sales/entities/sale.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { Product } from '../products/entities/product.entity';
import { Branch } from '../branches/entities/branch.entity';
import { SaleItem } from '../sales/entities/sale-item.entity';
import { Category } from '../products/entities/category.entity';
import {
  DashboardStatsDto,
  InventoryHealthItem,
  FinancialDataPoint,
} from './dto/dashboard-stats.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(SaleItem)
    private readonly saleItemRepository: Repository<SaleItem>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>
  ) {}

  async getStats(branchId: string): Promise<DashboardStatsDto> {
    const branch = await this.branchRepository.findOne({
      where: { id: branchId },
    });

    if (!branch) {
      throw new Error('Branch not found');
    }

    // Calculate today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totalSalesToday = await this.calculateTotalSales(branchId, today, tomorrow);

    // Calculate this month's expenses
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const totalExpensesMonth = await this.calculateTotalExpenses(
      branchId,
      startOfMonth,
      endOfMonth
    );

    // Calculate available stock value
    const availableStockValue = await this.calculateStockValue(branchId);

    // Get top selling product
    const topSellingProduct = await this.getTopSellingProduct(branchId);

    // Get inventory health data for chart
    const inventoryHealth = await this.getInventoryHealth(branchId);

    // Get financial overview data for chart (last 6 months)
    const financialOverview = await this.getFinancialOverview(branchId);

    // Get inventory counts
    const { lowStockCount, outOfStockCount, totalProductsCount } =
      await this.getInventoryCounts(branchId);

    // Calculate financial metrics for this month
    const totalCostOfAvailableStock = await this.calculateTotalCostOfAvailableStock(branchId);
    const totalRevenueMonth = await this.calculateTotalSales(branchId, startOfMonth, endOfMonth);
    const monthlyCOGS = await this.calculateMonthlyCOGS(branchId, startOfMonth, endOfMonth);
    const grossProfitMonth = totalRevenueMonth - monthlyCOGS;
    const netProfitMonth = grossProfitMonth - totalExpensesMonth;
    const grossProfitMarginMonth = totalRevenueMonth > 0 ? (grossProfitMonth / totalRevenueMonth) * 100 : 0;
    const netProfitMarginMonth = totalRevenueMonth > 0 ? (netProfitMonth / totalRevenueMonth) * 100 : 0;

    return {
      totalSalesToday,
      totalExpensesMonth,
      availableStockValue,
      topSellingProduct,
      branchId: branch.id,
      branchName: branch.name,
      inventoryHealth,
      financialOverview,
      lowStockCount,
      outOfStockCount,
      totalProductsCount,
      totalCostOfAvailableStock,
      totalRevenueMonth,
      grossProfitMonth,
      netProfitMonth,
      grossProfitMarginMonth,
      netProfitMarginMonth,
    };
  }

  private async calculateTotalSales(
    branchId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const result = await this.saleRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.total_amount)', 'total')
      .where('sale.branch_id = :branchId', { branchId })
      .andWhere('sale.created_at >= :startDate', { startDate })
      .andWhere('sale.created_at < :endDate', { endDate })
      .getRawOne();

    return result?.total ? parseFloat(result.total) : 0;
  }

  private async calculateTotalExpenses(
    branchId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const result = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .where('expense.branch_id = :branchId', { branchId })
      .andWhere('expense.expense_date >= :startDate', { startDate })
      .andWhere('expense.expense_date <= :endDate', { endDate })
      .getRawOne();

    return result?.total ? parseFloat(result.total) : 0;
  }

  private async calculateStockValue(branchId: string): Promise<number> {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('SUM(product.quantity * product.price)', 'total')
      .where('product.branch_id = :branchId', { branchId })
      .andWhere('product.is_active = :isActive', { isActive: true })
      .andWhere('product.quantity > 0')
      .getRawOne();

    return result?.total ? parseFloat(result.total) : 0;
  }

  private async getTopSellingProduct(branchId: string): Promise<string | null> {
    // Get top selling product in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.saleItemRepository
      .createQueryBuilder('saleItem')
      .leftJoin('saleItem.sale', 'sale')
      .leftJoin('saleItem.product', 'product')
      .select('product.name', 'productName')
      .addSelect('SUM(saleItem.quantity)', 'totalQuantity')
      .where('sale.branch_id = :branchId', { branchId })
      .andWhere('sale.created_at >= :startDate', { startDate: thirtyDaysAgo })
      .groupBy('product.id')
      .addGroupBy('product.name')
      .orderBy('"totalQuantity"', 'DESC')
      .limit(1)
      .getRawOne();

    return result?.productName || null;
  }

  private async getInventoryHealth(branchId: string): Promise<InventoryHealthItem[]> {
    // Get inventory value grouped by category
    const results = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.category', 'category')
      .select('category.name', 'category')
      .addSelect('SUM(product.quantity * product.price)', 'value')
      .addSelect('COUNT(product.id)', 'count')
      .where('product.branch_id = :branchId', { branchId })
      .andWhere('product.is_active = :isActive', { isActive: true })
      .groupBy('category.id')
      .addGroupBy('category.name')
      .orderBy('"value"', 'DESC')
      .limit(6)
      .getRawMany();

    return results.map((r) => ({
      category: r.category || 'Uncategorized',
      value: parseFloat(r.value) || 0,
      count: parseInt(r.count) || 0,
    }));
  }

  private async getFinancialOverview(branchId: string): Promise<FinancialDataPoint[]> {
    const results: FinancialDataPoint[] = [];
    const today = new Date();

    // Get last 6 months of data
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);

      const monthName = monthStart.toLocaleString('default', { month: 'short' });

      // Get sales for this month
      const salesResult = await this.saleRepository
        .createQueryBuilder('sale')
        .select('SUM(sale.total_amount)', 'total')
        .where('sale.branch_id = :branchId', { branchId })
        .andWhere('sale.created_at >= :startDate', { startDate: monthStart })
        .andWhere('sale.created_at <= :endDate', { endDate: monthEnd })
        .getRawOne();

      // Get expenses for this month
      const expensesResult = await this.expenseRepository
        .createQueryBuilder('expense')
        .select('SUM(expense.amount)', 'total')
        .where('expense.branch_id = :branchId', { branchId })
        .andWhere('expense.expense_date >= :startDate', { startDate: monthStart })
        .andWhere('expense.expense_date <= :endDate', { endDate: monthEnd })
        .getRawOne();

      results.push({
        month: monthName,
        sales: salesResult?.total ? parseFloat(salesResult.total) : 0,
        expenses: expensesResult?.total ? parseFloat(expensesResult.total) : 0,
      });
    }

    return results;
  }

  private async calculateTotalCostOfAvailableStock(branchId: string): Promise<number> {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('SUM(product.cost_price * product.quantity)', 'total')
      .where('product.branch_id = :branchId', { branchId })
      .andWhere('product.is_active = :isActive', { isActive: true })
      .andWhere('product.quantity > 0')
      .andWhere('product.cost_price IS NOT NULL')
      .getRawOne();

    return result?.total ? parseFloat(result.total) : 0;
  }

  private async calculateMonthlyCOGS(
    branchId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const result = await this.saleItemRepository
      .createQueryBuilder('item')
      .select('COALESCE(SUM(item.unit_cost * item.quantity), 0)', 'cogs')
      .innerJoin('item.sale', 'sale')
      .where('sale.branch_id = :branchId', { branchId })
      .andWhere('sale.created_at >= :startDate', { startDate })
      .andWhere('sale.created_at <= :endDate', { endDate })
      .andWhere('sale.status != :cancelled', { cancelled: SaleStatus.CANCELLED })
      .andWhere('item.unit_cost IS NOT NULL')
      .getRawOne();

    return result?.cogs ? parseFloat(result.cogs) : 0;
  }

  private async getInventoryCounts(branchId: string): Promise<{
    lowStockCount: number;
    outOfStockCount: number;
    totalProductsCount: number;
  }> {
    const LOW_STOCK_THRESHOLD = 10;

    // Total products count
    const totalProductsCount = await this.productRepository.count({
      where: { branchId, isActive: true },
    });

    // Out of stock count
    const outOfStockCount = await this.productRepository
      .createQueryBuilder('product')
      .where('product.branch_id = :branchId', { branchId })
      .andWhere('product.is_active = :isActive', { isActive: true })
      .andWhere('product.quantity <= 0')
      .getCount();

    // Low stock count (quantity > 0 but <= threshold)
    const lowStockCount = await this.productRepository
      .createQueryBuilder('product')
      .where('product.branch_id = :branchId', { branchId })
      .andWhere('product.is_active = :isActive', { isActive: true })
      .andWhere('product.quantity > 0')
      .andWhere('product.quantity <= :threshold', { threshold: LOW_STOCK_THRESHOLD })
      .getCount();

    return { lowStockCount, outOfStockCount, totalProductsCount };
  }
}
