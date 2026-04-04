import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isBrowser) {
      <div class="toast-container">
        @for (toast of toastService.toasts(); track toast.id) {
          <div
            class="toast toast-{{ toast.severity }}"
            role="alert"
            (click)="toastService.remove(toast.id)"
          >
            <div class="toast-icon">
              @switch (toast.severity) {
                @case ('success') {
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      fill-rule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                      clip-rule="evenodd"
                    />
                  </svg>
                }
                @case ('error') {
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      fill-rule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                      clip-rule="evenodd"
                    />
                  </svg>
                }
                @case ('warn') {
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      fill-rule="evenodd"
                      d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                      clip-rule="evenodd"
                    />
                  </svg>
                }
                @case ('info') {
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      fill-rule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
                      clip-rule="evenodd"
                    />
                  </svg>
                }
              }
            </div>
            <div class="toast-content">
              <div class="toast-summary">{{ toast.summary }}</div>
              <div class="toast-detail">{{ toast.detail }}</div>
            </div>
            <button class="toast-close" aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        }
      </div>
    }
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        max-width: 400px;
        width: calc(100vw - 2rem);
      }

      .toast {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 1rem;
        border-radius: 0.5rem;
        box-shadow:
          0 10px 15px -3px rgba(0, 0, 0, 0.1),
          0 4px 6px -2px rgba(0, 0, 0, 0.05);
        cursor: pointer;
        animation: slideIn 0.3s ease-out;
        background: white;
        border: 1px solid #e5e7eb;
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      .toast-icon {
        flex-shrink: 0;
        width: 1.5rem;
        height: 1.5rem;
      }

      .toast-icon svg {
        width: 100%;
        height: 100%;
      }

      .toast-content {
        flex: 1;
        min-width: 0;
      }

      .toast-summary {
        font-weight: 600;
        font-size: 0.875rem;
        margin-bottom: 0.25rem;
      }

      .toast-detail {
        font-size: 0.875rem;
        color: #4b5563;
        word-break: break-word;
      }

      .toast-close {
        flex-shrink: 0;
        width: 1.25rem;
        height: 1.25rem;
        padding: 0;
        border: none;
        background: transparent;
        cursor: pointer;
        color: #9ca3af;
        transition: color 0.2s;
      }

      .toast-close:hover {
        color: #4b5563;
      }

      .toast-close svg {
        width: 100%;
        height: 100%;
      }

      /* Severity-specific styles */
      .toast-success {
        border-left: 4px solid #10b981;
      }

      .toast-success .toast-icon {
        color: #10b981;
      }

      .toast-success .toast-summary {
        color: #065f46;
      }

      .toast-error {
        border-left: 4px solid #ef4444;
      }

      .toast-error .toast-icon {
        color: #ef4444;
      }

      .toast-error .toast-summary {
        color: #991b1b;
      }

      .toast-warn {
        border-left: 4px solid #f59e0b;
      }

      .toast-warn .toast-icon {
        color: #f59e0b;
      }

      .toast-warn .toast-summary {
        color: #92400e;
      }

      .toast-info {
        border-left: 4px solid #3b82f6;
      }

      .toast-info .toast-icon {
        color: #3b82f6;
      }

      .toast-info .toast-summary {
        color: #1e40af;
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        .toast {
          background: #1f2937;
          border-color: #374151;
        }

        .toast-detail {
          color: #9ca3af;
        }

        .toast-close {
          color: #6b7280;
        }

        .toast-close:hover {
          color: #d1d5db;
        }

        .toast-success .toast-summary {
          color: #34d399;
        }

        .toast-error .toast-summary {
          color: #f87171;
        }

        .toast-warn .toast-summary {
          color: #fbbf24;
        }

        .toast-info .toast-summary {
          color: #60a5fa;
        }
      }
    `,
  ],
})
export class ToastComponent {
  private readonly platformId = inject(PLATFORM_ID);
  readonly toastService = inject(ToastService);
  readonly isBrowser = isPlatformBrowser(this.platformId);
}
