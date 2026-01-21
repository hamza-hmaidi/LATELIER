import { Paginated } from './types';

export function paginate<T>(items: T[], page = 1, limit = 10): Paginated<T> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const total = items.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / safeLimit);
  const start = (safePage - 1) * safeLimit;

  return {
    data: items.slice(start, start + safeLimit),
    meta: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages
    }
  };
}
