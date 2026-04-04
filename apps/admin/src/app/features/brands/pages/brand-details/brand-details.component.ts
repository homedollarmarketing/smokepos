import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { BrandsService } from '../../../../core/services/brands.service';
import { Brand } from '../../../../core/models/brand.model';

@Component({
  selector: 'app-brand-details',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, RouterModule, ConfirmDialogModule, ButtonModule],
  providers: [ConfirmationService],
  templateUrl: './brand-details.component.html',
  styleUrl: './brand-details.component.scss'
})
export class BrandDetailsComponent implements OnInit {
  private brandsService = inject(BrandsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);

  brand: Brand | null = null;
  isDeleting = false;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBrand(id);
    }
  }

  loadBrand(id: string) {
    this.brandsService.getBrand(id).subscribe({
      next: (brand) => this.brand = brand,
      error: (err) => console.error('Failed to load brand details', err)
    });
  }

  confirmDelete() {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${this.brand?.name}"? This action cannot be undone.`,
      header: 'Delete Brand',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteBrand()
    });
  }

  deleteBrand() {
    if (!this.brand?.id) return;

    this.isDeleting = true;
    this.brandsService.deleteBrand(this.brand.id).subscribe({
      next: () => {
        this.router.navigate(['/brands']);
      },
      error: (err) => {
        console.error('Failed to delete brand', err);
        this.isDeleting = false;
      }
    });
  }
}
