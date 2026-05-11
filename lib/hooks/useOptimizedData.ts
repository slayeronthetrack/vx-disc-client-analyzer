/**
 * Optimized data fetching hooks with memoization
 */

'use client';

import { useMemo, useState, useEffect } from 'react';

/**
 * Memoize expensive calculations
 */
export function useMemoizedStats<T>(data: T | null, calculator: (data: T) => any) {
  return useMemo(() => {
    if (!data) return null;
    return calculator(data);
  }, [data, calculator]);
}

/**
 * Debounce hook for search inputs
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Optimized pagination hook
 */
export function usePagination(totalItems: number, itemsPerPage: number, currentPage: number) {
  return useMemo(() => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    
    const hasNextPage = currentPage < totalPages;
    const hasPreviousPage = currentPage > 1;

    return {
      totalPages,
      startIndex,
      endIndex,
      hasNextPage,
      hasPreviousPage,
      currentPage,
      itemsPerPage,
    };
  }, [totalItems, itemsPerPage, currentPage]);
}

/**
 * Memoize filtered and sorted data
 */
export function useFilteredData<T>(
  data: T[],
  filters: Record<string, any>,
  filterFn: (item: T, filters: Record<string, any>) => boolean
) {
  return useMemo(() => {
    return data.filter(item => filterFn(item, filters));
  }, [data, filters, filterFn]);
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
}
