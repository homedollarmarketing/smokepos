import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';

export interface SeoConfig {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
    twitterCard?: 'summary' | 'summary_large_image';
}

@Injectable({
    providedIn: 'root'
})
export class SeoService {
    private readonly meta = inject(Meta);
    private readonly title = inject(Title);
    private readonly router = inject(Router);
    private readonly activatedRoute = inject(ActivatedRoute);
    private readonly document = inject(DOCUMENT);
    private readonly platformId = inject(PLATFORM_ID);

    private readonly defaultConfig: SeoConfig = {
        title: 'Mr. P Authentic Autoparts',
        description: 'Official monaer Distributor. Premium genuine European vehicle parts for BMW, Mercedes-Benz, Audi, Porsche, and more. Trusted, authentic, and high-performance parts for the African automotive market.',
        keywords: 'auto parts, car parts, European auto parts, BMW parts, Mercedes parts, Audi parts, monaer, genuine parts, authentic auto parts, Uganda, Kampala',
        image: '/logo.jpg',
        type: 'website',
        twitterCard: 'summary_large_image'
    };

    private baseUrl = 'https://mrpauthenticautoparts.com';

    /**
     * Initialize automatic SEO updates based on route data
     */
    init(): void {
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            map(() => this.activatedRoute),
            map(route => {
                while (route.firstChild) route = route.firstChild;
                return route;
            }),
            filter(route => route.outlet === 'primary'),
            mergeMap(route => route.data)
        ).subscribe(data => {
            if (data['seo']) {
                this.updateTags(data['seo']);
            }
        });
    }

    /**
     * Update all SEO meta tags
     */
    updateTags(config: SeoConfig): void {
        const mergedConfig = { ...this.defaultConfig, ...config };
        const fullTitle = config.title
            ? `${config.title} | Mr. P Authentic Autoparts`
            : this.defaultConfig.title!;

        // Basic Meta Tags
        this.title.setTitle(fullTitle);
        this.updateMetaTag('description', mergedConfig.description!);
        this.updateMetaTag('keywords', mergedConfig.keywords!);

        // Canonical URL
        const canonicalUrl = mergedConfig.url || `${this.baseUrl}${this.router.url}`;
        this.setCanonicalUrl(canonicalUrl);

        // Open Graph Tags
        this.updateMetaTag('og:title', fullTitle, 'property');
        this.updateMetaTag('og:description', mergedConfig.description!, 'property');
        this.updateMetaTag('og:type', mergedConfig.type!, 'property');
        this.updateMetaTag('og:url', canonicalUrl, 'property');
        this.updateMetaTag('og:image', this.getAbsoluteUrl(mergedConfig.image!), 'property');
        this.updateMetaTag('og:site_name', 'Mr. P Authentic Autoparts', 'property');

        // Twitter Card Tags
        this.updateMetaTag('twitter:card', mergedConfig.twitterCard!);
        this.updateMetaTag('twitter:title', fullTitle);
        this.updateMetaTag('twitter:description', mergedConfig.description!);
        this.updateMetaTag('twitter:image', this.getAbsoluteUrl(mergedConfig.image!));
    }

    /**
     * Set the page title only
     */
    setTitle(title: string): void {
        const fullTitle = title
            ? `${title} | Mr. P Authentic Autoparts`
            : this.defaultConfig.title!;
        this.title.setTitle(fullTitle);
        this.updateMetaTag('og:title', fullTitle, 'property');
        this.updateMetaTag('twitter:title', fullTitle);
    }

    /**
     * Set the canonical URL
     */
    setCanonicalUrl(url: string): void {
        if (!isPlatformBrowser(this.platformId)) {
            // On server side, manage link element
            let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');
            if (!link) {
                link = this.document.createElement('link');
                link.setAttribute('rel', 'canonical');
                this.document.head.appendChild(link);
            }
            link.setAttribute('href', url);
        }
    }

    /**
     * Add JSON-LD structured data
     */
    setStructuredData(data: object): void {
        if (!isPlatformBrowser(this.platformId)) {
            // Remove existing structured data
            const existing = this.document.querySelector('script[type="application/ld+json"]');
            if (existing) {
                existing.remove();
            }

            // Add new structured data
            const script = this.document.createElement('script');
            script.type = 'application/ld+json';
            script.text = JSON.stringify(data);
            this.document.head.appendChild(script);
        }
    }

    /**
     * Get default organization structured data
     */
    getOrganizationSchema(): object {
        return {
            '@context': 'https://schema.org',
            '@type': 'AutoPartsStore',
            name: 'Mr. P Authentic Autoparts',
            description: this.defaultConfig.description,
            url: this.baseUrl,
            logo: `${this.baseUrl}/logo.jpg`,
            telephone: ['+256759204449', '+256791063897'],
            email: 'info@mrpauthenticautoparts.com',
            address: {
                '@type': 'PostalAddress',
                streetAddress: 'HAM Tower, Opposite Makerere University Main Gate',
                addressLocality: 'Kampala',
                addressCountry: 'UG'
            },
            openingHours: ['Mo-Sa 08:30-21:00', 'Su 10:00-16:00'],
            sameAs: [
                'https://instagram.com/mrpauthenticautoparts',
                'https://facebook.com/mrpauthenticautoparts',
                'https://twitter.com/mrpautoparts',
                'https://youtube.com/mrpauthenticautoparts'
            ]
        };
    }

    private updateMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name'): void {
        if (attribute === 'property') {
            this.meta.updateTag({ property: name, content });
        } else {
            this.meta.updateTag({ name, content });
        }
    }

    private getAbsoluteUrl(url: string): string {
        if (url.startsWith('http')) {
            return url;
        }
        return `${this.baseUrl}${url}`;
    }
}
