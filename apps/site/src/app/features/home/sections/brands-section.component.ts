import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SiteDataService } from '../../../core/services/site-data.service';
import { Brand } from '../../../core/models/product.interface';

@Component({
    selector: 'app-brands-section',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './brands-section.component.html',
    styleUrl: './brands-section.component.scss',
})
export class BrandsSectionComponent implements OnInit {
    private readonly siteDataService = inject(SiteDataService);

    brands = signal<Brand[]>([]);
    isLoading = signal(true);
    isPaused = false;

    ngOnInit(): void {
        this.loadBrands();
    }

    loadBrands(): void {
        this.siteDataService.getBrands({ limit: 20 }).subscribe({
            next: (response) => {
                this.brands.set(response.data);
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
            },
        });
    }

    pauseAnimation(): void {
        this.isPaused = true;
    }

    resumeAnimation(): void {
        this.isPaused = false;
    }
}
