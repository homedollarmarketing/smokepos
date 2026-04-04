import { Component, OnInit, OnDestroy, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';

@Component({
    selector: 'app-about',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './about.component.html',
    styleUrl: './about.component.scss',
})
export class AboutComponent implements OnInit, OnDestroy {
    private readonly seoService = inject(SeoService);
    private readonly platformId = inject(PLATFORM_ID);

    // Carousel images (001-004)
    carouselImages = Array.from({ length: 4 }, (_, i) =>
        `/images/about-us-image-${String(i + 1).padStart(3, '0')}.jpeg`
    );

    currentSlide = signal(0);
    private intervalId: ReturnType<typeof setInterval> | null = null;

    values = [
        {
            icon: 'heart',
            title: 'Authenticity',
            description: 'We only sell genuine parts from verified sources.',
        },
        {
            icon: 'shield',
            title: 'Trust',
            description: 'Building lasting relationships with our customers.',
        },
        {
            icon: 'star',
            title: 'Excellence',
            description: 'Delivering premium quality in everything we do.',
        },
        {
            icon: 'users',
            title: 'Service',
            description: 'Dedicated support for every customer.',
        },
    ];

    ngOnInit(): void {
        this.seoService.updateTags({
            title: 'About Us',
            description: 'Learn about Mr. P Authentic Autoparts - Uganda\'s trusted source for genuine European auto parts and official monaer distributor.',
        });

        if (isPlatformBrowser(this.platformId)) {
            this.startCarousel();
        }
    }

    ngOnDestroy(): void {
        this.stopCarousel();
    }

    goToSlide(index: number): void {
        this.currentSlide.set(index);
        this.restartCarousel();
    }

    private startCarousel(): void {
        this.intervalId = setInterval(() => {
            const next = (this.currentSlide() + 1) % this.carouselImages.length;
            this.currentSlide.set(next);
        }, 4000);
    }

    private stopCarousel(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    private restartCarousel(): void {
        this.stopCarousel();
        if (isPlatformBrowser(this.platformId)) {
            this.startCarousel();
        }
    }
}
