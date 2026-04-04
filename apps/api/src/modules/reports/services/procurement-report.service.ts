import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PurchaseOrder,
  PurchaseOrderStatus,
} from '../../procurement/entities/purchase-order.entity';
import { Supplier } from '../../procurement/entities/supplier.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { ReportQueryDto } from '../dto/report-query.dto';

export interface ProcurementReportData {
  summary: {
    totalPurchaseOrders: number;
    totalAmount: number;
    pendingApprovalAmount: number;
    approvedAmount: number;
    receivedAmount: number;
    cancelledAmount: number;
  };
  byStatus: {
    status: string;
    count: number;
    amount: number;
    percentage: number;
  }[];
  bySupplier: {
    supplierId: string;
    supplierName: string;
    orderCount: number;
    totalAmount: number;
  }[];
  monthlyTrends: {
    month: string;
    count: number;
    amount: number;
  }[];
  recentOrders: {
    id: string;
    poNumber: string;
    supplierName: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  }[];
  branch: {
    id: string;
    name: string;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

@Injectable()
export class ProcurementReportService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>
  ) {}

  async getProcurementReport(query: ReportQueryDto): Promise<ProcurementReportData> {
    const { branchId, startDate, endDate, limit = 10 } = query;

    // Validate branch exists
    const branch = await this.branchRepository.findOne({ where: { id: branchId } });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    const startDateTime = new Date(startDate);
    startDateTime.setHours(0, 0, 0, 0);
    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);

    // Get summary by status
    const byStatusRaw = await this.purchaseOrderRepository
      .createQueryBuilder('po')
      .select('po.status', 'status')
      .addSelect('COUNT(po.id)', 'count')
      .addSelect('COALESCE(SUM(po.total_amount), 0)', 'amount')
      .where('po.branch_id = :branchId', { branchId })
      .andWhere('po.created_at BETWEEN :startDate AND :endDate', {
        startDate: startDateTime,
        endDate: endDateTime,
      })
      .groupBy('po.status')
      .getRawMany();

    let totalAmount = 0;
    let totalPurchaseOrders = 0;
    let pendingApprovalAmount = 0;
    let approvedAmount = 0;
    let receivedAmount = 0;
    let cancelledAmount = 0;

    for (const s of byStatusRaw) {
      const amount = parseFloat(s.amount) || 0;
      const count = parseInt(s.count) || 0;
      totalAmount += amount;
      totalPurchaseOrders += count;

      if (s.status === PurchaseOrderStatus.PENDING_APPROVAL) {
        pendingApprovalAmount = amount;
      } else if (s.status === PurchaseOrderStatus.APPROVED) {
        approvedAmount = amount;
      } else if (
        s.status === PurchaseOrderStatus.RECEIVED ||
        s.status === PurchaseOrderStatus.PARTIALLY_RECEIVED
      ) {
        receivedAmount += amount;
      } else if (s.status === PurchaseOrderStatus.CANCELLED) {
        cancelledAmount = amount;
      }
    }

    const byStatus = byStatusRaw.map((s) => {
      const amount = parseFloat(s.amount) || 0;
      return {
        status: s.status,
        count: parseInt(s.count) || 0,
        amount,
        percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
      };
    });

    // Get by supplier
    const bySupplier = await this.purchaseOrderRepository
      .createQueryBuilder('po')
      .select('po.supplier_id', 'supplierId')
      .addSelect('supplier.name', 'supplierName')
      .addSelect('COUNT(po.id)', 'orderCount')
      .addSelect('COALESCE(SUM(po.total_amount), 0)', 'totalAmount')
      .innerJoin('po.supplier', 'supplier')
      .where('po.branch_id = :branchId', { branchId })
      .andWhere('po.created_at BETWEEN :startDate AND :endDate', {
        startDate: startDateTime,
        endDate: endDateTime,
      })
      .groupBy('po.supplier_id')
      .addGroupBy('supplier.name')
      .orderBy('"totalAmount"', 'DESC')
      .limit(limit)
      .getRawMany();

    // Get monthly trends
    const monthlyTrends = await this.purchaseOrderRepository
      .createQueryBuilder('po')
      .select("TO_CHAR(po.created_at, 'YYYY-MM')", 'month')
      .addSelect('COUNT(po.id)', 'count')
      .addSelect('COALESCE(SUM(po.total_amount), 0)', 'amount')
      .where('po.branch_id = :branchId', { branchId })
      .andWhere('po.created_at BETWEEN :startDate AND :endDate', {
        startDate: startDateTime,
        endDate: endDateTime,
      })
      .groupBy("TO_CHAR(po.created_at, 'YYYY-MM')")
      .orderBy('month', 'ASC')
      .getRawMany();

    // Get recent orders
    const recentOrders = await this.purchaseOrderRepository
      .createQueryBuilder('po')
      .select(['po.id', 'po.poNumber', 'po.status', 'po.totalAmount', 'po.createdAt'])
      .addSelect('supplier.name', 'supplierName')
      .innerJoin('po.supplier', 'supplier')
      .where('po.branch_id = :branchId', { branchId })
      .andWhere('po.created_at BETWEEN :startDate AND :endDate', {
        startDate: startDateTime,
        endDate: endDateTime,
      })
      .orderBy('po.created_at', 'DESC')
      .take(limit)
      .getRawMany();

    return {
      summary: {
        totalPurchaseOrders,
        totalAmount,
        pendingApprovalAmount,
        approvedAmount,
        receivedAmount,
        cancelledAmount,
      },
      byStatus,
      bySupplier: bySupplier.map((s) => ({
        supplierId: s.supplierId,
        supplierName: s.supplierName,
        orderCount: parseInt(s.orderCount) || 0,
        totalAmount: parseFloat(s.totalAmount) || 0,
      })),
      monthlyTrends: monthlyTrends.map((m) => ({
        month: m.month,
        count: parseInt(m.count) || 0,
        amount: parseFloat(m.amount) || 0,
      })),
      recentOrders: recentOrders.map((o) => ({
        id: o.po_id,
        poNumber: o.po_po_number,
        supplierName: o.supplierName,
        status: o.po_status,
        totalAmount: parseFloat(o.po_total_amount) || 0,
        createdAt: new Date(o.po_created_at).toISOString().split('T')[0],
      })),
      branch: {
        id: branch.id,
        name: branch.name,
      },
      dateRange: {
        startDate,
        endDate,
      },
    };
  }
}
