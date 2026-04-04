import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { CategoriesService } from '../../../../core/services/categories.service';
import { BranchService } from '../../../../core/services/branch.service';
import { Category } from '../../../../core/models/category.model';
import { PaginationMeta, PaginationQuery } from '../../../../core/models/pagination.model';

const DEFAULT_LIMIT = 20;

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TableModule, TagModule, PageHeaderComponent],
  templateUrl: './categories-list.component.html',
  styleUrl: './categories-list.component.scss',
})
export class CategoriesListComponent implements OnInit {
  private readonly categoriesService = inject(CategoriesService);
  private readonly branchService = inject(BranchService);
  private readonly router = inject(Router);

  // State
  readonly categories = signal<Category[]>([]);
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
      this.loadCategories(1);
    });

    // Reload when branch changes
    effect(() => {
      this.branchService.currentBranchId();
      this.loadCategories(1);
    });
  }

  ngOnInit() {
    // Initial load handled by effect
  }

  loadCategories(page: number = 1) {
    this.isLoading.set(true);
    this.error.set(null);

    const query: PaginationQuery = {
      page,
      limit: DEFAULT_LIMIT,
      branchId: this.branchService.currentBranchId() || undefined,
      search: this.searchTerm() || undefined,
    };

    this.categoriesService.getCategories(query).subscribe({
      next: (result) => {
        this.categories.set(result.data);
        this.pagination.set(result.pagination);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load categories');
        this.isLoading.set(false);
      },
    });
  }

  onSearchChange(value: string) {
    this.searchSubject.next(value);
  }

  onPrevPage() {
    if (this.canGoPrev()) {
      this.loadCategories(this.pagination().page - 1);
    }
  }

  onNextPage() {
    if (this.canGoNext()) {
      this.loadCategories(this.pagination().page + 1);
    }
  }

  onRowClick(event: any) {
    const category = event.data as Category;
    if (category && category.id) {
      this.router.navigate(['/categories', category.id]);
    }
  }

  onCreate() {
    this.router.navigate(['/categories', 'new']);
  }
}
