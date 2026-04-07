import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { BranchesService } from '../../../../core/services/branches.service';
import { BranchModel } from '../../../../core/models/branch.model';

@Component({
  selector: 'app-branch-details',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    RouterModule,
    ConfirmDialogModule,
    ButtonModule,
    TagModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './branch-details.component.html',
  styleUrl: './branch-details.component.scss',
})
export class BranchDetailsComponent implements OnInit {
  private readonly branchesService = inject(BranchesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);

  branch: BranchModel | null = null;
  isDeleting = false;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBranch(id);
    }
  }

  loadBranch(id: string) {
    this.branchesService.getBranch(id).subscribe({
      next: (branch) => (this.branch = branch),
      error: (err) => console.error('Failed to load branch details', err),
    });
  }

  confirmDelete() {
    if (this.branch?.isMain) {
      this.confirmationService.confirm({
        message: 'Cannot delete the main branch. Set another branch as main first.',
        header: 'Cannot Delete',
        icon: 'pi pi-info-circle',
        acceptLabel: 'OK',
        rejectVisible: false,
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${this.branch?.name}"? This action cannot be undone.`,
      header: 'Delete Branch',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteBranch(),
    });
  }

  deleteBranch() {
    if (!this.branch?.id) return;

    this.isDeleting = true;
    this.branchesService.deleteBranch(this.branch.id).subscribe({
      next: () => {
        this.router.navigate(['/branches']);
      },
      error: (err) => {
        console.error('Failed to delete branch', err);
        this.isDeleting = false;
      },
    });
  }
}
