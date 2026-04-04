import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { AuthStateService } from '../auth/services/auth-state.service';
import { AccountSidebarComponent } from './components/sidebar/account-sidebar.component';

@Component({
    selector: 'app-account',
    standalone: true,
    imports: [CommonModule, RouterOutlet, AccountSidebarComponent],
    templateUrl: './account.component.html',
    styleUrl: './account.component.scss'
})
export class AccountComponent implements OnInit {
    private readonly seoService = inject(SeoService);
    private readonly authState = inject(AuthStateService);
    private readonly router = inject(Router);

    ngOnInit(): void {
        this.seoService.updateTags({
            title: 'My Account',
            description: 'Manage your account, orders, and preferences.'
        });

        // Redirect to login if not authenticated
        if (!this.authState.isLoggedIn()) {
            this.router.navigate(['/auth/login'], {
                queryParams: { returnUrl: '/account' }
            });
        }
    }
}
