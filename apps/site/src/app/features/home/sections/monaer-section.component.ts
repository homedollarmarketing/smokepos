import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-monaer-section',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './monaer-section.component.html',
    styleUrl: './monaer-section.component.scss',
})
export class MonaerSectionComponent { }
