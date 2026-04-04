import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';

import { RolesService } from '../../services/roles.service';

@Component({
    selector: 'app-role-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        TextareaModule,
        CheckboxModule
    ],
    templateUrl: './role-form.component.html',
    styleUrl: './role-form.component.scss'
})
export class RoleFormComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly rolesService = inject(RolesService);

    readonly isEditMode = signal(false);
    readonly roleId = signal<string | null>(null);
    readonly isLoading = signal(false);
    readonly isSaving = signal(false);
    readonly error = signal<string | null>(null);
    readonly availablePermissions = signal<string[]>([]);

    readonly groupedPermissions = computed(() => {
        const permissions = this.availablePermissions();
        if (!permissions.length) return {};

        return permissions.reduce((acc, permission) => {
            const [entity] = permission.split('.');
            const key = entity || 'other';

            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(permission);
            return acc;
        }, {} as Record<string, string[]>);
    });

    form: FormGroup = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
        description: [''],
        permissions: [[]]
    });

    ngOnInit() {
        this.loadPermissions();

        const id = this.route.snapshot.paramMap.get('id');
        if (id && id !== 'new') {
            this.isEditMode.set(true);
            this.roleId.set(id);
            this.loadRole(id);
        }
    }

    loadPermissions() {
        this.rolesService.getPermissions().subscribe({
            next: (permissions) => {
                if (permissions) {
                    this.availablePermissions.set(permissions);
                }
            }
        });
    }

    loadRole(id: string) {
        this.isLoading.set(true);
        this.rolesService.getRole(id).subscribe({
            next: (role) => {
                if (role) {
                    this.form.patchValue({
                        name: role.name,
                        slug: role.slug,
                        description: role.description || '',
                        permissions: role.permissions || []
                    });
                }
                this.isLoading.set(false);
            },
            error: (err) => {
                this.error.set(err.error?.message || 'Failed to load role');
                this.isLoading.set(false);
            }
        });
    }

    onSubmit() {
        if (this.form.invalid) return;

        this.isSaving.set(true);
        this.error.set(null);

        const data = this.form.value;

        const request = this.isEditMode()
            ? this.rolesService.updateRole(this.roleId()!, data)
            : this.rolesService.createRole(data);

        request.subscribe({
            next: (role) => {
                if (role) {
                    this.router.navigate(['/roles', role.id]);
                }
                this.isSaving.set(false);
            },
            error: (err) => {
                this.error.set(err.error?.message || 'Failed to save role');
                this.isSaving.set(false);
            }
        });
    }

    onCancel() {
        if (this.isEditMode() && this.roleId()) {
            this.router.navigate(['/roles', this.roleId()]);
        } else {
            this.router.navigate(['/roles']);
        }
    }

    generateSlug() {
        const name = this.form.get('name')?.value || '';
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        this.form.get('slug')?.setValue(slug);
    }

    togglePermission(permission: string, checked: boolean) {
        const currentPermissions = this.form.get('permissions')?.value as string[];
        if (checked) {
            this.form.patchValue({
                permissions: [...currentPermissions, permission]
            });
        } else {
            this.form.patchValue({
                permissions: currentPermissions.filter(p => p !== permission)
            });
        }
    }

    isPermissionSelected(permission: string): boolean {
        const currentPermissions = this.form.get('permissions')?.value as string[];
        return currentPermissions.includes(permission);
    }
}
