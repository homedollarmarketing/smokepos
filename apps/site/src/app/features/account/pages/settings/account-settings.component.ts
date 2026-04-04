import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerAuthService } from '../../../auth/services/customer-auth.service';
import { AuthStateService } from '../../../auth/services/auth-state.service';
import { Customer } from '../../../auth/models/customer.interface';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.scss',
})
export class AccountSettingsComponent implements OnInit {
  private readonly authService = inject(CustomerAuthService);
  private readonly authState = inject(AuthStateService);
  private readonly fb = inject(FormBuilder);

  // State
  readonly customer = this.authState.customer;
  readonly loading = signal(false);
  readonly savingProfile = signal(false);
  readonly savingPassword = signal(false);
  readonly uploadingPhoto = signal(false);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly passwordError = signal<string | null>(null);
  readonly passwordSuccess = signal<string | null>(null);

  // Photo preview
  readonly photoPreview = signal<string | null>(null);
  readonly selectedFile = signal<File | null>(null);

  // Computed
  readonly displayPhoto = computed(() => {
    return this.photoPreview() || this.customer()?.photoUrl || null;
  });

  // Forms
  profileForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
    phoneNumber: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(20)]],
    address: ['', [Validators.maxLength(500)]],
  });

  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  ngOnInit() {
    this.loadCustomerData();
  }

  loadCustomerData() {
    const customer = this.customer();
    if (customer) {
      this.profileForm.patchValue({
        name: customer.name,
        phoneNumber: customer.phoneNumber,
        address: customer.address || '',
      });
    }
  }

  // Profile Photo
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
        this.error.set('Please select an image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.error.set('Image must be less than 2MB');
        return;
      }

      this.selectedFile.set(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.photoPreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  uploadPhoto() {
    const file = this.selectedFile();
    if (!file) return;

    this.uploadingPhoto.set(true);
    this.error.set(null);

    this.authService.uploadPhoto(file).subscribe({
      next: () => {
        this.uploadingPhoto.set(false);
        this.selectedFile.set(null);
        this.photoPreview.set(null);
        this.successMessage.set('Profile photo updated successfully');
        this.clearSuccessAfterDelay();
      },
      error: (err) => {
        this.uploadingPhoto.set(false);
        this.error.set(err.message || 'Failed to upload photo');
      },
    });
  }

  cancelPhotoUpload() {
    this.selectedFile.set(null);
    this.photoPreview.set(null);
  }

  // Profile Info
  saveProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.savingProfile.set(true);
    this.error.set(null);
    this.successMessage.set(null);

    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.savingProfile.set(false);
        this.successMessage.set('Profile updated successfully');
        this.clearSuccessAfterDelay();
      },
      error: (err) => {
        this.savingProfile.set(false);
        this.error.set(err.message || 'Failed to update profile');
      },
    });
  }

  // Password Change
  changePassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      this.passwordError.set('New passwords do not match');
      return;
    }

    this.savingPassword.set(true);
    this.passwordError.set(null);
    this.passwordSuccess.set(null);

    this.authService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.passwordSuccess.set('Password changed successfully');
        this.passwordForm.reset();
        this.clearPasswordSuccessAfterDelay();
      },
      error: (err) => {
        this.savingPassword.set(false);
        this.passwordError.set(err.message || 'Failed to change password');
      },
    });
  }

  // Getters for form validation
  get nameControl() {
    return this.profileForm.get('name');
  }

  get phoneControl() {
    return this.profileForm.get('phoneNumber');
  }

  get addressControl() {
    return this.profileForm.get('address');
  }

  get currentPasswordControl() {
    return this.passwordForm.get('currentPassword');
  }

  get newPasswordControl() {
    return this.passwordForm.get('newPassword');
  }

  get confirmPasswordControl() {
    return this.passwordForm.get('confirmPassword');
  }

  private clearSuccessAfterDelay() {
    setTimeout(() => this.successMessage.set(null), 5000);
  }

  private clearPasswordSuccessAfterDelay() {
    setTimeout(() => this.passwordSuccess.set(null), 5000);
  }
}
