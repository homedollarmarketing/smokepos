import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { CategoriesService } from '../../../../core/services/categories.service';
import { BranchService } from '../../../../core/services/branch.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.scss'
})
export class CategoryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoriesService = inject(CategoriesService);
  private branchService = inject(BranchService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  categoryForm: FormGroup;
  isEditMode = false;
  categoryId: string | null = null;
  isSubmitting = false;

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  currentImageUrl: string | null = null;

  constructor() {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      isActive: [true],
      branchId: [this.branchService.currentBranchId(), Validators.required]
    });
  }

  ngOnInit() {
    this.categoryId = this.route.snapshot.paramMap.get('id');
    if (this.categoryId && this.categoryId !== 'new') {
      this.isEditMode = true;
      this.loadCategory(this.categoryId);
    }
  }

  loadCategory(id: string) {
    this.categoriesService.getCategory(id).subscribe({
      next: (category) => {
        this.categoryForm.patchValue(category);
        this.currentImageUrl = category.image || null;
      },
      error: (err) => console.error('Failed to load category', err)
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
    const control = this.categoryForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    // Construct FormData
    const formData = new FormData();
    Object.keys(this.categoryForm.value).forEach(key => {
      const value = this.categoryForm.get(key)?.value;
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    // Ensure branchId is current
    const currentBranchId = this.branchService.currentBranchId();
    if (currentBranchId) {
      formData.set('branchId', currentBranchId);
    }

    if (this.isEditMode && this.categoryId) {
      this.categoriesService.updateCategory(this.categoryId, formData).subscribe({
        next: () => this.router.navigate(['/categories']),
        error: (err) => {
          console.error('Failed to update category', err);
          this.isSubmitting = false;
        }
      });
    } else {
      this.categoriesService.createCategory(formData).subscribe({
        next: () => this.router.navigate(['/categories']),
        error: (err) => {
          console.error('Failed to create category', err);
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/categories']);
  }
}
