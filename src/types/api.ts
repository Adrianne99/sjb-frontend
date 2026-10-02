// Shapes of the backend's JSON responses.

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** Every successful response: { success: true, data, message?, meta? } */
export interface ApiEnvelope<T> {
  success: true;
  data: T;
  message?: string;
  meta?: PaginationMeta;
  /** Some list endpoints add extra info (e.g. `summary`, `currentTerm`). */
  [extra: string]: unknown;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

/** Query-string values accepted by list endpoints. */
export type QueryParams = Record<string, string | number | boolean | null | undefined>;
