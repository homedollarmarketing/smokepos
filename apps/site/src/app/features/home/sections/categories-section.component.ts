import { Component, inject, OnInit, signal, ElementRef, ViewChild, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SiteDataService } from '../../../core/services/site-data.service';
import { Category } from '../../../core/models/product.interface';

@Component({
    selector: 'app-categories-section',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './categories-section.component.html',
    styleUrl: './categories-section.component.scss',
})
export class CategoriesSectionComponent implements OnInit {
    private readonly siteDataService = inject(SiteDataService);
    private readonly platformId = inject(PLATFORM_ID);

    @ViewChild('categoriesTrack') categoriesTrack!: ElementRef<HTMLDivElement>;

    categories = signal<Category[]>([]);
    isLoading = signal(true);

    ngOnInit(): void {
        this.loadCategories();
    }

    loadCategories(): void {
        this.siteDataService.getCategories({ limit: 10 }).subscribe({
            next: (response) => {
                this.categories.set(response.data);
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
            },
        });
    }

    scrollLeft(): void {
        if (isPlatformBrowser(this.platformId) && this.categoriesTrack) {
            this.categoriesTrack.nativeElement.scrollBy({ left: -380, behavior: 'smooth' });
        }
    }

    scrollRight(): void {
        if (isPlatformBrowser(this.platformId) && this.categoriesTrack) {
            this.categoriesTrack.nativeElement.scrollBy({ left: 380, behavior: 'smooth' });
        }
    }
}
