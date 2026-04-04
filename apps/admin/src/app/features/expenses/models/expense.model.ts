/**
 * Expense status enum
 */
export enum ExpenseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

/**
 * Expense category enum
 */
export enum ExpenseCategory {
  RENT = 'rent',
  TRANSPORT = 'transport',
  SALARY = 'salary',
  ALLOWANCE = 'allowance',
  UTILITIES = 'utilities',
  SUPPLIES = 'supplies',
  MAINTENANCE = 'maintenance',
  MARKETING = 'marketing',
  INSURANCE = 'insurance',
  TAXES = 'taxes',
  EQUIPMENT = 'equipment',
  COMMUNICATION = 'communication',
  TRAVEL = 'travel',
  TRAINING = 'training',
  FOOD = 'food',
  MISCELLANEOUS = 'miscellaneous',
}

/**
 * Category option for dropdown
 */
export interface CategoryOption {
  value: string;
  label: string;
}

/**
 * Expense interface
 */
export interface Expense {
  id: string;
  expenseId: string;
  branchId: string;
  branch?: {
    id: string;
    name: string;
    slug: string;
  };
  title: string;
  description: string | null;
  amount: number;
  category: ExpenseCategory;
  expenseDate: string;
  receiptUrl: string | null;
  status: ExpenseStatus;
  createdById: string;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    photoUrl?: string;
  };
  staffId: string | null;
  staff?: {
    id: string;
    firstName: string;
    lastName: string;
    photoUrl?: string;
  } | null;
  reviewedById: string | null;
  reviewedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    photoUrl?: string;
  } | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for creating an expense
 */
export interface CreateExpenseDto {
  title: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  expenseDate: string;
  branchId: string;
  staffId?: string;
}

/**
 * DTO for updating an expense
 */
export interface UpdateExpenseDto {
  title?: string;
  description?: string;
  amount?: number;
  category?: ExpenseCategory;
  expenseDate?: string;
  staffId?: string | null;
}

/**
 * DTO for reviewing an expense
 */
export interface ReviewExpenseDto {
  status: ExpenseStatus.APPROVED | ExpenseStatus.REJECTED;
  rejectionReason?: string;
}

/**
 * Query parameters for expenses list
 */
export interface ExpensesQuery {
  page: number;
  limit: number;
  search?: string;
  status?: ExpenseStatus;
  branchId?: string;
  category?: ExpenseCategory;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Category label mappings for display
 */
export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  [ExpenseCategory.RENT]: 'Rent',
  [ExpenseCategory.TRANSPORT]: 'Transport',
  [ExpenseCategory.SALARY]: 'Salary',
  [ExpenseCategory.ALLOWANCE]: 'Allowance',
  [ExpenseCategory.UTILITIES]: 'Utilities',
  [ExpenseCategory.SUPPLIES]: 'Supplies',
  [ExpenseCategory.MAINTENANCE]: 'Maintenance',
  [ExpenseCategory.MARKETING]: 'Marketing',
  [ExpenseCategory.INSURANCE]: 'Insurance',
  [ExpenseCategory.TAXES]: 'Taxes',
  [ExpenseCategory.EQUIPMENT]: 'Equipment',
  [ExpenseCategory.COMMUNICATION]: 'Communication',
  [ExpenseCategory.TRAVEL]: 'Travel',
  [ExpenseCategory.TRAINING]: 'Training',
  [ExpenseCategory.FOOD]: 'Food',
  [ExpenseCategory.MISCELLANEOUS]: 'Miscellaneous',
};

/**
 * Status label mappings for display
 */
export const EXPENSE_STATUS_LABELS: Record<ExpenseStatus, string> = {
  [ExpenseStatus.PENDING]: 'Pending',
  [ExpenseStatus.APPROVED]: 'Approved',
  [ExpenseStatus.REJECTED]: 'Rejected',
};

/**
 * Status severity mappings for PrimeNG Tag
 */
export const EXPENSE_STATUS_SEVERITY: Record<ExpenseStatus, 'warn' | 'success' | 'danger'> = {
  [ExpenseStatus.PENDING]: 'warn',
  [ExpenseStatus.APPROVED]: 'success',
  [ExpenseStatus.REJECTED]: 'danger',
};
