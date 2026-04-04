import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../core/services/seo.service';

// Homepage sections
import { HeroSectionComponent } from './sections/hero-section.component';
import { CategoriesSectionComponent } from './sections/categories-section.component';
import { AboutSectionComponent } from './sections/about-section.component';
import { ProductsSectionComponent } from './sections/products-section.component';
import { StatsSectionComponent } from './sections/stats-section.component';
import { MonaerSectionComponent } from './sections/monaer-section.component';
import { BrandsSectionComponent } from './sections/brands-section.component';
import { FaqSectionComponent } from './sections/faq-section.component';
import { LocationSectionComponent } from './sections/location-section.component';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        CommonModule,
        HeroSectionComponent,
        CategoriesSectionComponent,
        AboutSectionComponent,
        ProductsSectionComponent,
        StatsSectionComponent,
        MonaerSectionComponent,
        BrandsSectionComponent,
        FaqSectionComponent,
        LocationSectionComponent,
    ],
    template: `
        <app-hero-section />
        <app-categories-section />
        <app-about-section />
        <app-products-section />
        <app-stats-section />
        <app-monaer-section />
        <app-brands-section />
        <app-faq-section />
        <app-location-section />
    `,
    styles: [`
        :host {
            display: block;
        }
    `],
})
export class HomeComponent implements OnInit {
    private readonly seoService = inject(SeoService);

    ngOnInit(): void {
        this.seoService.updateTags({
            title: 'Home',
            description: 'Official monaer Distributor. Premium genuine European vehicle parts for BMW, Mercedes-Benz, Audi, Porsche, and more. Trusted, authentic, and high-performance parts for the African automotive market.',
        });

        this.seoService.setStructuredData(this.seoService.getOrganizationSchema());
    }
}
