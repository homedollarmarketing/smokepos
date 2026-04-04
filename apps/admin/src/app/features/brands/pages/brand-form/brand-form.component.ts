import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { BrandsService } from '../../../../core/services/brands.service';
import { BranchService } from '../../../../core/services/branch.service';

@Component({
  selector: 'app-brand-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent],
  templateUrl: './brand-form.component.html',
  styleUrl: './brand-form.component.scss'
})
export class BrandFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private brandsService = inject(BrandsService);
  private branchService = inject(BranchService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  brandForm: FormGroup;
  isEditMode = false;
  brandId: string | null = null;
  isSubmitting = false;

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  currentLogoUrl: string | null = null;

  constructor() {
    this.brandForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      isActive: [true],
      branchId: [this.branchService.currentBranchId(), Validators.required]
    });
  }

  ngOnInit() {
    this.brandId = this.route.snapshot.paramMap.get('id');
    if (this.brandId && this.brandId !== 'new') {
      this.isEditMode = true;
      this.loadBrand(this.brandId);
    }
  }

  loadBrand(id: string) {
    this.brandsService.getBrand(id).subscribe({
      next: (brand) => {
        this.brandForm.patchValue(brand);
        this.currentLogoUrl = brand.logoUrl || null;
      },
      error: (err) => console.error('Failed to load brand', err)
    });
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  hasError(field: string): boolean {
    const control = this.brandForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.brandForm.invalid) {
      this.brandForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    // Construct FormData
    const formData = new FormData();
    Object.keys(this.brandForm.value).forEach(key => {
      const value = this.brandForm.get(key)?.value;
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    if (this.selectedFile) {
      formData.append('logo', this.selectedFile);
    }

    // Ensure branchId is current
    const currentBranchId = this.branchService.currentBranchId();
    if (currentBranchId) {
      formData.set('branchId', currentBranchId);
    }

    if (this.isEditMode && this.brandId) {
      this.brandsService.updateBrand(this.brandId, formData).subscribe({
        next: () => this.router.navigate(['/brands']),
        error: (err) => {
          console.error('Failed to update brand', err);
          this.isSubmitting = false;
        }
      });
    } else {
      this.brandsService.createBrand(formData).subscribe({
        next: () => this.router.navigate(['/brands']),
        error: (err) => {
          console.error('Failed to create brand', err);
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/brands']);
  }
}
