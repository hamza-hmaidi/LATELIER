import { Paginated } from './types';

export function paginate<T>(items: T[], page = 1, limit = 10): Paginated<T> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const total = items.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / safeLimit);
  const start = (safePage - 1) * safeLimit;
  const isOutOfRange = total === 0 || start >= total;
  const data = isOutOfRange ? [] : items.slice(start, start + safeLimit);
  const metaTotal = isOutOfRange ? 0 : total;
  const metaTotalPages = isOutOfRange ? 0 : totalPages;

  return {
    data,
    meta: {
      total: metaTotal,
      page: safePage,
      limit: safeLimit,
      totalPages: metaTotalPages
    }
  };
}
