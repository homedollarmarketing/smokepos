import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SeoService } from '../../core/services/seo.service';
import { ApiService } from '../../core/services/api.service';

interface CreateMessageDto {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent implements OnInit {
  private readonly seoService = inject(SeoService);
  private readonly apiService = inject(ApiService);

  // Form fields
  name = '';
  email = '';
  phone = '';
  subject = '';
  message = '';

  isSubmitting = signal(false);
  isSubmitted = signal(false);
  error = signal<string | null>(null);

  contactInfo = {
    phones: ['+256 759 204 449', '+256 791 063 897'],
    email: 'info@mrpauthenticautoparts.com',
    address: 'HAM Tower, Opposite Makerere University Main Gate, Kampala',
    hours: {
      weekdays: 'Mon-Sat: 8:30 AM - 9:00 PM',
      sunday: 'Sun: 10:00 AM - 4:00 PM',
    },
  };

  ngOnInit(): void {
    this.seoService.updateTags({
      title: 'Contact Us',
      description:
        'Get in touch with Mr. P Authentic Autoparts. Visit our showroom at HAM Tower, Kampala or contact us online.',
    });
  }

  onSubmit(): void {
    if (!this.name || !this.email || !this.subject || !this.message) return;

    this.isSubmitting.set(true);
    this.error.set(null);

    const messageData: CreateMessageDto = {
      name: this.name,
      email: this.email,
      phone: this.phone || undefined,
      subject: this.subject,
      message: this.message,
    };

    this.apiService
      .post<{ success: boolean; message: string }>('/site/messages', messageData)
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.isSubmitted.set(true);
          this.resetForm();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.error.set('Failed to send message. Please try again later.');
          console.error('Error sending message:', err);
        },
      });
  }

  resetForm(): void {
    this.name = '';
    this.email = '';
    this.phone = '';
    this.subject = '';
    this.message = '';
  }
}
