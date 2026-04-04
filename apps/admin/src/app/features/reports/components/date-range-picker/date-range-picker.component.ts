import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';

export interface DateRange {
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePickerModule, ButtonModule],
  template: `
    <div class="date-range-picker">
      <div class="date-inputs">
        <div class="date-field">
          <label>Start Date</label>
          <p-datepicker
            [(ngModel)]="startDate"
            [showIcon]="true"
            [maxDate]="endDate || today"
            dateFormat="yy-mm-dd"
            placeholder="Start date"
            [showButtonBar]="true"
            (onSelect)="onDateChange()"
          />
        </div>
        <div class="date-field">
          <label>End Date</label>
          <p-datepicker
            [(ngModel)]="endDate"
            [showIcon]="true"
            [minDate]="startDate"
            [maxDate]="today"
            dateFormat="yy-mm-dd"
            placeholder="End date"
            [showButtonBar]="true"
            (onSelect)="onDateChange()"
          />
        </div>
      </div>
      <div class="quick-actions">
        <button
          pButton
          type="button"
          label="This Month"
          severity="secondary"
          size="small"
          (click)="setThisMonth()"
        ></button>
        <button
          pButton
          type="button"
          label="Last Month"
          severity="secondary"
          size="small"
          (click)="setLastMonth()"
        ></button>
        <button
          pButton
          type="button"
          label="Last 3 Months"
          severity="secondary"
          size="small"
          (click)="setLastThreeMonths()"
        ></button>
        <button
          pButton
          type="button"
          label="This Year"
          severity="secondary"
          size="small"
          (click)="setThisYear()"
        ></button>
      </div>
    </div>
  `,
  styles: [
    `
      .date-range-picker {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .date-inputs {
        display: flex;
        gap: 1rem;
        align-items: flex-end;
      }

      .date-field {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;

        label {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-color-secondary);
        }

        :host ::ng-deep .p-datepicker {
          width: 160px;
        }
      }

      .quick-actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
    `,
  ],
})
export class DateRangePickerComponent {
  @Input() set initialRange(range: DateRange | null) {
    if (range) {
      this.startDate = new Date(range.startDate);
      this.endDate = new Date(range.endDate);
    }
  }

  @Output() rangeChange = new EventEmitter<DateRange>();

  startDate: Date | null = null;
  endDate: Date | null = null;
  today = new Date();

  constructor() {
    // Default to current month
    this.setThisMonth();
  }

  onDateChange(): void {
    if (this.startDate && this.endDate) {
      this.emitRange();
    }
  }

  setThisMonth(): void {
    const now = new Date();
    this.startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    this.endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this.emitRange();
  }

  setLastMonth(): void {
    const now = new Date();
    this.startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    this.endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    this.emitRange();
  }

  setLastThreeMonths(): void {
    const now = new Date();
    this.startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    this.endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this.emitRange();
  }

  setThisYear(): void {
    const now = new Date();
    this.startDate = new Date(now.getFullYear(), 0, 1);
    this.endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this.emitRange();
  }

  private emitRange(): void {
    if (this.startDate && this.endDate) {
      this.rangeChange.emit({
        startDate: this.formatDate(this.startDate),
        endDate: this.formatDate(this.endDate),
      });
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
