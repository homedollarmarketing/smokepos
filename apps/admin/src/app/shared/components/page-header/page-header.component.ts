import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-page-header',
    standalone: true,
    imports: [CommonModule, ButtonModule, RouterModule],
    templateUrl: './page-header.component.html',
    styleUrl: './page-header.component.scss'
})
export class PageHeaderComponent {
    @Input() title = '';
    @Input() subtitle = '';
    @Input() showAddButton = false;
    @Input() addButtonLabel = 'Add New';
    @Input() addButtonIcon = 'pi pi-plus';
    @Input() addButtonLink: string | null = null;
    @Input() showBackButton = false;
    @Output() addClick = new EventEmitter<void>();

    private router = inject(Router);

    onBack() {
        // Simple back navigation, or we could accept a backUrl input
        window.history.back();
    }
}
