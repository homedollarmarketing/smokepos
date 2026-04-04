import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuModule } from 'primeng/menu';
import { Popover } from 'primeng/popover';

import { AuthService, Branch } from '../../../core/services/auth.service';
import { BranchService } from '../../../core/services/branch.service';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, MenuModule, Popover],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent {
    private readonly authService = inject(AuthService);
    private readonly branchService = inject(BranchService);

    // User info
    get user() {
        return this.authService.user();
    }

    get userFullName(): string {
        const u = this.user;
        return u ? `${u.firstName} ${u.lastName}` : '';
    }

    get userEmail(): string {
        return this.user?.email ?? '';
    }

    get userAvatar(): string {
        const u = this.user;
        if (!u) return '';
        // Generate dicebear avatar from initials
        const initials = `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`;
        return `https://api.dicebear.com/7.x/initials/svg?seed=${initials}&backgroundColor=ee1b24`;
    }

    // Current branch
    get currentBranch(): Branch | null {
        return this.branchService.currentBranch();
    }

    // Available branches for switcher
    get branches(): Branch[] {
        return this.branchService.availableBranches;
    }

    onBranchSelect(branch: Branch): void {
        this.branchService.switchBranch(branch);
    }

    onLogout(): void {
        this.authService.logout();
    }
}
