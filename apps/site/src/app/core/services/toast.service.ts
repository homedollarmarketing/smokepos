import { Injectable, signal, computed } from '@angular/core';

export type ToastSeverity = 'success' | 'info' | 'warn' | 'error';

export interface Toast {
  id: number;
  severity: ToastSeverity;
  summary: string;
  detail: string;
  life?: number;
}

/**
 * Global toast notification service for the site app.
 * Uses Angular signals for reactive state management.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  private readonly _toasts = signal<Toast[]>([]);

  /** Observable list of active toasts */
  readonly toasts = computed(() => this._toasts());

  /**
   * Show a toast notification
   */
  show(severity: ToastSeverity, detail: string, summary?: string, life: number = 5000): void {
    const toast: Toast = {
      id: this.nextId++,
      severity,
      summary: summary || this.getDefaultSummary(severity),
      detail,
      life,
    };

    this._toasts.update((toasts) => [...toasts, toast]);

    // Auto-remove after life duration
    if (life > 0) {
      setTimeout(() => this.remove(toast.id), life);
    }
  }

  /**
   * Show a success toast
   */
  success(detail: string, summary: string = 'Success'): void {
    this.show('success', detail, summary);
  }

  /**
   * Show an error toast
   */
  error(detail: string, summary: string = 'Error'): void {
    this.show('error', detail, summary, 7000);
  }

  /**
   * Show a warning toast
   */
  warn(detail: string, summary: string = 'Warning'): void {
    this.show('warn', detail, summary);
  }

  /**
   * Show an info toast
   */
  info(detail: string, summary: string = 'Info'): void {
    this.show('info', detail, summary);
  }

  /**
   * Remove a specific toast by ID
   */
  remove(id: number): void {
    this._toasts.update((toasts) => toasts.filter((t) => t.id !== id));
  }

  /**
   * Clear all toast messages
   */
  clear(): void {
    this._toasts.set([]);
  }

  private getDefaultSummary(severity: ToastSeverity): string {
    switch (severity) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Error';
      case 'warn':
        return 'Warning';
      case 'info':
        return 'Info';
      default:
        return 'Notification';
    }
  }
}
