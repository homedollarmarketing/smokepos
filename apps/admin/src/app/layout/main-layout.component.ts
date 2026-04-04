import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { NavigationLoadingBarComponent } from '../shared/components/navigation-loading-bar/navigation-loading-bar.component';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent, NavigationLoadingBarComponent],
    templateUrl: './main-layout.component.html',
    styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
    sidebarCollapsed = false;

    onSidebarCollapse(collapsed: boolean) {
        this.sidebarCollapsed = collapsed;
    }
}
