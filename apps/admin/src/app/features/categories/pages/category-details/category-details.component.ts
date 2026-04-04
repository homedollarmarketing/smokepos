import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { CategoriesService } from '../../../../core/services/categories.service';
import { Category } from '../../../../core/models/category.model';

@Component({
  selector: 'app-category-details',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, RouterModule, ConfirmDialogModule, ButtonModule],
  providers: [ConfirmationService],
  templateUrl: './category-details.component.html',
  styleUrl: './category-details.component.scss'
})
export class CategoryDetailsComponent implements OnInit {
  private categoriesService = inject(CategoriesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);

  category: Category | null = null;
  isDeleting = false;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCategory(id);
    }
  }

  loadCategory(id: string) {
    this.categoriesService.getCategory(id).subscribe({
      next: (category) => this.category = category,
      error: (err) => console.error('Failed to load category details', err)
    });
  }

  confirmDelete() {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${this.category?.name}"? This action cannot be undone.`,
      header: 'Delete Category',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteCategory()
    });
  }

  deleteCategory() {
    if (!this.category?.id) return;

    this.isDeleting = true;
    this.categoriesService.deleteCategory(this.category.id).subscribe({
      next: () => {
        this.router.navigate(['/categories']);
      },
      error: (err) => {
        console.error('Failed to delete category', err);
        this.isDeleting = false;
      }
    });
  }
}
