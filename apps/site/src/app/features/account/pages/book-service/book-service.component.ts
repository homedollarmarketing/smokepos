import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ServiceBookingsService } from '../../services/service-bookings.service';
import { CustomerVehiclesService } from '../../services/customer-vehicles.service';
import {
  CreateServiceBookingDto,
  ServiceType,
  SERVICE_TYPE_LABELS,
} from '../../models/service-booking.model';
import { Vehicle } from '../../models/vehicle.model';

@Component({
  selector: 'app-book-service',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './book-service.component.html',
  styleUrl: './book-service.component.scss',
})
export class BookServiceComponent implements OnInit {
  private readonly bookingsService = inject(ServiceBookingsService);
  private readonly vehiclesService = inject(CustomerVehiclesService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  // State
  readonly vehicles = signal<Vehicle[]>([]);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  // Service Types for dropdown
  readonly serviceTypes: { value: ServiceType; label: string }[] = [
    { value: 'maintenance', label: SERVICE_TYPE_LABELS.maintenance },
    { value: 'repair', label: SERVICE_TYPE_LABELS.repair },
    { value: 'diagnostic', label: SERVICE_TYPE_LABELS.diagnostic },
    { value: 'inspection', label: SERVICE_TYPE_LABELS.inspection },
    { value: 'detailing', label: SERVICE_TYPE_LABELS.detailing },
    { value: 'other', label: SERVICE_TYPE_LABELS.other },
  ];

  // Get minimum date (today)
  readonly minDate = new Date().toISOString().split('T')[0];

  form: FormGroup = this.fb.group({
    vehicleId: ['', [Validators.required]],
    serviceType: ['maintenance', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    serviceNotes: [''],
    preferredDate: ['', [Validators.required]],
    preferredTime: [''],
  });

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    this.loading.set(true);
    this.vehiclesService.getMyVehicles().subscribe({
      next: (data) => {
        this.vehicles.set(data);
        this.loading.set(false);

        // If no vehicles, redirect to vehicles page
        if (data.length === 0) {
          this.router.navigate(['/account/vehicles']);
        }
      },
      error: () => {
        this.error.set('Failed to load vehicles');
        this.loading.set(false);
      },
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.submitting.set(true);
    this.error.set(null);

    const formData: CreateServiceBookingDto = {
      vehicleId: this.form.value.vehicleId,
      serviceType: this.form.value.serviceType,
      description: this.form.value.description,
      serviceNotes: this.form.value.serviceNotes || undefined,
      preferredDate: this.form.value.preferredDate,
      preferredTime: this.form.value.preferredTime || undefined,
    };

    this.bookingsService.createBooking(formData).subscribe({
      next: () => {
        // Navigate back to bookings list with success message
        this.router.navigate(['/account/service'], {
          queryParams: { booked: 'success' },
        });
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to create booking');
        this.submitting.set(false);
      },
    });
  }

  goBack() {
    this.router.navigate(['/account/service']);
  }
}
