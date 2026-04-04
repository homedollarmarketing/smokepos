import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

import { CustomersService } from '../../services/customers.service';
import { Customer, Vehicle, CreateVehicleDto } from '../../models/customer.model';
import { OrdersService, Order } from '../../../orders/services/orders.service';
import { ServiceBookingsService } from '../../../service-bookings/services/service-bookings.service';
import {
  ServiceBooking,
  getServiceTypeLabel,
  getBookingStatusLabel,
  getBookingStatusSeverity,
} from '../../../service-bookings/models/service-booking.model';

interface BrandOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TagModule,
    TableModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    ConfirmDialogModule,
    RouterLink,
  ],
  providers: [ConfirmationService],
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.scss',
})
export class CustomerDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly customersService = inject(CustomersService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly ordersService = inject(OrdersService);
  private readonly serviceBookingsService = inject(ServiceBookingsService);

  // State
  readonly customer = signal<Customer | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  // Orders state
  readonly orders = signal<Order[]>([]);
  readonly ordersLoading = signal(false);

  // Service bookings state
  readonly serviceBookings = signal<ServiceBooking[]>([]);
  readonly serviceBookingsLoading = signal(false);

  // Tab state
  activeTab = 'overview';

  // Vehicle dialog state
  showVehicleDialog = false;
  vehicleDialogMode: 'create' | 'edit' = 'create';
  editingVehicleId: string | null = null;
  vehicleForm: CreateVehicleDto = {
    name: '',
    year: new Date().getFullYear(),
    brandId: undefined,
    color: '',
    numberPlate: '',
    vinNumber: '',
  };

  // TODO: Load brands from API
  brands: BrandOption[] = [];

  // Helper methods for service bookings
  readonly getServiceTypeLabel = getServiceTypeLabel;
  readonly getBookingStatusLabel = getBookingStatusLabel;
  readonly getBookingStatusSeverity = getBookingStatusSeverity;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCustomer(id);
    }
  }

  loadCustomer(id: string) {
    this.isLoading.set(true);
    this.customersService.getCustomerById(id).subscribe({
      next: (customer) => {
        this.customer.set(customer);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load customer details');
        this.isLoading.set(false);
      },
    });
  }

  loadOrders(customerId: string) {
    this.ordersLoading.set(true);
    this.ordersService.getOrders({ page: 1, limit: 50, customerId }).subscribe({
      next: (response) => {
        this.orders.set(response.data);
        this.ordersLoading.set(false);
      },
      error: () => {
        this.ordersLoading.set(false);
      },
    });
  }

  loadServiceBookings(customerId: string) {
    this.serviceBookingsLoading.set(true);
    this.serviceBookingsService.getBookings({ page: 1, limit: 50, customerId }).subscribe({
      next: (response) => {
        this.serviceBookings.set(response.data);
        this.serviceBookingsLoading.set(false);
      },
      error: () => {
        this.serviceBookingsLoading.set(false);
      },
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    const c = this.customer();
    if (!c) return;

    // Lazy load data for tabs
    if (tab === 'orders' && this.orders().length === 0) {
      this.loadOrders(c.id);
    } else if (tab === 'services' && this.serviceBookings().length === 0) {
      this.loadServiceBookings(c.id);
    }
  }

  getOrderStatusSeverity(
    status: string
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: Record<
      string,
      'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'
    > = {
      pending: 'warn',
      confirmed: 'info',
      processing: 'info',
      shipped: 'info',
      delivered: 'success',
      cancelled: 'danger',
    };
    return severities[status] || 'secondary';
  }

  onEdit() {
    const c = this.customer();
    if (c) {
      this.router.navigate(['/customers', c.id, 'edit']);
    }
  }

  onDelete() {
    const c = this.customer();
    if (!c) return;

    this.confirmationService.confirm({
      message: `Are you sure you want to delete customer "${c.name}"? This will also delete all their vehicles.`,
      header: 'Delete Customer',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.customersService.deleteCustomer(c.id).subscribe({
          next: () => {
            this.router.navigate(['/customers']);
          },
          error: (err) => {
            this.error.set(err.error?.message || 'Failed to delete customer');
          },
        });
      },
    });
  }

  onBack() {
    this.router.navigate(['/customers']);
  }

  // ========== Vehicle Management ==========

  openAddVehicleDialog() {
    this.vehicleDialogMode = 'create';
    this.editingVehicleId = null;
    this.vehicleForm = {
      name: '',
      year: new Date().getFullYear(),
      brandId: undefined,
      color: '',
      numberPlate: '',
      vinNumber: '',
    };
    this.showVehicleDialog = true;
  }

  openEditVehicleDialog(vehicle: Vehicle) {
    this.vehicleDialogMode = 'edit';
    this.editingVehicleId = vehicle.id;
    this.vehicleForm = {
      name: vehicle.name,
      year: vehicle.year,
      brandId: vehicle.brandId || undefined,
      color: vehicle.color || '',
      numberPlate: vehicle.numberPlate || '',
      vinNumber: vehicle.vinNumber || '',
    };
    this.showVehicleDialog = true;
  }

  saveVehicle() {
    const c = this.customer();
    if (!c) return;

    if (this.vehicleDialogMode === 'create') {
      this.customersService.createVehicle(c.id, this.vehicleForm).subscribe({
        next: () => {
          this.showVehicleDialog = false;
          this.loadCustomer(c.id);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to add vehicle');
        },
      });
    } else if (this.editingVehicleId) {
      this.customersService.updateVehicle(c.id, this.editingVehicleId, this.vehicleForm).subscribe({
        next: () => {
          this.showVehicleDialog = false;
          this.loadCustomer(c.id);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to update vehicle');
        },
      });
    }
  }

  deleteVehicle(vehicle: Vehicle) {
    const c = this.customer();
    if (!c) return;

    this.confirmationService.confirm({
      message: `Are you sure you want to delete vehicle "${vehicle.name}"?`,
      header: 'Delete Vehicle',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.customersService.deleteVehicle(c.id, vehicle.id).subscribe({
          next: () => {
            this.loadCustomer(c.id);
          },
          error: (err) => {
            this.error.set(err.error?.message || 'Failed to delete vehicle');
          },
        });
      },
    });
  }
}
