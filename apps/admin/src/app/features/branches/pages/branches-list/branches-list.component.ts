import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { BranchesService } from '../../../../core/services/branches.service';
import { BranchModel } from '../../../../core/models/branch.model';

@Component({
  selector: 'app-branches-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TableModule, TagModule, PageHeaderComponent],
  templateUrl: './branches-list.component.html',
  styleUrl: './branches-list.component.scss',
})
export class BranchesListComponent implements OnInit {
  private readonly branchesService = inject(BranchesService);
  private readonly router = inject(Router);

  readonly branches = signal<BranchModel[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit() {
    this.loadBranches();
  }

  loadBranches() {
    this.isLoading.set(true);
    this.error.set(null);

    this.branchesService.getBranches().subscribe({
      next: (branches) => {
        this.branches.set(branches);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load branches');
        this.isLoading.set(false);
      },
    });
  }

  onRowClick(event: any) {
    const branch = event.data as BranchModel;
    if (branch && branch.id) {
      this.router.navigate(['/branches', branch.id]);
    }
  }

  onCreate() {
    this.router.navigate(['/branches', 'new']);
  }
}
