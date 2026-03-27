'use client';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  isLoading?: boolean;
}

export function PaginationControls({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPrevPage,
  onNextPage,
  isLoading,
}: PaginationControlsProps) {
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  if (totalPages <= 1) return null;

  return (
    <div
      className="flex flex-col items-center gap-3 py-4 sm:flex-row sm:justify-between"
      style={{ color: 'var(--bb-ink-60)' }}
    >
      {/* Item range (desktop) */}
      <span className="hidden text-xs sm:block">
        Mostrando {from}-{to} de {totalCount} resultados
      </span>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrevPage}
          disabled={page <= 1 || isLoading}
          className="flex h-10 items-center gap-1 rounded-lg border px-3 text-sm font-medium transition-opacity disabled:opacity-40 sm:h-9 sm:px-3"
          style={{
            borderColor: 'var(--bb-glass-border)',
            backgroundColor: 'var(--bb-depth-2)',
            color: 'var(--bb-ink-80)',
          }}
          aria-label="Pagina anterior"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span className="hidden sm:inline">Anterior</span>
        </button>

        <span
          className="px-3 text-sm font-medium"
          style={{ color: 'var(--bb-ink-100)' }}
        >
          Pagina {page} de {totalPages}
        </span>

        <button
          onClick={onNextPage}
          disabled={page >= totalPages || isLoading}
          className="flex h-10 items-center gap-1 rounded-lg border px-3 text-sm font-medium transition-opacity disabled:opacity-40 sm:h-9 sm:px-3"
          style={{
            borderColor: 'var(--bb-glass-border)',
            backgroundColor: 'var(--bb-depth-2)',
            color: 'var(--bb-ink-80)',
          }}
          aria-label="Proxima pagina"
        >
          <span className="hidden sm:inline">Proxima</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Item range (mobile) */}
      <span className="text-xs sm:hidden">
        {from}-{to} de {totalCount}
      </span>
    </div>
  );
}
