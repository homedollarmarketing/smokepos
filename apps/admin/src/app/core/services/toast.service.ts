import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

export type ToastSeverity = 'success' | 'info' | 'warn' | 'error';

export interface ToastOptions {
  severity: ToastSeverity;
  summary: string;
  detail: string;
  life?: number;
  sticky?: boolean;
}

/**
 * Global toast notification service.
 * Provides a centralized way to show toast notifications across the application.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private messageService: MessageService | null = null;

  /**
   * Register the MessageService instance.
   * This should be called from the root component that provides MessageService.
   */
  setMessageService(messageService: MessageService): void {
    this.messageService = messageService;
  }

  /**
   * Show a toast notification
   */
  show(options: ToastOptions): void {
    if (!this.messageService) {
      console.warn('ToastService: MessageService not registered. Call setMessageService() first.');
      return;
    }

    this.messageService.add({
      severity: options.severity,
      summary: options.summary,
      detail: options.detail,
      life: options.life ?? 5000,
      sticky: options.sticky ?? false,
    });
  }

  /**
   * Show a success toast
   */
  success(detail: string, summary: string = 'Success'): void {
    this.show({ severity: 'success', summary, detail });
  }

  /**
   * Show an error toast
   */
  error(detail: string, summary: string = 'Error'): void {
    this.show({ severity: 'error', summary, detail, life: 7000 });
  }

  /**
   * Show a warning toast
   */
  warn(detail: string, summary: string = 'Warning'): void {
    this.show({ severity: 'warn', summary, detail });
  }

  /**
   * Show an info toast
   */
  info(detail: string, summary: string = 'Info'): void {
    this.show({ severity: 'info', summary, detail });
  }

  /**
   * Clear all toast messages
   */
  clear(): void {
    this.messageService?.clear();
  }
}
