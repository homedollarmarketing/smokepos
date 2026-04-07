import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BranchModel, CreateBranchDto, UpdateBranchDto } from '../models/branch.model';

@Injectable({
  providedIn: 'root',
})
export class BranchesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/branches`;

  getBranches(): Observable<BranchModel[]> {
    return this.http.get<BranchModel[]>(this.apiUrl);
  }

  getBranch(id: string): Observable<BranchModel> {
    return this.http.get<BranchModel>(`${this.apiUrl}/${id}`);
  }

  createBranch(dto: CreateBranchDto): Observable<BranchModel> {
    return this.http.post<BranchModel>(this.apiUrl, dto);
  }

  updateBranch(id: string, dto: UpdateBranchDto): Observable<BranchModel> {
    return this.http.patch<BranchModel>(`${this.apiUrl}/${id}`, dto);
  }

  deleteBranch(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
