'use client';

import { forwardRef, useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  globalSearch,
  getCommands,
  type SearchResultGroup,
} from '@/lib/api/search.service';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { SearchIcon } from '@/components/shell/icons';

// ── Constants ──────────────────────────────────────────────────────────

const GROUP_LABELS: Record<SearchResultGroup, string> = {
  alunos: 'Alunos',
  turmas: 'Turmas',
  videos: 'Videos',
  leads: 'Leads',
  comunicados: 'Comunicados',
  paginas: 'Paginas',
};

const GROUP_ORDER: SearchResultGroup[] = ['alunos', 'turmas', 'videos', 'comunicados', 'paginas', 'leads'];

// ── Types ──────────────────────────────────────────────────────────────

interface ResultItem {
  type: 'search' | 'command';
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  url: string;
  group?: SearchResultGroup;
}

interface CommandPaletteProps {
  /** Controlled open state (optional — uncontrolled by default) */
  open?: boolean;
  /** Called when the palette wants to change its open state */
  onOpenChange?: (open: boolean) => void;
  /** If true, the built-in toggle button is hidden (parent provides its own trigger) */
  hideToggle?: boolean;
}

// ── Component ──────────────────────────────────────────────────────────

const CommandPalette = forwardRef<HTMLDivElement, CommandPaletteProps>(
  function CommandPalette({ open: controlledOpen, onOpenChange, hideToggle }, ref) {
    const router = useRouter();
    const [internalOpen, setInternalOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [items, setItems] = useState<ResultItem[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;

    const setOpen = useCallback(
      (value: boolean) => {
        if (onOpenChange) onOpenChange(value);
        if (!isControlled) setInternalOpen(value);
      },
      [isControlled, onOpenChange],
    );

    // ── Keyboard shortcut: Cmd+K ───────────────────────────────────────

    useEffect(() => {
      function handleKeyDown(e: KeyboardEvent) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          setOpen(!isOpen);
        }
      }
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, setOpen]);

    // ── Focus input when opened ────────────────────────────────────────

    useEffect(() => {
      if (isOpen) {
        setTimeout(() => inputRef.current?.focus(), 50);
      } else {
        setQuery('');
        setItems([]);
        setSelectedIndex(0);
      }
    }, [isOpen]);

    // ── Search with debounce ───────────────────────────────────────────

    const performSearch = useCallback(
      async (searchQuery: string) => {
        if (!searchQuery.trim()) {
          setItems([]);
          setLoading(false);
          return;
        }

        // Commands mode: "/" prefix
        if (searchQuery.startsWith('/')) {
          const commands = getCommands();
          const commandQuery = searchQuery.slice(1).toLowerCase();
          const filtered = commands.filter(
            (c) =>
              c.label.toLowerCase().includes(commandQuery) ||
              c.description.toLowerCase().includes(commandQuery),
          );
          setItems(
            filtered.map(
              (c): ResultItem => ({
                type: 'command',
                id: c.id,
                icon: c.icon,
                title: c.label,
                subtitle: c.description,
                url: c.url,
              }),
            ),
          );
          setSelectedIndex(0);
          setLoading(false);
          return;
        }

        // Regular search mode
        setLoading(true);
        try {
          const response = await globalSearch(searchQuery, getActiveAcademyId());
          setItems(
            response.results.map(
              (r): ResultItem => ({
                type: 'search',
                id: r.id,
                icon: r.icon,
                title: r.title,
                subtitle: r.subtitle,
                url: r.url,
                group: r.group,
              }),
            ),
          );
          setSelectedIndex(0);
        } catch {
          setItems([]);
        } finally {
          setLoading(false);
        }
      },
      [],
    );

    useEffect(() => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        performSearch(query);
      }, 300);
      return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
      };
    }, [query, performSearch]);

    // ── Navigation ─────────────────────────────────────────────────────

    function handleSelect(item: ResultItem) {
      setOpen(false);
      router.push(item.url);
    }

    function handleKeyDown(e: React.KeyboardEvent) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (items[selectedIndex]) handleSelect(items[selectedIndex]);
          break;
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          break;
      }
    }

    // ── Group results ──────────────────────────────────────────────────

    function groupResults(): { group: string; items: ResultItem[] }[] {
      const commandItems = items.filter((i) => i.type === 'command');
      const searchItems = items.filter((i) => i.type === 'search');

      const groups: { group: string; items: ResultItem[] }[] = [];

      if (commandItems.length > 0) {
        groups.push({ group: 'Comandos', items: commandItems });
      }

      for (const groupKey of GROUP_ORDER) {
        const groupItems = searchItems.filter((i) => i.group === groupKey);
        if (groupItems.length > 0) {
          groups.push({ group: GROUP_LABELS[groupKey], items: groupItems });
        }
      }

      return groups;
    }

    // ── Flat index helper ──────────────────────────────────────────────

    function getFlatIndex(groupIndex: number, itemIndex: number): number {
      const grouped = groupResults();
      let idx = 0;
      for (let g = 0; g < groupIndex; g++) {
        idx += grouped[g].items.length;
      }
      return idx + itemIndex;
    }

    if (!isOpen) {
      if (hideToggle) return null;
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm transition-colors"
          style={{
            borderRadius: 'var(--bb-radius-sm)',
            background: 'var(--bb-depth-3)',
            color: 'var(--bb-ink-60)',
          }}
          aria-label="Buscar"
        >
          <SearchIcon className="h-4 w-4" />
        </button>
      );
    }

    const grouped = groupResults();

    return (
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 z-50 backdrop-blur-sm"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />

        {/* Palette */}
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label="Busca rapida"
          className="fixed inset-x-4 top-20 z-50 mx-auto max-w-xl overflow-hidden shadow-2xl md:inset-x-auto"
          style={{
            background: 'var(--bb-depth-3)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
            animation: 'scaleIn 0.15s ease-out',
          }}
        >
          {/* Search Input */}
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
          >
            <SearchIcon className="h-5 w-5 shrink-0" style={{ color: 'var(--bb-ink-60)' }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Buscar alunos, turmas, videos... ou "/" para comandos'
              className="flex-1 bg-transparent text-sm focus:outline-none"
              style={{ color: 'var(--bb-ink-100)' }}
            />
            <kbd
              className="hidden px-1.5 py-0.5 text-[10px] font-medium md:inline"
              style={{
                borderRadius: 'var(--bb-radius-sm)',
                background: 'var(--bb-depth-4)',
                color: 'var(--bb-ink-60)',
              }}
            >
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="px-4 py-6 text-center text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                Buscando...
              </div>
            )}

            {!loading && query.trim() && items.length === 0 && (
              <div className="px-4 py-6 text-center text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                Nenhum resultado para &quot;{query}&quot;
              </div>
            )}

            {!loading && !query.trim() && (
              <div className="px-4 py-6 text-center text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                <p>
                  Digite para buscar ou{' '}
                  <kbd
                    className="px-1 text-[10px]"
                    style={{ borderRadius: 'var(--bb-radius-sm)', background: 'var(--bb-depth-4)' }}
                  >
                    /
                  </kbd>{' '}
                  para comandos
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                  Atalho:{' '}
                  <kbd
                    className="px-1 text-[10px]"
                    style={{ borderRadius: 'var(--bb-radius-sm)', background: 'var(--bb-depth-4)' }}
                  >
                    Cmd+K
                  </kbd>
                </p>
              </div>
            )}

            {!loading &&
              grouped.map((group, gIdx) => (
                <div key={group.group}>
                  <div
                    className="sticky top-0 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' }}
                  >
                    {group.group}
                  </div>
                  {group.items.map((item, iIdx) => {
                    const flatIdx = getFlatIndex(gIdx, iIdx);
                    const isSelected = flatIdx === selectedIndex;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(flatIdx)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors"
                        style={{
                          background: isSelected ? 'var(--bb-brand-surface)' : 'transparent',
                          color: isSelected ? 'var(--bb-brand)' : 'var(--bb-ink-100)',
                        }}
                      >
                        <span className="shrink-0 text-base">{item.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{item.title}</p>
                          <p className="truncate text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                            {item.subtitle}
                          </p>
                        </div>
                        {isSelected && (
                          <kbd
                            className="shrink-0 px-1.5 py-0.5 text-[10px]"
                            style={{
                              borderRadius: 'var(--bb-radius-sm)',
                              background: 'var(--bb-depth-4)',
                              color: 'var(--bb-ink-60)',
                            }}
                          >
                            Enter
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
          </div>

          {/* Footer hints */}
          <div
            className="flex items-center gap-4 px-4 py-2 text-[10px]"
            style={{ borderTop: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-60)' }}
          >
            <span>
              <kbd
                className="px-1"
                style={{ borderRadius: 'var(--bb-radius-sm)', background: 'var(--bb-depth-4)' }}
              >
                ↑↓
              </kbd>{' '}
              navegar
            </span>
            <span>
              <kbd
                className="px-1"
                style={{ borderRadius: 'var(--bb-radius-sm)', background: 'var(--bb-depth-4)' }}
              >
                Enter
              </kbd>{' '}
              selecionar
            </span>
            <span>
              <kbd
                className="px-1"
                style={{ borderRadius: 'var(--bb-radius-sm)', background: 'var(--bb-depth-4)' }}
              >
                Esc
              </kbd>{' '}
              fechar
            </span>
          </div>
        </div>
      </>
    );
  },
);

CommandPalette.displayName = 'CommandPalette';

export { CommandPalette };
export type { CommandPaletteProps };
