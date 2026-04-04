import { Component, OnInit, OnDestroy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';

import { ReportsService } from '../../services/reports.service';
import { BranchService } from '../../../../core/services/branch.service';
import { ExpenseReportData, ReportQuery } from '../../models/report.model';
import {
  DateRangePickerComponent,
  DateRange,
} from '../../components/date-range-picker/date-range-picker.component';

@Component({
  selector: 'app-expenses-report',
  standalone: true,
  imports: [
    CommonModule,
    ChartModule,
    CardModule,
    ButtonModule,
    TableModule,
    ProgressSpinnerModule,
    MessageModule,
    TagModule,
    DateRangePickerComponent,
  ],
  templateUrl: './expenses-report.component.html',
  styleUrl: './expenses-report.component.scss',
})
export class ExpensesReportComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly reportsService = inject(ReportsService);
  private readonly branchService = inject(BranchService);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly data = signal<ExpenseReportData | null>(null);
  readonly isExporting = signal(false);

  private currentDateRange: DateRange | null = null;
  private currentQuery: ReportQuery | null = null;
  private isInitialized = false;

  // Effect to reload report when branch changes
  private readonly branchEffect = effect(() => {
    const branchId = this.branchService.currentBranchId();
    if (branchId && this.isInitialized && this.currentDateRange) {
      this.updateQueryAndLoad();
    }
  });

  private readonly categoryColors = [
    '#dc2626',
    '#f59e0b',
    '#22c55e',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#14b8a6',
    '#f97316',
    '#6366f1',
    '#84cc16',
    '#06b6d4',
    '#a855f7',
    '#eab308',
    '#ef4444',
    '#10b981',
  ];

  // Doughnut chart for expenses by category
  readonly categoryChartData = computed(() => {
    const reportData = this.data();
    if (!reportData || reportData.byCategory.length === 0) return null;

    return {
      labels: reportData.byCategory.map((c) => this.formatCategoryName(c.category)),
      datasets: [
        {
          data: reportData.byCategory.map((c) => c.amount),
          backgroundColor: this.categoryColors.slice(0, reportData.byCategory.length),
        },
      ],
    };
  });

  readonly categoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
        },
      },
    },
  };

  // Daily trend chart
  readonly trendChartData = computed(() => {
    const reportData = this.data();
    if (!reportData || reportData.dailyTrends.length === 0) return null;

    return {
      labels: reportData.dailyTrends.map((d) => this.formatDateLabel(d.date)),
      datasets: [
        {
          label: 'Expenses (UGX)',
          data: reportData.dailyTrends.map((d) => d.amount),
          fill: true,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4,
        },
      ],
    };
  });

  readonly trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => this.formatCurrencyShort(value),
        },
      },
    },
  };

  ngOnInit(): void {
    this.isInitialized = true;
  }

  ngOnDestroy(): void {
    this.branchEffect.destroy();
  }

  onDateRangeChange(range: DateRange): void {
    this.currentDateRange = range;
    this.updateQueryAndLoad();
  }

  private updateQueryAndLoad(): void {
    const branchId = this.branchService.currentBranchId();
    if (!branchId || !this.currentDateRange) {
      this.error.set('No branch selected');
      return;
    }

    this.currentQuery = {
      branchId,
      startDate: this.currentDateRange.startDate,
      endDate: this.currentDateRange.endDate,
    };

    this.loadReport();
  }

  loadReport(): void {
    if (!this.currentQuery) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.reportsService.getExpenseReport(this.currentQuery).subscribe({
      next: (data) => {
        this.data.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Failed to load report');
        this.isLoading.set(false);
      },
    });
  }

  exportPdf(): void {
    if (!this.currentQuery) return;

    this.isExporting.set(true);

    this.reportsService.downloadExpenseReportPdf(this.currentQuery).subscribe({
      next: (blob) => {
        this.reportsService.downloadFile(
          blob,
          `expense-report-${this.currentQuery!.startDate}-${this.currentQuery!.endDate}.pdf`
        );
        this.isExporting.set(false);
      },
      error: () => {
        this.isExporting.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/reports']);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(value);
  }

  formatCategoryName(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ');
  }

  private formatCurrencyShort(value: number): string {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  }

  private formatDateLabel(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-UG', { month: 'short', day: 'numeric' });
  }
}
