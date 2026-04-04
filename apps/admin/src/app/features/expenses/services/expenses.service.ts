import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../shared/models/pagination.model';
import {
  Expense,
  ExpensesQuery,
  CreateExpenseDto,
  UpdateExpenseDto,
  ReviewExpenseDto,
  CategoryOption,
} from '../models/expense.model';

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  private readonly apiUrl = `${environment.apiUrl}/expenses`;
  private readonly http = inject(HttpClient);

  /**
   * Get paginated list of expenses
   */
  getExpenses(query: ExpensesQuery): Observable<PaginatedResponse<Expense>> {
    let params = new HttpParams()
      .set('page', query.page.toString())
      .set('limit', query.limit.toString());

    if (query.search) {
      params = params.set('search', query.search);
    }

    if (query.branchId) {
      params = params.set('branchId', query.branchId);
    }

    if (query.status) {
      params = params.set('status', query.status);
    }

    if (query.category) {
      params = params.set('category', query.category);
    }

    if (query.dateFrom) {
      params = params.set('dateFrom', query.dateFrom);
    }

    if (query.dateTo) {
      params = params.set('dateTo', query.dateTo);
    }

    return this.http.get<PaginatedResponse<Expense>>(this.apiUrl, { params });
  }

  /**
   * Get single expense by ID
   */
  getExpenseById(id: string): Observable<Expense> {
    return this.http.get<Expense>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get expense categories
   */
  getCategories(): Observable<CategoryOption[]> {
    return this.http.get<CategoryOption[]>(`${this.apiUrl}/categories`);
  }

  /**
   * Create a new expense
   */
  createExpense(data: CreateExpenseDto, receipt?: File): Observable<Expense> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('amount', data.amount.toString());
    formData.append('category', data.category);
    formData.append('expenseDate', data.expenseDate);
    formData.append('branchId', data.branchId);

    if (data.description) {
      formData.append('description', data.description);
    }

    if (data.staffId) {
      formData.append('staffId', data.staffId);
    }

    if (receipt) {
      formData.append('receipt', receipt);
    }

    return this.http.post<Expense>(this.apiUrl, formData);
  }

  /**
   * Update an existing expense
   */
  updateExpense(id: string, data: UpdateExpenseDto, receipt?: File): Observable<Expense> {
    const formData = new FormData();

    if (data.title !== undefined) {
      formData.append('title', data.title);
    }
    if (data.amount !== undefined) {
      formData.append('amount', data.amount.toString());
    }
    if (data.category !== undefined) {
      formData.append('category', data.category);
    }
    if (data.expenseDate !== undefined) {
      formData.append('expenseDate', data.expenseDate);
    }
    if (data.description !== undefined) {
      formData.append('description', data.description);
    }
    if (data.staffId) {
      formData.append('staffId', data.staffId);
    }

    if (receipt) {
      formData.append('receipt', receipt);
    }

    return this.http.patch<Expense>(`${this.apiUrl}/${id}`, formData);
  }

  /**
   * Review (approve/reject) an expense
   */
  reviewExpense(id: string, data: ReviewExpenseDto): Observable<Expense> {
    return this.http.patch<Expense>(`${this.apiUrl}/${id}/review`, data);
  }

  /**
   * Delete an expense
   */
  deleteExpense(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
