import { Component, signal, OnInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-hero-section',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './hero-section.component.html',
    styleUrl: './hero-section.component.scss',
})
export class HeroSectionComponent implements OnInit, OnDestroy {
    private readonly platformId = inject(PLATFORM_ID);

    heroImages = [
        '/images/home-hero-image-001.jpeg',
        '/images/home-hero-image-002.jpeg',
        '/images/home-hero-image-003.jpeg',
        '/images/home-hero-image-004.jpeg',
        '/images/home-hero-image-005.jpeg',
    ];

    currentSlide = signal(0);

    private intervalId: ReturnType<typeof setInterval> | null = null;

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.startAutoSlide();
        }
    }

    ngOnDestroy(): void {
        this.stopAutoSlide();
    }

    goToSlide(index: number): void {
        this.currentSlide.set(index);
        this.restartAutoSlide();
    }

    private startAutoSlide(): void {
        this.intervalId = setInterval(() => {
            const next = (this.currentSlide() + 1) % this.heroImages.length;
            this.currentSlide.set(next);
        }, 5000);
    }

    private stopAutoSlide(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    private restartAutoSlide(): void {
        this.stopAutoSlide();
        if (isPlatformBrowser(this.platformId)) {
            this.startAutoSlide();
        }
    }
}
