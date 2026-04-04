import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SuppliersService } from '../../services/suppliers.service';
import { Supplier } from '../../models';
import { PaginationMeta } from '../../../../core/models/pagination.model';
import { AuthService } from '../../../../core/services/auth.service';
import { BranchService } from '../../../../core/services/branch.service';

@Component({
  selector: 'app-suppliers-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './suppliers-list.component.html',
  styleUrl: './suppliers-list.component.scss',
})
export class SuppliersListComponent implements OnInit {
  private readonly suppliersService = inject(SuppliersService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly authService = inject(AuthService);
  private readonly branchService = inject(BranchService);

  readonly suppliers = signal<Supplier[]>([]);
  readonly pagination = signal<PaginationMeta>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  readonly isLoading = signal(false);
  readonly searchTerm = signal('');

  readonly isEmpty = computed(() => this.suppliers().length === 0);
  readonly canGoPrev = computed(() => this.pagination().page > 1);
  readonly canGoNext = computed(() => this.pagination().page < this.pagination().totalPages);
  readonly canCreate = computed(() => this.authService.hasPermission('supplier.create'));
  readonly canEdit = computed(() => this.authService.hasPermission('supplier.edit'));
  readonly canDelete = computed(() => this.authService.hasPermission('supplier.delete'));

  constructor() {
    // React to branch changes
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

    this.suppliersService
      .getSuppliers({
        page,
        limit: 20,
        branchId: branchId || undefined,
        search: this.searchTerm() || undefined,
      })
      .subscribe({
        next: (response) => {
          this.suppliers.set(response.data);
          this.pagination.set(response.pagination);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.message || 'Failed to load suppliers',
          });
          this.isLoading.set(false);
        },
      });
  }

  onSearch() {
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

  onAddNew() {
    this.router.navigate(['/procurement/suppliers/new']);
  }

  onEdit(supplier: Supplier) {
    this.router.navigate(['/procurement/suppliers', supplier.id, 'edit']);
  }

  onDelete(supplier: Supplier) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete supplier "${supplier.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.suppliersService.deleteSupplier(supplier.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'Supplier deleted successfully',
            });
            this.loadData(this.pagination().page);
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error?.message || 'Failed to delete supplier',
            });
          },
        });
      },
    });
  }
}
