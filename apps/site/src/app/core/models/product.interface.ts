// Product interface matching backend entity
export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    sku: string | null;
    images: string[] | null;
    categoryId: string | null;
    category: Category | null;
    brandId: string | null;
    brand: Brand | null;
    price: number;
    isActive: boolean;
    isFeatured: boolean;
    quantity: number;
    lowStockThreshold: number;
    createdAt: string;
    updatedAt: string;
}

// Category interface matching backend entity
export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Brand interface matching backend entity
export interface Brand {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logoUrl: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Pagination response from API
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    };
}

// API response wrapper
export interface ApiResponse<T> {
    success: boolean;
    payload: T;
    message?: string;
}
