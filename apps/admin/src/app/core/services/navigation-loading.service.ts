import { Injectable, signal, inject, DestroyRef } from '@angular/core';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

/**
 * Service to track navigation loading state.
 * Provides a reactive signal that indicates when the app is navigating between routes.
 */
@Injectable({
  providedIn: 'root',
})
export class NavigationLoadingService {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  /** Signal indicating whether navigation is in progress */
  readonly isNavigating = signal(false);

  /** Signal tracking navigation progress (0-100) for animated progress bars */
  readonly progress = signal(0);

  private progressInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.subscribeToRouterEvents();
  }

  private subscribeToRouterEvents(): void {
    // Handle navigation start
    this.router.events
      .pipe(
        filter((event): event is NavigationStart => event instanceof NavigationStart),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.startLoading();
      });

    // Handle navigation end (success, cancel, or error)
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd | NavigationCancel | NavigationError =>
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.stopLoading();
      });
  }

  private startLoading(): void {
    this.isNavigating.set(true);
    this.progress.set(0);

    // Simulate progress with a trickle effect
    this.progressInterval = setInterval(() => {
      const current = this.progress();
      if (current < 90) {
        // Slow down as we approach 90%
        const increment = Math.max(1, (90 - current) / 10);
        this.progress.set(Math.min(90, current + increment));
      }
    }, 100);
  }

  private stopLoading(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }

    // Complete the progress bar
    this.progress.set(100);

    // Reset after animation completes
    setTimeout(() => {
      this.isNavigating.set(false);
      this.progress.set(0);
    }, 300);
  }
}
