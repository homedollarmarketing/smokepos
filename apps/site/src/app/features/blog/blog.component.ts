import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../core/services/seo.service';

@Component({
    selector: 'app-blog',
    standalone: true,
    imports: [CommonModule],
    template: `
        <section class="page-placeholder">
            <div class="container">
                <h1>Blog</h1>
                <p>Automotive tips, news, and insights from Mr. P Authentic Autoparts.</p>
            </div>
        </section>
    `,
    styles: [`
        .page-placeholder {
            padding: 6rem 1.5rem;
            text-align: center;
            min-height: 60vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        h1 { font-size: 2.5rem; margin-bottom: 1rem; }
        p { color: #666; font-size: 1.125rem; }
    `]
})
export class BlogComponent implements OnInit {
    private readonly seoService = inject(SeoService);

    ngOnInit(): void {
        this.seoService.updateTags({
            title: 'Blog',
            description: 'Automotive tips, news, and insights from Mr. P Authentic Autoparts.'
        });
    }
}
