import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DatePickerModule } from 'primeng/datepicker';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { AuditLogsService } from '../../../../core/services/audit-logs.service';
import { AuditLog, AuditLogQuery } from '../../../../core/models/audit-log.model';
import { PaginationMeta } from '../../../../core/models/pagination.model';

const DEFAULT_LIMIT = 20;

@Component({
  selector: 'app-audit-logs-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    TagModule,
    DatePickerModule,
    PageHeaderComponent,
  ],
  templateUrl: './audit-logs-list.component.html',
  styleUrls: ['./audit-logs-list.component.scss'],
  providers: [DatePipe],
})
export class AuditLogsListComponent implements OnInit {
  private readonly auditLogsService = inject(AuditLogsService);

  // Data state
  readonly logs = signal<AuditLog[]>([]);
  readonly pagination = signal<PaginationMeta>({
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    totalPages: 1,
  });
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  // Filter state
  readonly selectedDateRange = signal<Date[] | null>(null);

  // Computed
  readonly canGoPrev = computed(() => this.pagination().page > 1);
  readonly canGoNext = computed(() => this.pagination().page < this.pagination().totalPages);
  readonly hasActiveFilters = computed(
    () => this.selectedDateRange() !== null && this.selectedDateRange()!.length > 0
  );

  ngOnInit() {
    this.loadLogs(1);
  }

  loadLogs(page: number = 1) {
    this.isLoading.set(true);
    this.error.set(null);

    let startDate: string | undefined;
    let endDate: string | undefined;

    if (this.selectedDateRange() && this.selectedDateRange()!.length > 0) {
      const start = this.selectedDateRange()![0];
      const end = this.selectedDateRange()![1];

      if (start) startDate = start.toISOString();
      if (end) endDate = end.toISOString();
    }

    const query: AuditLogQuery = {
      page,
      limit: DEFAULT_LIMIT,
      startDate,
      endDate,
    };

    this.auditLogsService.getAuditLogs(query).subscribe({
      next: (result) => {
        this.logs.set(result.data);
        this.pagination.set(result.pagination);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load audit logs');
        this.isLoading.set(false);
      },
    });
  }

  onDateRangeChange() {
    const range = this.selectedDateRange();
    // Only reload if we have both start and end, or just cleared
    if (!range || range.length === 0 || (range[0] && range[1])) {
      this.loadLogs(1);
    }
  }

  onDateClear() {
    this.selectedDateRange.set(null);
    this.loadLogs(1);
  }

  clearFilters() {
    this.selectedDateRange.set(null);
    this.loadLogs(1);
  }

  // Pagination
  onPrevPage() {
    if (this.canGoPrev()) {
      this.loadLogs(this.pagination().page - 1);
    }
  }

  onNextPage() {
    if (this.canGoNext()) {
      this.loadLogs(this.pagination().page + 1);
    }
  }

  getActionSeverity(action: string): 'success' | 'info' | 'warn' | 'danger' | undefined {
    switch (action) {
      case 'CREATE':
        return 'success';
      case 'UPDATE':
        return 'info';
      case 'DELETE':
        return 'danger';
      case 'LOGIN':
        return 'success';
      case 'LOGOUT':
        return 'warn';
      default:
        return 'info';
    }
  }
}
