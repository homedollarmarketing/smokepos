import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { BrandsService } from '../../../../core/services/brands.service';
import { BranchService } from '../../../../core/services/branch.service';
import { Brand } from '../../../../core/models/brand.model';
import { PaginationMeta, PaginationQuery } from '../../../../core/models/pagination.model';

const DEFAULT_LIMIT = 20;

@Component({
  selector: 'app-brands-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TableModule, TagModule, PageHeaderComponent],
  templateUrl: './brands-list.component.html',
  styleUrl: './brands-list.component.scss',
})
export class BrandsListComponent implements OnInit {
  private readonly brandsService = inject(BrandsService);
  private readonly branchService = inject(BranchService);
  private readonly router = inject(Router);

  // State
  readonly brands = signal<Brand[]>([]);
  readonly pagination = signal<PaginationMeta>({
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    totalPages: 1,
  });
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly searchTerm = signal('');

  // Search debounce
  private searchSubject = new Subject<string>();

  // Computed
  readonly canGoPrev = computed(() => this.pagination().page > 1);
  readonly canGoNext = computed(() => this.pagination().page < this.pagination().totalPages);

  constructor() {
    // Debounced search
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe((term) => {
      this.searchTerm.set(term);
      this.loadBrands(1);
    });

    // Reload when branch changes
    effect(() => {
      this.branchService.currentBranchId();
      this.loadBrands(1);
    });
  }

  ngOnInit() {
    // Initial load handled by effect
  }

  loadBrands(page: number = 1) {
    this.isLoading.set(true);
    this.error.set(null);

    const query: PaginationQuery = {
      page,
      limit: DEFAULT_LIMIT,
      branchId: this.branchService.currentBranchId() || undefined,
      search: this.searchTerm() || undefined,
    };

    this.brandsService.getBrands(query).subscribe({
      next: (result) => {
        this.brands.set(result.data);
        this.pagination.set(result.pagination);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load brands');
        this.isLoading.set(false);
      },
    });
  }

  onSearchChange(value: string) {
    this.searchSubject.next(value);
  }

  onPrevPage() {
    if (this.canGoPrev()) {
      this.loadBrands(this.pagination().page - 1);
    }
  }

  onNextPage() {
    if (this.canGoNext()) {
      this.loadBrands(this.pagination().page + 1);
    }
  }

  onRowClick(event: any) {
    const brand = event.data as Brand;
    if (brand && brand.id) {
      this.router.navigate(['/brands', brand.id]);
    }
  }

  onCreate() {
    this.router.navigate(['/brands', 'new']);
  }
}
