import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { PasswordModule } from 'primeng/password';
// import { InputSwitchModule } from 'primeng/inputswitch';

import { StaffService } from '../../services/staff.service';
import { RolesService, Role } from '../../../roles/services/roles.service';
import { BranchService, Branch } from '../../../../core/services/branch.service';

@Component({
    selector: 'app-staff-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        CheckboxModule,
        MultiSelectModule,
        PasswordModule
    ],
    templateUrl: './staff-form.component.html',
    styleUrl: './staff-form.component.scss'
})
export class StaffFormComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly staffService = inject(StaffService);
    private readonly rolesService = inject(RolesService);
    private readonly branchService = inject(BranchService); // Assuming generic service path relevant to project

    readonly isEditMode = signal(false);
    readonly staffId = signal<string | null>(null);
    readonly isLoading = signal(false);
    readonly isSaving = signal(false);
    readonly error = signal<string | null>(null);

    readonly roles = signal<Role[]>([]);
    readonly branches = signal<Branch[]>([]);

    readonly selectedFile = signal<File | null>(null);
    readonly photoPreview = signal<string | null>(null);

    form: FormGroup = this.fb.group({
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: [''], // Required validator added dynamically for create
        phone: [''],
        secondaryPhone: [''],
        roles: [[]],
        branchIds: [[]],
        isActive: [true]
    });

    ngOnInit() {
        this.loadDependencies();

        const id = this.route.snapshot.paramMap.get('id');
        if (id && id !== 'new') {
            this.isEditMode.set(true);
            this.staffId.set(id);
            this.loadStaff(id);
        } else {
            // Create mode: Password is required
            this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
            this.form.get('password')?.updateValueAndValidity();
        }
    }

    loadDependencies() {
        // Load Roles (fetching 100 for dropdown)
        this.rolesService.getRoles({ page: 1, limit: 100 }).subscribe({
            next: (res) => {
                if (res.data) {
                    this.roles.set(res.data);
                }
            }
        });

        // Load Branches
        this.branches.set(this.branchService.availableBranches);
    }

    loadStaff(id: string) {
        this.isLoading.set(true);
        this.staffService.getStaffById(id).subscribe({
            next: (staff) => {
                if (staff) {
                    this.form.patchValue({
                        firstName: staff.firstName,
                        lastName: staff.lastName,
                        email: staff.user?.email,
                        phone: staff.primaryPhoneNumber,
                        secondaryPhone: staff.secondaryPhoneNumber,
                        roles: staff.roles.map(r => r.id), // Using IDs for value binding? Or objects? usually IDs or objects depending on primeNG config. Let's assume objects for optionValue.
                        branchIds: staff.assignedBranches.map(b => b.id),
                        isActive: staff.user?.isActive
                    });
                    // Password not loaded/required in edit
                    this.form.get('password')?.clearValidators();
                    this.form.get('password')?.updateValueAndValidity();
                }
                this.isLoading.set(false);
            },
            error: (err) => {
                this.error.set(err.error?.message || 'Failed to load staff details');
                this.isLoading.set(false);
            }
        });
    }



    onFileSelect(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            this.selectedFile.set(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => this.photoPreview.set(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    }

    onSubmit() {
        if (this.form.invalid) return;

        this.isSaving.set(true);
        this.error.set(null);

        // Prepare DTO
        const fv = this.form.value;

        // Use FormData to handle file upload
        const formData = new FormData();
        formData.append('firstName', fv.firstName);
        formData.append('lastName', fv.lastName);
        formData.append('email', fv.email);
        if (fv.phone) formData.append('phone', fv.phone);
        if (fv.secondaryPhone) formData.append('secondaryPhone', fv.secondaryPhone);

        // Roles and Branches (MultiSelect uses arrays)
        // DTO expects array of strings. FormData repeats key for array.
        // But backend nests parsing? NestJS FileInterceptor handles FormData, body parsing might key values as strings or arrays.
        // To be safe, let's append array items individually if backend supports it, or stringify if backend parses JSON field.
        // Multer/BodyParser standard is 'roles[]' or just same key 'roles'. NestJS typically groups them.
        // Let's rely on standard form handling.

        const selectedRoles = this.roles().filter(r => fv.roles.includes(r.id)).map(r => r.slug);
        selectedRoles.forEach(r => formData.append('roles[]', r)); // Using 'roles[]' convention often helps
        // Actually NestJS ValidationPipe with @Body might struggle with complex objects in FormData unless we use a specific parser or simple arrays.
        // Let's conform to what `CreateStaffDto` expects. It expects `roles: string[]`.
        // Sending multiple fields with same name 'roles' usually works.

        if (selectedRoles.length === 0) {
            // If empty, backend might need handling or it defaults.
        } else {
            // For simplicity, let's append each one.
            // Note: If backend DTO validation fails for "roles should be array", we might need to change backend to use @UploadedFile alongside @Body which parses multipart.
            // Usually NestJS + Multer parses fields into body.
            // Let's trust standard repetition: `roles: val1`, `roles: val2`.
            for (const role of selectedRoles) {
                formData.append('roles', role);
            }
        }

        const branchIds = fv.branchIds as string[];
        if (branchIds && branchIds.length) {
            for (const id of branchIds) {
                formData.append('branchIds', id);
            }
        }

        formData.append('isActive', String(fv.isActive));

        if (fv.password) {
            formData.append('password', fv.password);
        }

        if (this.selectedFile()) {
            formData.append('photo', this.selectedFile()!);
        }

        const request = this.isEditMode()
            ? this.staffService.updateStaff(this.staffId()!, formData)
            : this.staffService.createStaff(formData);

        request.subscribe({
            next: (staff) => {
                if (staff) {
                    this.router.navigate(['/staff', staff.id]);
                }
                this.isSaving.set(false);
            },
            error: (err) => {
                this.error.set(err.error?.message || 'Failed to save staff member');
                this.isSaving.set(false);
            }
        });
    }

    onCancel() {
        if (this.isEditMode() && this.staffId()) {
            this.router.navigate(['/staff', this.staffId()]);
        } else {
            this.router.navigate(['/staff']);
        }
    }
}
