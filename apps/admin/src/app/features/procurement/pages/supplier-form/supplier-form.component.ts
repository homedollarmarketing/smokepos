import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService } from 'primeng/api';
import { SuppliersService } from '../../services/suppliers.service';
import { Supplier } from '../../models';
import { BranchService } from '../../../../core/services/branch.service';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    ToastModule,
    ToggleSwitchModule,
  ],
  providers: [MessageService],
  templateUrl: './supplier-form.component.html',
  styleUrl: './supplier-form.component.scss',
})
export class SupplierFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly suppliersService = inject(SuppliersService);
  private readonly messageService = inject(MessageService);
  private readonly branchService = inject(BranchService);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly isEditMode = signal(false);
  readonly supplier = signal<Supplier | null>(null);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', [Validators.email, Validators.maxLength(255)]],
    phone: ['', [Validators.maxLength(50)]],
    address: [''],
    contactPerson: ['', [Validators.maxLength(255)]],
    isActive: [true],
  });

  private supplierId: string | null = null;

  ngOnInit() {
    this.supplierId = this.route.snapshot.paramMap.get('id');
    if (this.supplierId) {
      this.isEditMode.set(true);
      this.loadSupplier(this.supplierId);
    }
  }

  private loadSupplier(id: string) {
    this.isLoading.set(true);
    this.suppliersService.getSupplier(id).subscribe({
      next: (supplier) => {
        this.supplier.set(supplier);
        this.form.patchValue({
          name: supplier.name,
          email: supplier.email || '',
          phone: supplier.phone || '',
          address: supplier.address || '',
          contactPerson: supplier.contactPerson || '',
          isActive: supplier.isActive,
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load supplier',
        });
        this.isLoading.set(false);
        this.router.navigate(['/procurement/suppliers']);
      },
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formValue = this.form.value;

    if (this.isEditMode() && this.supplierId) {
      this.suppliersService
        .updateSupplier(this.supplierId, {
          name: formValue.name,
          email: formValue.email || undefined,
          phone: formValue.phone || undefined,
          address: formValue.address || undefined,
          contactPerson: formValue.contactPerson || undefined,
          isActive: formValue.isActive,
        })
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Supplier updated successfully',
            });
            this.isSaving.set(false);
            this.router.navigate(['/procurement/suppliers']);
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error?.message || 'Failed to update supplier',
            });
            this.isSaving.set(false);
          },
        });
    } else {
      const branchId = this.branchService.currentBranchId();
      if (!branchId) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Please select a branch first',
        });
        this.isSaving.set(false);
        return;
      }

      this.suppliersService
        .createSupplier({
          name: formValue.name,
          email: formValue.email || undefined,
          phone: formValue.phone || undefined,
          address: formValue.address || undefined,
          contactPerson: formValue.contactPerson || undefined,
          branchId,
        })
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Supplier created successfully',
            });
            this.isSaving.set(false);
            this.router.navigate(['/procurement/suppliers']);
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error?.message || 'Failed to create supplier',
            });
            this.isSaving.set(false);
          },
        });
    }
  }

  onCancel() {
    this.router.navigate(['/procurement/suppliers']);
  }
}
