import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

import { StaffService } from '../../services/staff.service';
import { Staff } from '../../models/staff.model';

@Component({
    selector: 'app-staff-details',
    standalone: true,
    imports: [CommonModule, ButtonModule, TagModule, ConfirmDialogModule],
    providers: [ConfirmationService],
    templateUrl: './staff-details.component.html',
    styleUrl: './staff-details.component.scss'
})
export class StaffDetailsComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly staffService = inject(StaffService);
    private readonly confirmationService = inject(ConfirmationService);

    readonly staff = signal<Staff | null>(null);
    readonly isLoading = signal(false);
    readonly error = signal<string | null>(null);

    readonly groupedPermissions = computed(() => {
        const s = this.staff();
        if (!s || !s.roles) return {};

        const permissions = new Set<string>();
        s.roles.forEach(r => {
            r.permissions.forEach(p => permissions.add(p));
        });

        const grouped: Record<string, string[]> = {};
        permissions.forEach(p => {
            const [entity] = p.split('.');
            if (!grouped[entity]) {
                grouped[entity] = [];
            }
            grouped[entity].push(p);
        });

        return grouped;
    });

    // Keys for iteration in template
    readonly permissionEntities = computed(() => Object.keys(this.groupedPermissions()).sort());

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadStaff(id);
        }
    }

    loadStaff(id: string) {
        this.isLoading.set(true);
        this.staffService.getStaffById(id).subscribe({
            next: (staff) => {
                if (staff) {
                    this.staff.set(staff);
                }
                this.isLoading.set(false);
            },
            error: (err) => {
                this.error.set(err.error?.message || 'Failed to load staff details');
                this.isLoading.set(false);
            }
        });
    }

    onEdit() {
        const s = this.staff();
        if (s) {
            this.router.navigate(['/staff', s.id, 'edit']);
        }
    }

    onDelete() {
        const s = this.staff();
        if (!s) return;

        this.confirmationService.confirm({
            message: `Are you sure you want to delete (deactivate) staff member "${s.firstName} ${s.lastName}"?`,
            header: 'Delete Staff Member',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.staffService.deleteStaff(s.id).subscribe({
                    next: () => {
                        this.router.navigate(['/staff']);
                    },
                    error: (err) => {
                        this.error.set(err.error?.message || 'Failed to delete staff member');
                    }
                });
            }
        });
    }

    onBack() {
        this.router.navigate(['/staff']);
    }
}
