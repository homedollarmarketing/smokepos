import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Vehicle, CreateVehicleDto, UpdateVehicleDto, Brand } from '../models/vehicle.model';
import { PaginatedResponse } from '../../../core/models/product.interface';

@Injectable({
    providedIn: 'root'
})
export class CustomerVehiclesService {
    private readonly apiUrl = `${environment.apiUrl}/customers/me/vehicles`;
    private readonly brandsUrl = `${environment.apiUrl}/site/brands`;
    private readonly http = inject(HttpClient);

    /**
     * Get my vehicles
     */
    getMyVehicles(): Observable<Vehicle[]> {
        return this.http.get<Vehicle[]>(this.apiUrl);
    }

    /**
     * Add a new vehicle
     */
    addVehicle(data: CreateVehicleDto): Observable<Vehicle> {
        return this.http.post<Vehicle>(this.apiUrl, data);
    }

    /**
     * Update a vehicle
     */
    updateVehicle(id: string, data: UpdateVehicleDto): Observable<Vehicle> {
        return this.http.patch<Vehicle>(`${this.apiUrl}/${id}`, data);
    }

    /**
     * Delete a vehicle
     */
    deleteVehicle(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    /**
     * Get available brands
     */
    getBrands(): Observable<Brand[]> {
        return this.http.get<PaginatedResponse<Brand>>(this.brandsUrl).pipe(
            map(response => response.data)
        );
    }
}
