import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { PurchaseOrdersService } from '../../services/purchase-orders.service';
import {
  PurchaseOrder,
  PurchaseOrderStatus,
  PurchaseOrderStatusLabels,
  PurchaseOrderStatusSeverity,
  TagSeverity,
} from '../../models';
import { PaginationMeta } from '../../../../core/models/pagination.model';
import { AuthService } from '../../../../core/services/auth.service';
import { BranchService } from '../../../../core/services/branch.service';

@Component({
  selector: 'app-purchase-orders-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    SelectModule,
    ToastModule,
    TooltipModule,
  ],
  providers: [MessageService],
  templateUrl: './purchase-orders-list.component.html',
  styleUrl: './purchase-orders-list.component.scss',
})
export class PurchaseOrdersListComponent implements OnInit {
  private readonly purchaseOrdersService = inject(PurchaseOrdersService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly authService = inject(AuthService);
  private readonly branchService = inject(BranchService);

  readonly Math = Math;

  readonly purchaseOrders = signal<PurchaseOrder[]>([]);
  readonly pagination = signal<PaginationMeta>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  readonly isLoading = signal(false);
  readonly searchTerm = signal('');

  readonly isEmpty = computed(() => this.purchaseOrders().length === 0 && !this.isLoading());
  readonly canGoPrev = computed(() => this.pagination().page > 1);
  readonly canGoNext = computed(() => this.pagination().page < this.pagination().totalPages);

  readonly canCreate = computed(() => this.authService.hasPermission('purchaseOrder.create'));
  readonly canEdit = computed(() => this.authService.hasPermission('purchaseOrder.edit'));
  readonly canView = computed(() => this.authService.hasPermission('purchaseOrder.view'));

  readonly statusOptions = [
    { label: 'All Statuses', value: null },
    ...Object.values(PurchaseOrderStatus).map((status) => ({
      label: PurchaseOrderStatusLabels[status],
      value: status,
    })),
  ];
  selectedStatus: PurchaseOrderStatus | null = null;

  readonly statusLabels = PurchaseOrderStatusLabels;
  readonly statusSeverity = PurchaseOrderStatusSeverity;

  constructor() {
    effect(() => {
      const branchId = this.branchService.currentBranchId();
      if (branchId) {
        this.loadData();
      }
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData(page: number = 1) {
    this.isLoading.set(true);
    const branchId = this.branchService.currentBranchId();

    this.purchaseOrdersService
      .getPurchaseOrders({
        page,
        limit: 20,
        branchId: branchId || undefined,
        status: this.selectedStatus || undefined,
        search: this.searchTerm() || undefined,
      })
      .subscribe({
        next: (response) => {
          this.purchaseOrders.set(response.data);
          this.pagination.set(response.pagination);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load purchase orders',
          });
        },
      });
  }

  onSearch() {
    this.loadData(1);
  }

  onStatusChange() {
    this.loadData(1);
  }

  onPrevPage() {
    if (this.canGoPrev()) {
      this.loadData(this.pagination().page - 1);
    }
  }

  onNextPage() {
    if (this.canGoNext()) {
      this.loadData(this.pagination().page + 1);
    }
  }

  navigateToCreate() {
    this.router.navigate(['/procurement/purchase-orders/new']);
  }

  navigateToDetails(po: PurchaseOrder) {
    this.router.navigate(['/procurement/purchase-orders', po.id]);
  }

  navigateToEdit(po: PurchaseOrder) {
    this.router.navigate(['/procurement/purchase-orders', po.id, 'edit']);
  }

  canEditPO(po: PurchaseOrder): boolean {
    return (
      this.canEdit() &&
      (po.status === PurchaseOrderStatus.DRAFT ||
        po.status === PurchaseOrderStatus.PENDING_APPROVAL)
    );
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(amount);
  }

  formatDate(date: string | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  }

  getStatusLabel(status: PurchaseOrderStatus): string {
    return PurchaseOrderStatusLabels[status] || status;
  }

  getStatusSeverity(status: PurchaseOrderStatus): TagSeverity {
    return PurchaseOrderStatusSeverity[status] || 'secondary';
  }
}
