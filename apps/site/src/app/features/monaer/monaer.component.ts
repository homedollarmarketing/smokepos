import { Component, OnInit, OnDestroy, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';

@Component({
    selector: 'app-monaer',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './monaer.component.html',
    styleUrl: './monaer.component.scss',
})
export class MonaerComponent implements OnInit, OnDestroy {
    private readonly seoService = inject(SeoService);
    private readonly platformId = inject(PLATFORM_ID);

    // Product carousel images (001-008)
    productImages = Array.from({ length: 8 }, (_, i) =>
        `/images/monaer-page-image-${String(i + 1).padStart(3, '0')}.jpeg`
    );

    // Why Choose carousel images (009-012)
    whyChooseImages = Array.from({ length: 4 }, (_, i) =>
        `/images/monaer-page-image-${String(i + 9).padStart(3, '0')}.jpeg`
    );

    currentProductSlide = signal(0);
    currentWhyChooseSlide = signal(0);

    private productIntervalId: ReturnType<typeof setInterval> | null = null;
    private whyChooseIntervalId: ReturnType<typeof setInterval> | null = null;

    features = [
        {
            icon: 'shield',
            title: 'OEM Quality',
            description: 'Factory-approved parts that meet original equipment manufacturer standards.',
        },
        {
            icon: 'award',
            title: 'German Engineering',
            description: 'Precision-engineered brake systems designed in Germany for optimal performance.',
        },
        {
            icon: 'check',
            title: 'Certified Standards',
            description: 'All products meet international safety and quality certifications.',
        },
        {
            icon: 'truck',
            title: 'Nationwide Delivery',
            description: 'Fast and reliable delivery across Uganda with secure packaging.',
        },
    ];

    ngOnInit(): void {
        this.seoService.updateTags({
            title: 'monaer - The Brake System',
            description: 'Official monaer distributor in Uganda. Premium German-engineered brake systems and suspension parts for luxury European vehicles.',
        });

        if (isPlatformBrowser(this.platformId)) {
            this.startProductCarousel();
            this.startWhyChooseCarousel();
        }
    }

    ngOnDestroy(): void {
        this.stopCarousels();
    }

    goToProductSlide(index: number): void {
        this.currentProductSlide.set(index);
        this.restartProductCarousel();
    }

    goToWhyChooseSlide(index: number): void {
        this.currentWhyChooseSlide.set(index);
        this.restartWhyChooseCarousel();
    }

    private startProductCarousel(): void {
        this.productIntervalId = setInterval(() => {
            const next = (this.currentProductSlide() + 1) % this.productImages.length;
            this.currentProductSlide.set(next);
        }, 4000);
    }

    private startWhyChooseCarousel(): void {
        this.whyChooseIntervalId = setInterval(() => {
            const next = (this.currentWhyChooseSlide() + 1) % this.whyChooseImages.length;
            this.currentWhyChooseSlide.set(next);
        }, 5000);
    }

    private stopCarousels(): void {
        if (this.productIntervalId) clearInterval(this.productIntervalId);
        if (this.whyChooseIntervalId) clearInterval(this.whyChooseIntervalId);
    }

    private restartProductCarousel(): void {
        if (this.productIntervalId) clearInterval(this.productIntervalId);
        if (isPlatformBrowser(this.platformId)) this.startProductCarousel();
    }

    private restartWhyChooseCarousel(): void {
        if (this.whyChooseIntervalId) clearInterval(this.whyChooseIntervalId);
        if (isPlatformBrowser(this.platformId)) this.startWhyChooseCarousel();
    }
}
