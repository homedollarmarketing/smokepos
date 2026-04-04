import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ReportQuery,
  SalesReportData,
  ExpenseReportData,
  InventoryReportData,
  ProcurementReportData,
  FinancialReportData,
} from '../models/report.model';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reports`;

  private buildParams(query: ReportQuery): HttpParams {
    let params = new HttpParams()
      .set('branchId', query.branchId)
      .set('startDate', query.startDate)
      .set('endDate', query.endDate);

    if (query.limit) {
      params = params.set('limit', query.limit.toString());
    }

    return params;
  }

  // Sales Report
  getSalesReport(query: ReportQuery): Observable<SalesReportData> {
    return this.http.get<SalesReportData>(`${this.apiUrl}/sales`, {
      params: this.buildParams(query),
    });
  }

  downloadSalesReportPdf(query: ReportQuery): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/sales/pdf`, {
      params: this.buildParams(query),
      responseType: 'blob',
    });
  }

  // Expense Report
  getExpenseReport(query: ReportQuery): Observable<ExpenseReportData> {
    return this.http.get<ExpenseReportData>(`${this.apiUrl}/expenses`, {
      params: this.buildParams(query),
    });
  }

  downloadExpenseReportPdf(query: ReportQuery): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/expenses/pdf`, {
      params: this.buildParams(query),
      responseType: 'blob',
    });
  }

  // Inventory Report
  getInventoryReport(branchId: string): Observable<InventoryReportData> {
    return this.http.get<InventoryReportData>(`${this.apiUrl}/inventory`, {
      params: new HttpParams().set('branchId', branchId),
    });
  }

  downloadInventoryReportPdf(branchId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/inventory/pdf`, {
      params: new HttpParams().set('branchId', branchId),
      responseType: 'blob',
    });
  }

  // Procurement Report
  getProcurementReport(query: ReportQuery): Observable<ProcurementReportData> {
    return this.http.get<ProcurementReportData>(`${this.apiUrl}/procurement`, {
      params: this.buildParams(query),
    });
  }

  downloadProcurementReportPdf(query: ReportQuery): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/procurement/pdf`, {
      params: this.buildParams(query),
      responseType: 'blob',
    });
  }

  // Financial Report
  getFinancialReport(query: ReportQuery): Observable<FinancialReportData> {
    return this.http.get<FinancialReportData>(`${this.apiUrl}/financial`, {
      params: this.buildParams(query),
    });
  }

  downloadFinancialReportPdf(query: ReportQuery): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/financial/pdf`, {
      params: this.buildParams(query),
      responseType: 'blob',
    });
  }

  // Helper to download blob as file
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
