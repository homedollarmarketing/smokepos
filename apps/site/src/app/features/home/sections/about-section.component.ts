import { Component, signal, OnInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-about-section',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './about-section.component.html',
    styleUrl: './about-section.component.scss',
})
export class AboutSectionComponent implements OnInit, OnDestroy {
    private readonly platformId = inject(PLATFORM_ID);

    aboutImages = [
        '/images/home-about-us-image-001.jpeg',
        '/images/home-about-us-image-002.jpeg',
        '/images/home-about-us-image-003.jpeg',
        '/images/home-about-us-image-004.jpeg',
        '/images/home-about-us-image-005.jpeg',
    ];

    currentImage = signal(0);

    private intervalId: ReturnType<typeof setInterval> | null = null;

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.startAutoSlide();
        }
    }

    ngOnDestroy(): void {
        this.stopAutoSlide();
    }

    goToImage(index: number): void {
        this.currentImage.set(index);
        this.restartAutoSlide();
    }

    private startAutoSlide(): void {
        this.intervalId = setInterval(() => {
            const next = (this.currentImage() + 1) % this.aboutImages.length;
            this.currentImage.set(next);
        }, 4000);
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
