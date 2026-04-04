import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CustomerAuthService } from '../services/customer-auth.service';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss',
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(CustomerAuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly seoService = inject(SeoService);

  // Form
  verifyForm: FormGroup;

  // UI state
  email = signal<string>('');
  verificationToken = signal<string>('');
  isLoading = signal(false);
  isResending = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Resend cooldown
  resendCooldown = signal(0);
  private cooldownInterval?: ReturnType<typeof setInterval>;

  constructor() {
    this.verifyForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });
  }

  ngOnInit(): void {
    this.seoService.updateTags({
      title: 'Verify Email',
      description: 'Verify your email address',
    });

    // Get email and token from query params
    const emailParam = this.route.snapshot.queryParams['email'];
    const tokenParam = this.route.snapshot.queryParams['token'];

    if (emailParam && tokenParam) {
      this.email.set(emailParam);
      this.verificationToken.set(tokenParam);
    } else {
      // Redirect to signup if missing params
      this.router.navigate(['/auth/signup']);
    }

    // Start initial cooldown
    this.startCooldown(60);
  }

  ngOnDestroy(): void {
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }
  }

  onSubmit(): void {
    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const otp = this.verifyForm.get('otp')?.value;

    this.authService
      .verifyEmail({
        verificationToken: this.verificationToken(),
        otp,
      })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set('Email verified successfully! Redirecting to your account...');
          setTimeout(() => {
            this.router.navigate(['/account']);
          }, 1500);
        },
        error: (error) => {
          this.errorMessage.set(error.message);
          this.isLoading.set(false);
        },
      });
  }

  resendOtp(): void {
    if (this.resendCooldown() > 0 || this.isResending()) return;

    this.isResending.set(true);
    this.errorMessage.set(null);

    this.authService.resendVerificationOtp(this.email()).subscribe({
      next: () => {
        this.isResending.set(false);
        this.successMessage.set('A new verification code has been sent');
        this.startCooldown(60);
      },
      error: (error) => {
        this.errorMessage.set(error.message);
        this.isResending.set(false);
      },
    });
  }

  private startCooldown(seconds: number): void {
    this.resendCooldown.set(seconds);

    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }

    this.cooldownInterval = setInterval(() => {
      const current = this.resendCooldown();
      if (current <= 1) {
        this.resendCooldown.set(0);
        if (this.cooldownInterval) {
          clearInterval(this.cooldownInterval);
        }
      } else {
        this.resendCooldown.set(current - 1);
      }
    }, 1000);
  }

  // Form getter
  get otp() {
    return this.verifyForm.get('otp');
  }
}
