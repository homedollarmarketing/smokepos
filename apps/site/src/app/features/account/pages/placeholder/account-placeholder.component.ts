import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-account-placeholder',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="placeholder-container">
        <div class="icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
        </div>
        <h2>Coming Soon</h2>
        <p>We are working hard to bring this feature to you. detailed account management features will be available shortly.</p>
    </div>
  `,
    styles: [`
    .placeholder-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        text-align: center;
        background: white;
        border-radius: 8px;
        padding: 3rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);

        .icon-wrapper {
            margin-bottom: 1.5rem;
            color: #d1d5db;
        }

        h2 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #111827;
            margin-bottom: 0.75rem;
        }

        p {
            color: #6b7280;
            max-width: 400px;
            line-height: 1.5;
        }
    }
  `]
})
export class AccountPlaceholderComponent { }
