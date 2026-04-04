import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService } from 'primeng/api';

import { ServiceBookingsService } from '../../services/service-bookings.service';
import {
  ServiceBooking,
  AdminCreateServiceBookingDto,
  UpdateServiceBookingDto,
  ServiceType,
  BookingStatus,
  SERVICE_TYPE_LABELS,
  BOOKING_STATUS_LABELS,
} from '../../models/service-booking.model';
import { CustomersService } from '../../../customers/services/customers.service';
import {
  Customer,
  Vehicle,
  CreateCustomerDto,
  CreateVehicleDto,
} from '../../../customers/models/customer.model';
import { BranchService } from '../../../../core/services/branch.service';
import { PaginationMeta, DEFAULT_LIMIT } from '../../../../shared/models/pagination.model';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    DatePickerModule,
    InputNumberModule,
    DialogModule,
    TableModule,
    ToastModule,
    IconFieldModule,
    InputIconModule,
  ],
  providers: [MessageService],
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.scss',
})
export class BookingFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(ServiceBookingsService);
  private readonly customersService = inject(CustomersService);
  private readonly branchService = inject(BranchService);
  private readonly messageService = inject(MessageService);

  // Form state
  readonly form: FormGroup;
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly isEditMode = signal(false);
  readonly bookingId = signal<string | null>(null);
  readonly selectedBooking = signal<ServiceBooking | null>(null);

  // Min date for calendar (today)
  readonly minDate = new Date();

  // Selected data
  readonly selectedCustomer = signal<Customer | null>(null);
  readonly selectedVehicle = signal<Vehicle | null>(null);
  readonly customerVehicles = signal<Vehicle[]>([]);

  // Customer selection modal
  readonly showCustomerModal = signal(false);
  readonly customerSearchQuery = signal('');
  readonly customers = signal<Customer[]>([]);
  readonly customerPagination = signal<PaginationMeta>({
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    totalPages: 1,
  });
  readonly isLoadingCustomers = signal(false);

  // Computed for pagination
  readonly canGoPrevCustomers = computed(() => this.customerPagination().page > 1);
  readonly canGoNextCustomers = computed(
    () => this.customerPagination().page < this.customerPagination().totalPages
  );

  // Customer creation modal
  readonly showCreateCustomerModal = signal(false);
  readonly customerForm: FormGroup;
  readonly isCreatingCustomer = signal(false);

  // Vehicle selection modal
  readonly showVehicleModal = signal(false);
  readonly isLoadingVehicles = signal(false);

  // Vehicle creation modal
  readonly showCreateVehicleModal = signal(false);
  readonly vehicleForm: FormGroup;
  readonly isCreatingVehicle = signal(false);

  // Branch
  readonly currentBranchId = this.branchService.currentBranchId;

  // Computed
  readonly hasCustomer = computed(() => this.selectedCustomer() !== null);
  readonly hasVehicle = computed(() => this.selectedVehicle() !== null);
  readonly pageTitle = computed(() =>
    this.isEditMode() ? 'Edit Service Booking' : 'New Service Booking'
  );

  // Stepper
  readonly currentStep = computed(() => {
    if (!this.hasCustomer()) return 1;
    if (!this.hasVehicle()) return 2;
    if (!this.form.get('serviceType')?.value) return 3;
    return 4;
  });

  // Service type icons mapping
  private readonly serviceTypeIcons: Record<string, string> = {
    maintenance: 'pi pi-wrench',
    repair: 'pi pi-tools',
    diagnostic: 'pi pi-search',
    oil_change: 'pi pi-filter',
    brake_service: 'pi pi-stop-circle',
    tire_service: 'pi pi-circle',
    electrical: 'pi pi-bolt',
    engine: 'pi pi-cog',
    transmission: 'pi pi-sync',
    suspension: 'pi pi-arrows-v',
    other: 'pi pi-ellipsis-h',
  };

  // Dropdown options
  readonly serviceTypeOptions = Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => ({
    label,
    value,
    icon: this.getServiceTypeIcon(value),
  }));

  readonly statusOptions = Object.entries(BOOKING_STATUS_LABELS).map(([value, label]) => ({
    label,
    value,
  }));

  getServiceTypeIcon(serviceType: string): string {
    return this.serviceTypeIcons[serviceType] || 'pi pi-wrench';
  }

  getServiceTypeLabel(serviceType: string): string {
    return SERVICE_TYPE_LABELS[serviceType as ServiceType] || serviceType;
  }

  getStatusLabel(status: string | undefined): string {
    if (!status) return '';
    return BOOKING_STATUS_LABELS[status as BookingStatus] || status;
  }

  constructor() {
    // Main booking form
    this.form = this.fb.group({
      serviceType: ['', Validators.required],
      preferredDate: [null, Validators.required],
      preferredTime: [''],
      serviceNotes: [''],
      estimatedCost: [null],
      actualCost: [null],
      adminNotes: [''],
      status: [BookingStatus.PENDING],
    });

    // Customer creation form
    this.customerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.required, Validators.minLength(9)]],
      email: ['', Validators.email],
      address: [''],
    });

    // Vehicle creation form
    this.vehicleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      year: [
        new Date().getFullYear(),
        [Validators.required, Validators.min(1900), Validators.max(2100)],
      ],
      color: [''],
      numberPlate: [''],
      vinNumber: [''],
    });
  }

  ngOnInit() {
    // Check if editing
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.bookingId.set(id);
      this.isEditMode.set(true);
      this.loadBooking(id);
    }
  }

  loadBooking(id: string) {
    this.isLoading.set(true);
    this.service.getBookingById(id).subscribe({
      next: (booking) => {
        // Set customer and vehicle
        if (booking.customer) {
          this.selectedCustomer.set(booking.customer);
          if (booking.customer.vehicles) {
            this.customerVehicles.set(booking.customer.vehicles);
          }
        }
        if (booking.vehicle) {
          this.selectedVehicle.set(booking.vehicle);
        }

        // Store the booking for status display
        this.selectedBooking.set(booking);

        // Patch form
        this.form.patchValue({
          serviceType: booking.serviceType,
          preferredDate: booking.preferredDate ? new Date(booking.preferredDate) : null,
          preferredTime: booking.preferredTime || '',
          serviceNotes: booking.serviceNotes || '',
          estimatedCost: booking.estimatedCost,
          actualCost: booking.actualCost,
          adminNotes: booking.adminNotes || '',
          status: booking.status,
        });

        this.isLoading.set(false);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'Failed to load booking',
        });
        this.isLoading.set(false);
        this.router.navigate(['/service-bookings']);
      },
    });
  }

  // ========== Customer Selection ==========

  openCustomerModal() {
    this.showCustomerModal.set(true);
    this.customerSearchQuery.set('');
    this.loadCustomers(1);
  }

  closeCustomerModal() {
    this.showCustomerModal.set(false);
  }

  loadCustomers(page: number = 1) {
    this.isLoadingCustomers.set(true);
    const search = this.customerSearchQuery();

    this.customersService
      .getCustomers({
        page,
        limit: DEFAULT_LIMIT,
        search: search || undefined,
        branchId: this.currentBranchId() || undefined,
      })
      .subscribe({
        next: (response) => {
          this.customers.set(response.data);
          this.customerPagination.set(response.pagination);
          this.isLoadingCustomers.set(false);
        },
        error: () => {
          this.isLoadingCustomers.set(false);
        },
      });
  }

  searchCustomers() {
    this.loadCustomers(1);
  }

  onPrevCustomerPage() {
    if (this.canGoPrevCustomers()) {
      this.loadCustomers(this.customerPagination().page - 1);
    }
  }

  onNextCustomerPage() {
    if (this.canGoNextCustomers()) {
      this.loadCustomers(this.customerPagination().page + 1);
    }
  }

  selectCustomer(customer: Customer) {
    this.selectedCustomer.set(customer);
    this.selectedVehicle.set(null); // Reset vehicle selection
    this.closeCustomerModal();

    // Load customer's vehicles
    this.loadCustomerVehicles(customer.id);
  }

  clearCustomer() {
    this.selectedCustomer.set(null);
    this.selectedVehicle.set(null);
    this.customerVehicles.set([]);
  }

  // ========== Customer Creation ==========

  openCreateCustomerModal() {
    this.closeCustomerModal();
    this.customerForm.reset();
    this.showCreateCustomerModal.set(true);
  }

  closeCreateCustomerModal() {
    this.showCreateCustomerModal.set(false);
  }

  createCustomer() {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }

    this.isCreatingCustomer.set(true);
    const data: CreateCustomerDto = this.customerForm.value;

    this.customersService.createCustomer(data, this.currentBranchId() || undefined).subscribe({
      next: (customer) => {
        this.selectedCustomer.set(customer);
        this.customerVehicles.set(customer.vehicles || []);
        this.selectedVehicle.set(null);
        this.isCreatingCustomer.set(false);
        this.closeCreateCustomerModal();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Customer created successfully',
        });
      },
      error: (err) => {
        this.isCreatingCustomer.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'Failed to create customer',
        });
      },
    });
  }

  // ========== Vehicle Selection ==========

  loadCustomerVehicles(customerId: string) {
    this.isLoadingVehicles.set(true);
    this.customersService.getVehicles(customerId).subscribe({
      next: (vehicles) => {
        this.customerVehicles.set(vehicles);
        this.isLoadingVehicles.set(false);
      },
      error: () => {
        this.customerVehicles.set([]);
        this.isLoadingVehicles.set(false);
      },
    });
  }

  openVehicleModal() {
    if (!this.selectedCustomer()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select a customer first',
      });
      return;
    }
    this.showVehicleModal.set(true);
  }

  closeVehicleModal() {
    this.showVehicleModal.set(false);
  }

  selectVehicle(vehicle: Vehicle) {
    this.selectedVehicle.set(vehicle);
    this.closeVehicleModal();
  }

  clearVehicle() {
    this.selectedVehicle.set(null);
  }

  // ========== Vehicle Creation ==========

  openCreateVehicleModal() {
    if (!this.selectedCustomer()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select a customer first',
      });
      return;
    }
    this.closeVehicleModal();
    this.vehicleForm.reset({ year: new Date().getFullYear() });
    this.showCreateVehicleModal.set(true);
  }

  closeCreateVehicleModal() {
    this.showCreateVehicleModal.set(false);
  }

  createVehicle() {
    if (this.vehicleForm.invalid || !this.selectedCustomer()) {
      this.vehicleForm.markAllAsTouched();
      return;
    }

    this.isCreatingVehicle.set(true);
    const data: CreateVehicleDto = this.vehicleForm.value;

    this.customersService.createVehicle(this.selectedCustomer()!.id, data).subscribe({
      next: (vehicle) => {
        // Add to list and select
        this.customerVehicles.update((v) => [...v, vehicle]);
        this.selectedVehicle.set(vehicle);
        this.isCreatingVehicle.set(false);
        this.closeCreateVehicleModal();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Vehicle added successfully',
        });
      },
      error: (err) => {
        this.isCreatingVehicle.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'Failed to add vehicle',
        });
      },
    });
  }

  // ========== Form Submission ==========

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.selectedCustomer()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select a customer',
      });
      return;
    }

    if (!this.selectedVehicle()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select a vehicle',
      });
      return;
    }

    this.isSaving.set(true);

    const formValue = this.form.value;
    const preferredDate = formValue.preferredDate
      ? this.formatDateForApi(formValue.preferredDate)
      : null;

    if (this.isEditMode()) {
      const updateData: UpdateServiceBookingDto = {
        serviceType: formValue.serviceType,
        preferredDate,
        preferredTime: formValue.preferredTime || null,
        serviceNotes: formValue.serviceNotes || null,
        estimatedCost: formValue.estimatedCost,
        actualCost: formValue.actualCost,
        adminNotes: formValue.adminNotes || null,
        status: formValue.status,
        vehicleId: this.selectedVehicle()!.id,
      };

      this.service.updateBooking(this.bookingId()!, updateData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Booking updated successfully',
          });
          this.isSaving.set(false);
          this.router.navigate(['/service-bookings', this.bookingId()]);
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.message || 'Failed to update booking',
          });
          this.isSaving.set(false);
        },
      });
    } else {
      const createData: AdminCreateServiceBookingDto = {
        customerId: this.selectedCustomer()!.id,
        vehicleId: this.selectedVehicle()!.id,
        serviceType: formValue.serviceType as ServiceType,
        preferredDate: preferredDate!,
        preferredTime: formValue.preferredTime || undefined,
        serviceNotes: formValue.serviceNotes || undefined,
        estimatedCost: formValue.estimatedCost,
        adminNotes: formValue.adminNotes || undefined,
      };

      this.service.createBooking(createData).subscribe({
        next: (booking) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Booking created successfully',
          });
          this.isSaving.set(false);
          this.router.navigate(['/service-bookings', booking.id]);
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.message || 'Failed to create booking',
          });
          this.isSaving.set(false);
        },
      });
    }
  }

  onCancel() {
    this.router.navigate(['/service-bookings']);
  }

  private formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getVehicleDisplay(vehicle: Vehicle): string {
    return `${vehicle.year} ${vehicle.name}${vehicle.numberPlate ? ' - ' + vehicle.numberPlate : ''}`;
  }
}
