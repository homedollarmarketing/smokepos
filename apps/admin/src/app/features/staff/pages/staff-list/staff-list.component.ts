import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StaffService } from '../../services/staff.service';
import { Staff } from '../../models/staff.model';
import { PaginationMeta, DEFAULT_LIMIT } from '../../../../shared/models/pagination.model';

@Component({
    selector: 'app-staff-list',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        TableModule,
        TagModule,
        PageHeaderComponent
    ],
    templateUrl: './staff-list.component.html',
    styleUrl: './staff-list.component.scss'
})
export class StaffListComponent implements OnInit {
    private readonly staffService = inject(StaffService);
    private readonly router = inject(Router);

    // State
    readonly staff = signal<Staff[]>([]);
    readonly pagination = signal<PaginationMeta>({
        page: 1,
        limit: DEFAULT_LIMIT,
        total: 0,
        totalPages: 1
    });
    readonly isLoading = signal(false);
    readonly error = signal<string | null>(null);

    // Computed
    readonly canGoPrev = computed(() => this.pagination().page > 1);
    readonly canGoNext = computed(() => this.pagination().page < this.pagination().totalPages);

    ngOnInit() {
        this.loadStaff();
    }

    loadStaff(page: number = 1) {
        this.isLoading.set(true);
        this.error.set(null);

        this.staffService.getStaff({ page, limit: DEFAULT_LIMIT }).subscribe({
            next: (data) => {
                this.staff.set(data.data);
                this.pagination.set(data.pagination);
                this.isLoading.set(false);
            },
            error: (err) => {
                this.error.set(err.error?.message || 'Failed to load staff list');
                this.isLoading.set(false);
            }
        });
    }

    onPrevPage() {
        if (this.canGoPrev()) {
            this.loadStaff(this.pagination().page - 1);
        }
    }

    onNextPage() {
        if (this.canGoNext()) {
            this.loadStaff(this.pagination().page + 1);
        }
    }

    onRowClick(event: any) {
        const data = event.data as Staff;
        if (data && data.id) {
            this.router.navigate(['/staff', data.id]);
        }
    }

    onCreate() {
        this.router.navigate(['/staff', 'new']);
    }
}
