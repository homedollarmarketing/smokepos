import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { BranchesService } from '../../../../core/services/branches.service';

@Component({
  selector: 'app-branch-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent],
  templateUrl: './branch-form.component.html',
  styleUrl: './branch-form.component.scss',
})
export class BranchFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly branchesService = inject(BranchesService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  branchForm: FormGroup;
  isEditMode = false;
  branchId: string | null = null;
  isSubmitting = false;

  constructor() {
    this.branchForm = this.fb.group({
      name: ['', Validators.required],
      address: [''],
      phoneNumber: [''],
      email: [''],
      isActive: [true],
      isMain: [false],
      accentColor: ['red'],
      txtOnAccentColor: ['white'],
    });
  }

  ngOnInit() {
    this.branchId = this.route.snapshot.paramMap.get('id');
    if (this.branchId && this.branchId !== 'new') {
      this.isEditMode = true;
      this.loadBranch(this.branchId);
    }
  }

  loadBranch(id: string) {
    this.branchesService.getBranch(id).subscribe({
      next: (branch) => {
        this.branchForm.patchValue(branch);
      },
      error: (err) => console.error('Failed to load branch', err),
    });
  }

  hasError(field: string): boolean {
    const control = this.branchForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.branchForm.invalid) {
      this.branchForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.branchForm.value;

    if (this.isEditMode && this.branchId) {
      this.branchesService.updateBranch(this.branchId, formValue).subscribe({
        next: () => this.router.navigate(['/branches']),
        error: (err) => {
          console.error('Failed to update branch', err);
          this.isSubmitting = false;
        },
      });
    } else {
      this.branchesService.createBranch(formValue).subscribe({
        next: () => this.router.navigate(['/branches']),
        error: (err) => {
          console.error('Failed to create branch', err);
          this.isSubmitting = false;
        },
      });
    }
  }

  onCancel() {
    this.router.navigate(['/branches']);
  }
}
