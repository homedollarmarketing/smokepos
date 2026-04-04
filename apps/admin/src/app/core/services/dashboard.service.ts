import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardStats } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/dashboard`;

  getStats(branchId: string): Observable<DashboardStats> {
    const params = new HttpParams().set('branchId', branchId);
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`, { params });
  }
}
