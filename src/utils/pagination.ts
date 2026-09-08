export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNextPage: boolean;
  };
}

export function getPaginationParams(query: { limit?: string; page?: string }): PaginationParams {
  const limit = Math.min(parseInt(query.limit || "10") || 10, 50);
  const page = Math.max(parseInt(query.page || "1") || 1, 1);
  return { page, limit };
}

export function paginate<T>(items: T[], params: PaginationParams): PaginationResult<T> {
  const { page, limit } = params;
  const start = (page - 1) * limit;
  const end = start + limit;
  const data = items.slice(start, end);

  return {
    data,
    pagination: {
      page,
      limit,
      total: items.length,
      hasNextPage: end < items.length,
    },
  };
}
