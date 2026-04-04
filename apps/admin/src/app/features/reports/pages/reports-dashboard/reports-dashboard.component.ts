import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BranchService } from '../../../../core/services/branch.service';

interface ReportCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  permission: string;
}

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  templateUrl: './reports-dashboard.component.html',
  styleUrl: './reports-dashboard.component.scss',
})
export class ReportsDashboardComponent {
  private readonly router = inject(Router);
  private readonly branchService = inject(BranchService);

  readonly currentBranchName = this.branchService.currentBranchName;

  readonly reportCards: ReportCard[] = [
    {
      title: 'Sales Report',
      description: 'View revenue trends, top products, and sales analytics for your branch.',
      icon: 'pi pi-chart-line',
      route: '/reports/sales',
      color: '#22c55e',
      permission: 'report.sales',
    },
    {
      title: 'Expense Report',
      description: 'Analyze expenses by category, track spending patterns and budgets.',
      icon: 'pi pi-wallet',
      route: '/reports/expenses',
      color: '#f59e0b',
      permission: 'report.expenses',
    },
    {
      title: 'Inventory Report',
      description: 'Monitor stock levels, low stock alerts, and product valuations.',
      icon: 'pi pi-box',
      route: '/reports/inventory',
      color: '#3b82f6',
      permission: 'report.inventory',
    },
    {
      title: 'Procurement Report',
      description: 'Track purchase orders, supplier performance, and procurement trends.',
      icon: 'pi pi-truck',
      route: '/reports/procurement',
      color: '#8b5cf6',
      permission: 'report.procurement',
    },
    {
      title: 'Financial Report',
      description: 'View profit & loss, revenue vs expenses, and overall financial health.',
      icon: 'pi pi-dollar',
      route: '/reports/financial',
      color: '#dc2626',
      permission: 'report.financial',
    },
  ];

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
