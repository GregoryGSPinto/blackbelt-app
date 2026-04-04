import { useState, useCallback } from 'react';

interface PaginationConfig {
  pageSize?: number;
  initialPage?: number;
}

interface PaginationState<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  isLoading: boolean;
  hasMore: boolean;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  setData: (data: T[], totalCount: number) => void;
  setLoading: (loading: boolean) => void;
}

export function usePagination<T>(config: PaginationConfig = {}): PaginationState<T> {
  const pageSize = config.pageSize || 20;
  const [page, setPage] = useState(config.initialPage || 1);
  const [data, setDataState] = useState<T[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const hasMore = page < totalPages;

  const setData = useCallback((newData: T[], count: number) => {
    setDataState(newData);
    setTotalCount(count);
  }, []);

  const nextPage = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1));
  }, []);

  const goToPage = useCallback(
    (target: number) => {
      setPage(Math.max(1, Math.min(target, totalPages)));
    },
    [totalPages]
  );

  return {
    data,
    page,
    pageSize,
    totalCount,
    totalPages,
    isLoading,
    hasMore,
    nextPage,
    prevPage,
    goToPage,
    setData,
    setLoading: setIsLoading,
  };
}
