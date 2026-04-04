import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';

interface Service {
    title: string;
    description: string;
    icon: string;
    features: string[];
}

@Component({
    selector: 'app-services',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './services.component.html',
    styleUrl: './services.component.scss',
})
export class ServicesComponent implements OnInit {
    private readonly seoService = inject(SeoService);

    services: Service[] = [
        {
            title: 'Brake & Suspension Diagnostics',
            description: 'Comprehensive inspection and diagnostics for your braking and suspension systems.',
            icon: 'wrench',
            features: [
                'Complete brake system inspection',
                'Suspension component analysis',
                'Performance testing',
                'Detailed diagnostic report',
            ],
        },
        {
            title: 'Authentic Parts Installation',
            description: 'Professional installation of genuine monaer parts by certified technicians.',
            icon: 'settings',
            features: [
                'Expert installation service',
                'Factory-approved procedures',
                'Quality assurance checks',
                'Installation warranty',
            ],
        },
        {
            title: 'Wheel Alignment & Balancing',
            description: 'Precision alignment and balancing for optimal handling and tire longevity.',
            icon: 'gauge',
            features: [
                'Computerized alignment',
                'Dynamic wheel balancing',
                'Tire pressure optimization',
                'Handling improvement',
            ],
        },
        {
            title: 'Vehicle Check-ups',
            description: 'Comprehensive inspections specifically designed for luxury European vehicles.',
            icon: 'clipboard',
            features: [
                'Multi-point inspection',
                'Performance assessment',
                'Maintenance recommendations',
                'Detailed service report',
            ],
        },
    ];

    ngOnInit(): void {
        this.seoService.updateTags({
            title: 'Services',
            description: 'Professional automotive services including brake diagnostics, parts installation, wheel alignment, and vehicle check-ups for luxury European vehicles.',
        });
    }
}
