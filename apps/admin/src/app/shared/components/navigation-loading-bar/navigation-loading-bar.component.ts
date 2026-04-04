import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationLoadingService } from '../../../core/services/navigation-loading.service';

/**
 * A top-of-page loading bar that appears during route navigation.
 * Similar to NProgress, provides visual feedback for navigation.
 */
@Component({
  selector: 'app-navigation-loading-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="navigation-loading-bar"
      [class.active]="isNavigating()"
      [class.complete]="isComplete()"
    >
      <div class="progress-bar" [style.transform]="'scaleX(' + progress() / 100 + ')'"></div>
      <div class="glow"></div>
    </div>
  `,
  styles: [
    `
      .navigation-loading-bar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        z-index: 9999;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .navigation-loading-bar.active {
        opacity: 1;
      }

      .navigation-loading-bar.complete {
        opacity: 0;
        transition: opacity 0.3s ease 0.1s;
      }

      .progress-bar {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 100%;
        background: linear-gradient(
          90deg,
          var(--p-primary-400) 0%,
          var(--p-primary-500) 50%,
          var(--p-primary-400) 100%
        );
        transform-origin: left;
        transition: transform 0.1s ease-out;
      }

      .glow {
        position: absolute;
        top: 0;
        right: 0;
        width: 100px;
        height: 100%;
        background: linear-gradient(90deg, transparent, var(--p-primary-300));
        opacity: 0.5;
        box-shadow:
          0 0 10px var(--p-primary-400),
          0 0 5px var(--p-primary-300);
        animation: pulse 1.5s ease-in-out infinite;
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 0.3;
        }
        50% {
          opacity: 0.7;
        }
      }
    `,
  ],
})
export class NavigationLoadingBarComponent {
  private readonly loadingService = inject(NavigationLoadingService);

  readonly isNavigating = this.loadingService.isNavigating;
  readonly progress = this.loadingService.progress;

  readonly isComplete = computed(() => this.progress() === 100);
}
