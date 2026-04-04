import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

import { RolesService, Role } from '../../services/roles.service';

@Component({
    selector: 'app-role-details',
    standalone: true,
    imports: [CommonModule, ButtonModule, TagModule, ConfirmDialogModule],
    providers: [ConfirmationService],
    templateUrl: './role-details.component.html',
    styleUrl: './role-details.component.scss'
})
export class RoleDetailsComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly rolesService = inject(RolesService);
    private readonly confirmationService = inject(ConfirmationService);

    readonly role = signal<Role | null>(null);
    readonly isLoading = signal(false);
    readonly error = signal<string | null>(null);

    readonly groupedPermissions = computed(() => {
        const role = this.role();
        if (!role || !role.permissions) return {};

        return role.permissions.reduce((acc, permission) => {
            const [entity] = permission.split('.');
            // Clean up entity name (e.g. "purchase_order" -> "Purchase Order")
            // The template already uses titlecase pipe, but we might want to normalize underscore first
            // But usually the key is kept as is for checking, and display is formatted. 
            // Let's just use the raw entity as key.
            const key = entity || 'other';

            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(permission);
            return acc;
        }, {} as Record<string, string[]>);
    });

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadRole(id);
        }
    }

    loadRole(id: string) {
        this.isLoading.set(true);
        this.rolesService.getRole(id).subscribe({
            next: (role) => {
                if (role) {
                    this.role.set(role);
                }
                this.isLoading.set(false);
            },
            error: (err) => {
                this.error.set(err.error?.message || 'Failed to load role');
                this.isLoading.set(false);
            }
        });
    }

    onEdit() {
        const r = this.role();
        if (r) {
            this.router.navigate(['/roles', r.id, 'edit']);
        }
    }

    onDelete() {
        const r = this.role();
        if (!r) return;

        this.confirmationService.confirm({
            message: `Are you sure you want to delete the role "${r.name}"?`,
            header: 'Delete Role',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.rolesService.deleteRole(r.id).subscribe({
                    next: () => {
                        this.router.navigate(['/roles']);
                    },
                    error: (err) => {
                        this.error.set(err.error?.message || 'Failed to delete role');
                    }
                });
            }
        });
    }

    onBack() {
        this.router.navigate(['/roles']);
    }
}
