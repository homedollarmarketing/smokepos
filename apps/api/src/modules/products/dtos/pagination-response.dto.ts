export interface PaginationMetaDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResultDto<T> {
  data: T[];
  pagination: PaginationMetaDto;
}
