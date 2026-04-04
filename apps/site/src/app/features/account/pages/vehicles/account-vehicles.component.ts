import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerVehiclesService } from '../../services/customer-vehicles.service';
import { Vehicle, Brand, CreateVehicleDto } from '../../models/vehicle.model';

@Component({
    selector: 'app-account-vehicles',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './account-vehicles.component.html',
    styleUrl: './account-vehicles.component.scss'
})
export class AccountVehiclesComponent implements OnInit {
    private readonly vehiclesService = inject(CustomerVehiclesService);
    private readonly fb = inject(FormBuilder);

    // State
    readonly vehicles = signal<Vehicle[]>([]);
    readonly brands = signal<Brand[]>([]);
    readonly loading = signal(false);
    readonly submitting = signal(false);
    readonly error = signal<string | null>(null);

    // Modal State
    readonly showModal = signal(false);
    readonly isEditMode = signal(false);
    readonly editingId = signal<string | null>(null);

    form: FormGroup = this.fb.group({
        name: ['', [Validators.required]],
        year: [new Date().getFullYear(), [Validators.required, Validators.min(1900), Validators.max(2030)]],
        brandId: [''],
        color: [''],
        numberPlate: [''],
        vinNumber: ['']
    });

    ngOnInit() {
        this.loadVehicles();
        this.loadBrands();
    }

    loadVehicles() {
        this.loading.set(true);
        this.vehiclesService.getMyVehicles().subscribe({
            next: (data) => {
                this.vehicles.set(data);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set('Failed to load vehicles');
                this.loading.set(false);
            }
        });
    }

    loadBrands() {
        // Assuming the service handles the response structure
        this.vehiclesService.getBrands().subscribe({
            next: (data: any) => {
                // Handle pagination if API returns { data: [], meta: {} }
                if (data.data && Array.isArray(data.data)) {
                    this.brands.set(data.data);
                } else if (Array.isArray(data)) {
                    this.brands.set(data);
                }
            },
            error: () => console.error('Failed to load brands')
        });
    }

    openAddModal() {
        this.isEditMode.set(false);
        this.editingId.set(null);
        this.form.reset({
            year: new Date().getFullYear()
        });
        this.showModal.set(true);
    }

    openEditModal(vehicle: Vehicle) {
        this.isEditMode.set(true);
        this.editingId.set(vehicle.id);
        this.form.patchValue({
            name: vehicle.name,
            year: vehicle.year,
            brandId: vehicle.brandId,
            color: vehicle.color,
            numberPlate: vehicle.numberPlate,
            vinNumber: vehicle.vinNumber
        });
        this.showModal.set(true);
    }

    closeModal() {
        this.showModal.set(false);
    }

    onSubmit() {
        if (this.form.invalid) return;

        this.submitting.set(true);
        const formData = this.form.value;

        // Fix brandId if empty string
        if (!formData.brandId) delete formData.brandId;

        const request = this.isEditMode() && this.editingId()
            ? this.vehiclesService.updateVehicle(this.editingId()!, formData)
            : this.vehiclesService.addVehicle(formData as CreateVehicleDto);

        request.subscribe({
            next: () => {
                this.loadVehicles();
                this.closeModal();
                this.submitting.set(false);
            },
            error: (err) => {
                this.error.set('Failed to save vehicle');
                this.submitting.set(false);
            }
        });
    }

    deleteVehicle(id: string) {
        if (!confirm('Are you sure you want to delete this vehicle?')) return;

        this.vehiclesService.deleteVehicle(id).subscribe({
            next: () => this.loadVehicles(),
            error: () => this.error.set('Failed to delete vehicle')
        });
    }
}
