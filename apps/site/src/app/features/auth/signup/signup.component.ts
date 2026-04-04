import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CustomerAuthService } from '../services/customer-auth.service';
import { SeoService } from '../../../core/services/seo.service';

@Component({
    selector: 'app-signup',
    standalone: true,
    imports: [CommonModule, RouterLink, ReactiveFormsModule],
    templateUrl: './signup.component.html',
    styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(CustomerAuthService);
    private readonly router = inject(Router);
    private readonly seoService = inject(SeoService);

    // Form
    signupForm: FormGroup;

    // UI state
    showPassword = signal(false);
    showConfirmPassword = signal(false);
    isLoading = signal(false);
    errorMessage = signal<string | null>(null);

    // For email verification flow
    registeredEmail = signal<string | null>(null);

    constructor() {
        this.signupForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-]{10,}$/)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', [Validators.required]],
            terms: [false, [Validators.requiredTrue]]
        }, { validators: this.passwordMatchValidator });
    }

    ngOnInit(): void {
        this.seoService.updateTags({
            title: 'Create Account',
            description: 'Create your Mr. P Authentic Autoparts account'
        });
    }

    passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const password = control.get('password');
        const confirmPassword = control.get('confirmPassword');

        if (password?.value !== confirmPassword?.value) {
            confirmPassword?.setErrors({ passwordMismatch: true });
            return { passwordMismatch: true };
        }
        return null;
    }

    togglePassword(): void {
        this.showPassword.update(v => !v);
    }

    toggleConfirmPassword(): void {
        this.showConfirmPassword.update(v => !v);
    }

    switchToLogin(): void {
        this.router.navigate(['/auth/login']);
    }

    onSubmit(): void {
        if (this.signupForm.invalid) {
            this.signupForm.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set(null);

        const { name, phoneNumber, email, password, confirmPassword } = this.signupForm.value;

        this.authService.signup({ name, phoneNumber, email, password, confirmPassword }).subscribe({
            next: (response) => {
                this.isLoading.set(false);
                this.registeredEmail.set(email);
                // Navigate to email verification page
                this.router.navigate(['/auth/verify-email'], {
                    queryParams: {
                        email,
                        token: response.verificationToken
                    }
                });
            },
            error: (error) => {
                this.errorMessage.set(error.message);
                this.isLoading.set(false);
            }
        });
    }

    // Form getters for template
    get name() { return this.signupForm.get('name'); }
    get phoneNumber() { return this.signupForm.get('phoneNumber'); }
    get email() { return this.signupForm.get('email'); }
    get password() { return this.signupForm.get('password'); }
    get confirmPassword() { return this.signupForm.get('confirmPassword'); }
    get terms() { return this.signupForm.get('terms'); }
}
