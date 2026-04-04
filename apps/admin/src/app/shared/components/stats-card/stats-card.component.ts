import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-stats-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './stats-card.component.html',
    styleUrl: './stats-card.component.scss'
})
export class StatsCardComponent {
    @Input() title = '';
    @Input() value: string | number = '';
    @Input() subtitle = '';
    @Input() icon = 'pi pi-chart-line';
    @Input() iconBgColor = '#dcfce7';
    @Input() iconColor = '#22c55e';
    @Input() highlighted = false;
    @Input() highlightColor = '#22c55e';
}
