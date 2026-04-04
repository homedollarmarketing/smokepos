import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResult } from '../models/pagination.model';
import { AuditLog, AuditLogQuery } from '../models/audit-log.model';

@Injectable({
    providedIn: 'root'
})
export class AuditLogsService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/audit-logs`;

    getAuditLogs(query: AuditLogQuery): Observable<PaginatedResult<AuditLog>> {
        let params = new HttpParams()
            .set('page', query.page.toString())
            .set('limit', query.limit.toString());

        if (query.action) params = params.set('action', query.action);
        if (query.targetType) params = params.set('targetType', query.targetType);
        if (query.performedById) params = params.set('performedById', query.performedById);
        if (query.startDate) params = params.set('startDate', query.startDate);
        if (query.endDate) params = params.set('endDate', query.endDate);

        return this.http.get<PaginatedResult<AuditLog>>(this.apiUrl, { params });
    }

    getActionTypes(): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/actions`);
    }

    getEntityTypes(): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/entities`);
    }
}
