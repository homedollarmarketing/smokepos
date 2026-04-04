import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ExpensesService } from '../../services/expenses.service';
import { BranchService } from '../../../../core/services/branch.service';
import { StaffService } from '../../../staff/services/staff.service';
import { Staff } from '../../../staff/models/staff.model';
import {
  Expense,
  ExpenseStatus,
  ExpenseCategory,
  EXPENSE_CATEGORY_LABELS,
} from '../../models/expense.model';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    SelectModule,
    DatePickerModule,
    FileUploadModule,
    MessageModule,
    DialogModule,
    TooltipModule,
    PageHeaderComponent,
  ],
  templateUrl: './expense-form.component.html',
  styleUrl: './expense-form.component.scss',
})
export class ExpenseFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly expensesService = inject(ExpensesService);
  private readonly branchService = inject(BranchService);
  private readonly staffService = inject(StaffService);

  readonly isEditMode = signal(false);
  readonly expenseId = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);
  readonly expense = signal<Expense | null>(null);
  readonly selectedFile = signal<File | null>(null);

  // Check if expense is editable (only pending expenses)
  readonly isEditable = signal(true);

  // Staff picker modal
  showStaffPicker = false;
  staffSearchTerm = '';
  staffLoading = false;
  readonly filteredStaff = signal<Staff[]>([]);
  readonly selectedStaff = signal<Staff | null>(null);

  // Category options for dropdown
  readonly categoryOptions = Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => ({
    label,
    value: value as ExpenseCategory,
  }));

  form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    description: [''],
    amount: [null, [Validators.required, Validators.min(0.01)]],
    category: [null, [Validators.required]],
    expenseDate: [null, [Validators.required]],
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.expenseId.set(id);
      this.loadExpense(id);
    }
  }

  loadExpense(id: string) {
    this.isLoading.set(true);
    this.expensesService.getExpenseById(id).subscribe({
      next: (expense) => {
        this.expense.set(expense);

        // Check if expense is editable
        if (expense.status !== ExpenseStatus.PENDING) {
          this.isEditable.set(false);
          this.form.disable();
        }

        // Set selected staff if exists
        if (expense.staff) {
          this.selectedStaff.set({
            id: expense.staff.id,
            firstName: expense.staff.firstName,
            lastName: expense.staff.lastName,
            photoUrl: expense.staff.photoUrl,
          } as Staff);
        }

        this.form.patchValue({
          title: expense.title,
          description: expense.description || '',
          amount: expense.amount,
          category: expense.category,
          expenseDate: new Date(expense.expenseDate),
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load expense details');
        this.isLoading.set(false);
      },
    });
  }

  onFileSelect(event: any) {
    const file = event.files?.[0];
    if (file) {
      this.selectedFile.set(file);
    }
  }

  onFileClear() {
    this.selectedFile.set(null);
  }

  // Staff Picker Modal Methods
  openStaffPicker() {
    this.showStaffPicker = true;
    this.staffSearchTerm = '';
    this.filteredStaff.set([]);
    this.searchStaff();
  }

  searchStaff() {
    this.staffLoading = true;
    this.staffService
      .getStaff({
        page: 1,
        limit: 20,
        search: this.staffSearchTerm?.trim() || undefined,
      })
      .subscribe({
        next: (response) => {
          this.filteredStaff.set(response.data);
          this.staffLoading = false;
        },
        error: () => {
          this.filteredStaff.set([]);
          this.staffLoading = false;
        },
      });
  }

  selectStaff(staff: Staff) {
    this.selectedStaff.set(staff);
    this.showStaffPicker = false;
  }

  clearStaff() {
    this.selectedStaff.set(null);
  }

  onSubmit() {
    if (this.form.invalid || !this.isEditable()) return;

    this.isSaving.set(true);
    this.error.set(null);

    const formValue = this.form.value;
    const branchId = this.branchService.currentBranchId();

    if (!branchId && !this.isEditMode()) {
      this.error.set('Please select a branch');
      this.isSaving.set(false);
      return;
    }

    // Format date to ISO string (date only)
    const expenseDate =
      formValue.expenseDate instanceof Date
        ? formValue.expenseDate.toISOString().split('T')[0]
        : formValue.expenseDate;

    const file = this.selectedFile() || undefined;

    if (this.isEditMode()) {
      const updateDto = {
        title: formValue.title,
        description: formValue.description || undefined,
        amount: formValue.amount,
        category: formValue.category,
        expenseDate,
        staffId: this.selectedStaff()?.id || null,
      };

      this.expensesService.updateExpense(this.expenseId()!, updateDto, file).subscribe({
        next: (expense) => {
          this.router.navigate(['/expenses', expense.id]);
          this.isSaving.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to update expense');
          this.isSaving.set(false);
        },
      });
    } else {
      const createDto = {
        title: formValue.title,
        description: formValue.description || undefined,
        amount: formValue.amount,
        category: formValue.category,
        expenseDate,
        branchId: branchId!,
        staffId: this.selectedStaff()?.id || undefined,
      };

      this.expensesService.createExpense(createDto, file).subscribe({
        next: (expense) => {
          this.router.navigate(['/expenses', expense.id]);
          this.isSaving.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to create expense');
          this.isSaving.set(false);
        },
      });
    }
  }

  onCancel() {
    if (this.isEditMode()) {
      this.router.navigate(['/expenses', this.expenseId()]);
    } else {
      this.router.navigate(['/expenses']);
    }
  }

  get pageTitle(): string {
    if (!this.isEditable()) {
      return 'View Expense';
    }
    return this.isEditMode() ? 'Edit Expense' : 'New Expense';
  }

  get pageSubtitle(): string {
    if (!this.isEditable()) {
      return 'This expense cannot be edited because it has already been reviewed';
    }
    return this.isEditMode() ? 'Update expense details' : 'Add a new expense record';
  }
}
