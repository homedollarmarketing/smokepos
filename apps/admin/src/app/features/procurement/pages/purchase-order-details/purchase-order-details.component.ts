import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PurchaseOrdersService } from '../../services/purchase-orders.service';
import {
  PurchaseOrder,
  PurchaseOrderStatus,
  PurchaseOrderStatusLabels,
  PurchaseOrderStatusSeverity,
  ReceiveItemDto,
  TagSeverity,
} from '../../models';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-purchase-order-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TagModule,
    TableModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    ConfirmDialogModule,
    ToastModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './purchase-order-details.component.html',
  styleUrl: './purchase-order-details.component.scss',
})
export class PurchaseOrderDetailsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly purchaseOrdersService = inject(PurchaseOrdersService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly authService = inject(AuthService);

  readonly isLoading = signal(false);
  readonly isProcessing = signal(false);
  readonly isExporting = signal(false);
  readonly purchaseOrder = signal<PurchaseOrder | null>(null);

  readonly statusLabels = PurchaseOrderStatusLabels;
  readonly statusSeverity = PurchaseOrderStatusSeverity;

  // Dialogs
  readonly showRejectDialog = signal(false);
  readonly showReceiveDialog = signal(false);
  rejectionReason = '';
  receiveItems: {
    itemId: string;
    productName: string;
    remaining: number;
    quantityReceived: number;
  }[] = [];

  // Permissions
  readonly canEdit = computed(() => {
    const po = this.purchaseOrder();
    if (!po) return false;
    return (
      this.authService.hasPermission('purchaseOrder.edit') &&
      (po.status === PurchaseOrderStatus.DRAFT ||
        po.status === PurchaseOrderStatus.PENDING_APPROVAL)
    );
  });

  readonly canSubmitForApproval = computed(() => {
    const po = this.purchaseOrder();
    return (
      po?.status === PurchaseOrderStatus.DRAFT &&
      this.authService.hasPermission('purchaseOrder.edit')
    );
  });

  readonly canApprove = computed(() => {
    const po = this.purchaseOrder();
    return (
      po?.status === PurchaseOrderStatus.PENDING_APPROVAL &&
      this.authService.hasPermission('purchaseOrder.approve')
    );
  });

  readonly canCancel = computed(() => {
    const po = this.purchaseOrder();
    return (
      (po?.status === PurchaseOrderStatus.DRAFT ||
        po?.status === PurchaseOrderStatus.PENDING_APPROVAL) &&
      this.authService.hasPermission('purchaseOrder.edit')
    );
  });

  readonly canReceive = computed(() => {
    const po = this.purchaseOrder();
    return (
      (po?.status === PurchaseOrderStatus.APPROVED ||
        po?.status === PurchaseOrderStatus.PARTIALLY_RECEIVED) &&
      this.authService.hasPermission('purchaseOrder.receive')
    );
  });

  private poId: string | null = null;

  ngOnInit() {
    this.poId = this.route.snapshot.paramMap.get('id');
    if (this.poId) {
      this.loadPurchaseOrder(this.poId);
    } else {
      this.router.navigate(['/procurement/purchase-orders']);
    }
  }

  private loadPurchaseOrder(id: string) {
    this.isLoading.set(true);
    this.purchaseOrdersService.getPurchaseOrder(id).subscribe({
      next: (po) => {
        this.purchaseOrder.set(po);
        this.isLoading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load purchase order',
        });
        this.isLoading.set(false);
        this.router.navigate(['/procurement/purchase-orders']);
      },
    });
  }

  onEdit() {
    this.router.navigate(['/procurement/purchase-orders', this.poId, 'edit']);
  }

  onBack() {
    this.router.navigate(['/procurement/purchase-orders']);
  }

  onExportPdf() {
    const po = this.purchaseOrder();
    if (!po) return;

    this.isExporting.set(true);
    this.purchaseOrdersService.exportPdf(po.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${po.poNumber}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.isExporting.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'PDF downloaded successfully',
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to export PDF',
        });
        this.isExporting.set(false);
      },
    });
  }

  onSubmitForApproval() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to submit this purchase order for approval?',
      header: 'Confirm Submit',
      icon: 'pi pi-send',
      accept: () => {
        this.isProcessing.set(true);
        this.purchaseOrdersService.submitForApproval(this.poId!).subscribe({
          next: (po) => {
            this.purchaseOrder.set(po);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Submitted for approval',
            });
            this.isProcessing.set(false);
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error?.message || 'Failed to submit',
            });
            this.isProcessing.set(false);
          },
        });
      },
    });
  }

  onApprove() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to approve this purchase order?',
      header: 'Confirm Approval',
      icon: 'pi pi-check-circle',
      accept: () => {
        this.isProcessing.set(true);
        this.purchaseOrdersService.approve(this.poId!).subscribe({
          next: (po) => {
            this.purchaseOrder.set(po);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Purchase order approved',
            });
            this.isProcessing.set(false);
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error?.message || 'Failed to approve',
            });
            this.isProcessing.set(false);
          },
        });
      },
    });
  }

  openRejectDialog() {
    this.rejectionReason = '';
    this.showRejectDialog.set(true);
  }

  onReject() {
    if (!this.rejectionReason.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please provide a rejection reason',
      });
      return;
    }

    this.isProcessing.set(true);
    this.purchaseOrdersService.reject(this.poId!, { reason: this.rejectionReason }).subscribe({
      next: (po) => {
        this.purchaseOrder.set(po);
        this.showRejectDialog.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Purchase order rejected',
        });
        this.isProcessing.set(false);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to reject',
        });
        this.isProcessing.set(false);
      },
    });
  }

  onCancel() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to cancel this purchase order?',
      header: 'Confirm Cancellation',
      icon: 'pi pi-times-circle',
      accept: () => {
        this.isProcessing.set(true);
        this.purchaseOrdersService.cancel(this.poId!).subscribe({
          next: (po) => {
            this.purchaseOrder.set(po);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Purchase order cancelled',
            });
            this.isProcessing.set(false);
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error?.message || 'Failed to cancel',
            });
            this.isProcessing.set(false);
          },
        });
      },
    });
  }

  openReceiveDialog() {
    const po = this.purchaseOrder();
    if (!po) return;

    this.receiveItems = po.items
      .filter((item) => item.receivedQuantity < item.quantity)
      .map((item) => ({
        itemId: item.id,
        productName: item.productName,
        remaining: item.quantity - item.receivedQuantity,
        quantityReceived: 0,
      }));

    this.showReceiveDialog.set(true);
  }

  onReceiveItems() {
    const itemsToReceive: ReceiveItemDto[] = this.receiveItems
      .filter((item) => item.quantityReceived > 0)
      .map((item) => ({
        itemId: item.itemId,
        quantityReceived: item.quantityReceived,
      }));

    if (itemsToReceive.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please enter quantities to receive',
      });
      return;
    }

    // Validate quantities
    for (const item of this.receiveItems) {
      if (item.quantityReceived > item.remaining) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Cannot receive more than remaining quantity for ${item.productName}`,
        });
        return;
      }
    }

    this.isProcessing.set(true);
    this.purchaseOrdersService.receiveItems(this.poId!, { items: itemsToReceive }).subscribe({
      next: (po) => {
        this.purchaseOrder.set(po);
        this.showReceiveDialog.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Items received successfully',
        });
        this.isProcessing.set(false);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to receive items',
        });
        this.isProcessing.set(false);
      },
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(amount);
  }

  formatDate(date: string | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  }

  formatDateTime(date: string | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleString();
  }

  getStatusLabel(status?: PurchaseOrderStatus): string {
    if (!status) return 'Unknown';
    return PurchaseOrderStatusLabels[status] || status;
  }

  getStatusSeverity(status?: PurchaseOrderStatus): TagSeverity {
    if (!status) return 'secondary';
    return PurchaseOrderStatusSeverity[status] || 'secondary';
  }
}
