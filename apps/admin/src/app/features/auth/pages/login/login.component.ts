import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputTextModule,
        ButtonModule,
        PasswordModule,
        MessageModule
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
    private readonly fb = inject(FormBuilder);
    private readonly router = inject(Router);
    private readonly authService = inject(AuthService);

    loginForm: FormGroup;
    otpForm: FormGroup;
    step: 'credentials' | 'otp' = 'credentials';
    errorMessage = '';

    // Use signal for loading state
    get isLoading() {
        return this.authService.isLoading();
    }

    constructor() {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8)]]
        });

        this.otpForm = this.fb.group({
            otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
        });
    }

    onSubmitCredentials() {
        if (this.loginForm.invalid) return;

        this.errorMessage = '';
        const { email, password } = this.loginForm.value;

        this.authService.login({ email, password }).subscribe({
            next: (data) => {
                if (data.verificationToken) {
                    this.step = 'otp';
                }
            },
            error: (error) => {
                this.errorMessage = error.error?.message || 'Invalid credentials. Please try again.';
            }
        });
    }

    onSubmitOtp() {
        if (this.otpForm.invalid) return;

        this.errorMessage = '';
        const { otp } = this.otpForm.value;

        this.authService.verifyOtp(otp).subscribe({
            next: (data) => {
                if (data) {
                    this.router.navigate(['/dashboard']);
                }
            },
            error: (error) => {
                this.errorMessage = error.error?.message || 'Invalid OTP. Please try again.';
            }
        });
    }

    goBack() {
        this.step = 'credentials';
        this.otpForm.reset();
        this.errorMessage = '';
    }
}
