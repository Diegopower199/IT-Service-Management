export interface PaginationParams {
  page: number;
  size: number;
  sort: string;
}

export interface SortResponse {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface PageableResponse {
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  sort: SortResponse;
  unpaged: boolean;
}

export interface PageResponse<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: PageableResponse;
  size: number;
  sort: SortResponse;
  totalElements: number;
  totalPages: number;
}
