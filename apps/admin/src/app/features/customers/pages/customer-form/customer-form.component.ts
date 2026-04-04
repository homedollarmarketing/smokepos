import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

import { CustomersService } from '../../services/customers.service';
import { BranchService } from '../../../../core/services/branch.service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, TextareaModule],
  templateUrl: './customer-form.component.html',
  styleUrl: './customer-form.component.scss',
})
export class CustomerFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly customersService = inject(CustomersService);
  private readonly branchService = inject(BranchService);

  readonly isEditMode = signal(false);
  readonly customerId = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    phoneNumber: ['', [Validators.required, Validators.maxLength(20)]],
    email: ['', [Validators.email, Validators.maxLength(255)]],
    address: [''],
    notes: [''],
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.customerId.set(id);
      this.loadCustomer(id);
    }
  }

  loadCustomer(id: string) {
    this.isLoading.set(true);
    this.customersService.getCustomerById(id).subscribe({
      next: (customer) => {
        this.form.patchValue({
          name: customer.name,
          phoneNumber: customer.phoneNumber,
          email: customer.email || '',
          address: customer.address || '',
          notes: customer.notes || '',
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load customer details');
        this.isLoading.set(false);
      },
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.isSaving.set(true);
    this.error.set(null);

    const formValue = this.form.value;
    const dto = {
      name: formValue.name,
      phoneNumber: formValue.phoneNumber,
      email: formValue.email || undefined,
      address: formValue.address || undefined,
      notes: formValue.notes || undefined,
    };

    const branchId = this.branchService.currentBranchId() || undefined;

    const request = this.isEditMode()
      ? this.customersService.updateCustomer(this.customerId()!, dto)
      : this.customersService.createCustomer(dto, branchId);

    request.subscribe({
      next: (customer) => {
        this.router.navigate(['/customers', customer.id]);
        this.isSaving.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to save customer');
        this.isSaving.set(false);
      },
    });
  }

  onCancel() {
    if (this.isEditMode() && this.customerId()) {
      this.router.navigate(['/customers', this.customerId()]);
    } else {
      this.router.navigate(['/customers']);
    }
  }
}
