import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CustomerAuthService } from '../services/customer-auth.service';
import { SeoService } from '../../../core/services/seo.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, RouterLink, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(CustomerAuthService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly seoService = inject(SeoService);

    // Form state
    loginForm: FormGroup;

    // UI state
    activeTab = signal<'login' | 'signup'>('login');
    showPassword = signal(false);
    isLoading = signal(false);
    errorMessage = signal<string | null>(null);

    // For 2FA flow
    verificationToken = signal<string | null>(null);
    showOtpInput = signal(false);

    // Return URL after login
    returnUrl = '/';

    constructor() {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8)]],
            otp: ['']
        });
    }

    ngOnInit(): void {
        this.seoService.updateTags({
            title: 'Login',
            description: 'Login to your Mr. P Authentic Autoparts account'
        });

        // Get return URL from query params
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/account';
    }

    togglePassword(): void {
        this.showPassword.update(v => !v);
    }

    switchToSignup(): void {
        this.router.navigate(['/auth/signup']);
    }

    onSubmit(): void {
        if (this.showOtpInput()) {
            this.verifyOtp();
        } else {
            this.initiateLogin();
        }
    }

    private initiateLogin(): void {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set(null);

        const { email, password } = this.loginForm.value;

        this.authService.login({ email, password }).subscribe({
            next: (response) => {
                this.verificationToken.set(response.verificationToken);
                this.showOtpInput.set(true);
                this.isLoading.set(false);
            },
            error: (error) => {
                this.errorMessage.set(error.message);
                this.isLoading.set(false);
            }
        });
    }

    private verifyOtp(): void {
        const otp = this.loginForm.get('otp')?.value;
        const token = this.verificationToken();

        if (!otp || otp.length !== 6 || !token) {
            this.errorMessage.set('Please enter a valid 6-digit code');
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set(null);

        this.authService.verifyLoginOtp({ verificationToken: token, otp }).subscribe({
            next: () => {
                this.isLoading.set(false);
                this.router.navigateByUrl(this.returnUrl);
            },
            error: (error) => {
                this.errorMessage.set(error.message);
                this.isLoading.set(false);
            }
        });
    }

    backToLogin(): void {
        this.showOtpInput.set(false);
        this.verificationToken.set(null);
        this.loginForm.get('otp')?.reset();
    }

    // Form getters for template
    get email() { return this.loginForm.get('email'); }
    get password() { return this.loginForm.get('password'); }
    get otp() { return this.loginForm.get('otp'); }
}
