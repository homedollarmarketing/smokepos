import { Component, EventEmitter, Input, Output, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Observable, Subject, debounceTime, distinctUntilChanged } from 'rxjs';

export interface PickerItem {
  id: string;
  name: string;
  [key: string]: any;
}

export interface PickerResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type FetchItemsFn<T> = (query: {
  page: number;
  limit: number;
  search?: string;
}) => Observable<PickerResult<T>>;

@Component({
  selector: 'app-item-picker-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, InputTextModule],
  templateUrl: './item-picker-dialog.component.html',
  styleUrls: ['./item-picker-dialog.component.scss'],
})
export class ItemPickerDialogComponent<T extends PickerItem> implements OnInit {
  @Input() title = 'Select Item';
  @Input() visible = false;
  @Input() fetchItems!: FetchItemsFn<T>;
  @Input() selectedItem: T | null = null;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() itemSelected = new EventEmitter<T | null>();

  readonly items = signal<T[]>([]);
  readonly isLoading = signal(false);
  readonly searchTerm = signal('');
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly totalItems = signal(0); // TODO: Consider renaming to total

  private readonly limit = 10;
  private searchSubject = new Subject<string>();

  readonly canGoPrev = computed(() => this.currentPage() > 1);
  readonly canGoNext = computed(() => this.currentPage() < this.totalPages());

  ngOnInit() {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
      this.loadItems(1);
    });
  }

  onShow() {
    this.loadItems(1);
  }

  onHide() {
    this.visibleChange.emit(false);
    this.searchTerm.set('');
    this.items.set([]);
  }

  loadItems(page: number) {
    if (!this.fetchItems) return;

    this.isLoading.set(true);
    const search = this.searchTerm() || undefined;

    this.fetchItems({ page, limit: this.limit, search }).subscribe({
      next: (result) => {
        this.items.set(result.data);
        this.currentPage.set(result.pagination.page);
        this.totalPages.set(result.pagination.totalPages);
        this.totalItems.set(result.pagination.total);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  onSearchChange(value: string) {
    this.searchTerm.set(value);
    this.searchSubject.next(value);
  }

  onPrevPage() {
    if (this.canGoPrev()) {
      this.loadItems(this.currentPage() - 1);
    }
  }

  onNextPage() {
    if (this.canGoNext()) {
      this.loadItems(this.currentPage() + 1);
    }
  }

  selectItem(item: T) {
    this.itemSelected.emit(item);
    this.visibleChange.emit(false);
  }

  clearSelection() {
    this.itemSelected.emit(null);
    this.visibleChange.emit(false);
  }

  isSelected(item: T): boolean {
    return this.selectedItem?.id === item.id;
  }
}
