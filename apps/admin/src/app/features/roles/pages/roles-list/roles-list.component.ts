import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { RolesService, Role } from '../../services/roles.service';
import { PaginationMeta, DEFAULT_LIMIT } from '../../../../shared/models/pagination.model';

@Component({
    selector: 'app-roles-list',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        TableModule,
        TagModule,
        PageHeaderComponent
    ],
    templateUrl: './roles-list.component.html',
    styleUrl: './roles-list.component.scss'
})
export class RolesListComponent implements OnInit {
    private readonly rolesService = inject(RolesService);
    private readonly router = inject(Router);

    // State
    readonly roles = signal<Role[]>([]);
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
        this.loadRoles();
    }

    loadRoles(page: number = 1) {
        this.isLoading.set(true);
        this.error.set(null);

        this.rolesService.getRoles({ page, limit: DEFAULT_LIMIT }).subscribe({
            next: (data) => {
                this.roles.set(data.data);
                this.pagination.set(data.pagination);
                this.isLoading.set(false);
            },
            error: (err) => {
                this.error.set(err.error?.message || 'Failed to load roles');
                this.isLoading.set(false);
            }
        });
    }

    onPrevPage() {
        if (this.canGoPrev()) {
            this.loadRoles(this.pagination().page - 1);
        }
    }

    onNextPage() {
        if (this.canGoNext()) {
            this.loadRoles(this.pagination().page + 1);
        }
    }

    onRowClick(event: any) {
        const data = event.data as Role;
        if (data && data.id) {
            this.router.navigate(['/roles', data.id]);
        }
    }

    onCreate() {
        this.router.navigate(['/roles', 'new']);
    }
}
