import { Type } from 'class-transformer';
import { IsInt, Min, Max, IsOptional } from 'class-validator';

/**
 * Standard pagination query parameters
 * - page: 1-indexed page number (default: 1)
 * - limit: items per page (default: 20, max: 100)
 */
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100, { message: 'Maximum page size is 100' })
  limit: number = 20;
}

/**
 * Pagination metadata in response
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Standard paginated response shape
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Helper to create pagination meta from query and total count
 */
export function createPaginationMeta(
  query: PaginationQueryDto,
  total: number,
): PaginationMeta {
  const { page, limit } = query;
  return {
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}
