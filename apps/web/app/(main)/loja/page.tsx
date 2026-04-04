'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { listProducts, type Product, type ProductCategory } from '@/lib/api/store.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCart } from '@/lib/hooks/useCart';
import { useToast } from '@/lib/hooks/useToast';
import { SearchIcon, ShoppingCartIcon, FilterIcon, XIcon } from '@/components/shell/icons';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';

// -- Constants ---------------------------------------------------------------

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  quimono: 'Quimonos',
  faixa: 'Faixas',
  equipamento: 'Equipamentos',
  acessorio: 'Acessorios',
  vestuario: 'Vestuario',
  suplemento: 'Suplementos',
};

const CATEGORY_TABS: { key: string; label: string }[] = [
  { key: '', label: 'Todos' },
  { key: 'quimono', label: 'Quimonos' },
  { key: 'faixa', label: 'Faixas' },
  { key: 'equipamento', label: 'Equipamentos' },
  { key: 'acessorio', label: 'Acessorios' },
  { key: 'vestuario', label: 'Vestuario' },
  { key: 'suplemento', label: 'Suplementos' },
];

type SortOption = 'popular' | 'price_asc' | 'price_desc' | 'newest';

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'popular', label: 'Popular' },
  { key: 'price_asc', label: 'Preco menor' },
  { key: 'price_desc', label: 'Preco maior' },
  { key: 'newest', label: 'Mais novos' },
];

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function isNewProduct(createdAt: string): boolean {
  const created = new Date(createdAt);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return created >= sevenDaysAgo;
}

/** Renders 1-5 filled/empty stars */
function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-px">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill={star <= Math.round(rating) ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={star <= Math.round(rating) ? 0 : 1.5}
          style={{
            width: size,
            height: size,
            color: star <= Math.round(rating) ? '#FBBF24' : 'var(--bb-ink-20)',
          }}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

// -- Page --------------------------------------------------------------------

export default function LojaPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const { cartCount, addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    listProducts(getActiveAcademyId())
      .then(setProducts)
      .catch((err) => toast(translateError(err), 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (activeCategory && p.category !== activeCategory) return false;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    // Sort
    switch (sortBy) {
      case 'popular':
        result = [...result].sort((a, b) => (b.sold_count ?? 0) - (a.sold_count ?? 0));
        break;
      case 'price_asc':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return result;
  }, [products, activeCategory, debouncedSearch, sortBy]);

  function handleQuickAdd(product: Product) {
    const variant = product.variants[0];
    if (!variant || product.status === 'out_of_stock') return;
    addItem({
      product_id: product.id,
      product_name: product.name,
      product_image: product.images[0] ?? '',
      variant_id: variant.id,
      variant_name: variant.name,
      unit_price: variant.price ?? product.price,
    });
    toast(`${product.name} adicionado ao carrinho`, 'success');
  }

  // -- Skeleton loading ------------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="text" className="h-10 w-full" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="text" className="h-8 w-24" />)}
        </div>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} variant="card" className="h-72" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-5 p-4 sm:p-6 overflow-x-hidden" data-stagger>
      {/* -- Header --------------------------------------------------------- */}
      <section className="animate-reveal flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>
            Loja
          </h1>
          <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
            Produtos oficiais da academia
          </p>
        </div>
        <Link
          href="/carrinho"
          className="relative flex items-center gap-2 rounded-lg px-4 py-2 min-h-[44px] text-sm font-medium transition-all hover:opacity-80"
          style={{
            background: 'var(--bb-brand)',
            color: '#fff',
          }}
        >
          <ShoppingCartIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Carrinho</span>
          {cartCount > 0 && (
            <span
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ background: '#EF4444' }}
            >
              {cartCount}
            </span>
          )}
        </Link>
      </section>

      {/* -- Search --------------------------------------------------------- */}
      <section className="animate-reveal">
        <div className="relative">
          <SearchIcon
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: 'var(--bb-ink-40)' }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produto..."
            className="w-full rounded-lg py-2.5 pl-10 pr-3 min-h-[44px] text-sm outline-none transition-all"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
              color: 'var(--bb-ink-100)',
            }}
          />
        </div>
      </section>

      {/* -- Category filters ----------------------------------------------- */}
      <section className="animate-reveal">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveCategory(tab.key)}
              className="flex-shrink-0 rounded-full px-4 py-1.5 min-h-[36px] text-sm font-medium transition-all"
              style={{
                background: activeCategory === tab.key ? 'var(--bb-brand)' : 'var(--bb-depth-3)',
                color: activeCategory === tab.key ? '#fff' : 'var(--bb-ink-60)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* -- Sort + results count ------------------------------------------- */}
      <section className="animate-reveal flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
          {filtered.length} produto{filtered.length !== 1 ? 's' : ''}
        </span>

        <div className="flex items-center gap-2">
          {(activeCategory || search) && (
            <button
              type="button"
              onClick={() => { setActiveCategory(''); setSearch(''); }}
              className="flex items-center gap-1 text-sm transition-all hover:opacity-80"
              style={{ color: 'var(--bb-brand)' }}
            >
              <XIcon className="h-3 w-3" />
              Limpar filtros
            </button>
          )}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-lg px-3 py-1.5 text-sm outline-none"
            style={{
              background: 'var(--bb-depth-3)',
              border: '1px solid var(--bb-glass-border)',
              color: 'var(--bb-ink-60)',
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
        </div>
      </section>

      {/* -- Product grid --------------------------------------------------- */}
      {filtered.length === 0 ? (
        <section className="animate-reveal py-12 text-center">
          <FilterIcon className="mx-auto mb-3 h-12 w-12" style={{ color: 'var(--bb-ink-20)' }} />
          <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
            Nenhum produto encontrado.
          </p>
        </section>
      ) : (
        <section className="animate-reveal grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="group relative overflow-hidden transition-all"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                borderRadius: 'var(--bb-radius-lg)',
              }}
            >
              {/* Badges */}
              <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
                {product.status === 'out_of_stock' && (
                  <span
                    className="rounded px-2 py-0.5 text-xs font-bold text-white"
                    style={{ background: 'var(--bb-ink-60)' }}
                  >
                    Esgotado
                  </span>
                )}
                {product.compare_at_price && product.status !== 'out_of_stock' && (
                  <span
                    className="rounded px-2 py-0.5 text-xs font-bold text-white"
                    style={{ background: '#22C55E' }}
                  >
                    Promocao
                  </span>
                )}
                {product.featured && (
                  <span
                    className="rounded px-2 py-0.5 text-xs font-bold text-white"
                    style={{ background: 'var(--bb-brand)' }}
                  >
                    Destaque
                  </span>
                )}
                {isNewProduct(product.created_at) && (
                  <span
                    className="rounded px-2 py-0.5 text-xs font-bold text-white"
                    style={{ background: '#6366F1' }}
                  >
                    Novo
                  </span>
                )}
              </div>

              {/* Image placeholder */}
              <Link href={`/loja/${product.id}`}>
                <div
                  className="flex aspect-square items-center justify-center transition-colors"
                  style={{ background: 'var(--bb-depth-3)' }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 sm:h-16 sm:w-16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1}
                    style={{ color: 'var(--bb-ink-20)' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </Link>

              {/* Info */}
              <div className="p-3">
                <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>
                  {CATEGORY_LABEL[product.category]}
                </span>
                <Link href={`/loja/${product.id}`}>
                  <h3
                    className="mt-1 text-sm font-bold leading-tight line-clamp-2 transition-colors"
                    style={{ color: 'var(--bb-ink-100)' }}
                  >
                    {product.name}
                  </h3>
                </Link>

                {/* Star rating */}
                {(product.rating_avg ?? 0) > 0 && (
                  <div className="mt-1 flex items-center gap-1">
                    <StarRating rating={product.rating_avg ?? 0} size={12} />
                    <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                      {product.rating_avg?.toFixed(1)} ({product.rating_count})
                    </span>
                  </div>
                )}

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-base font-extrabold sm:text-lg" style={{ color: 'var(--bb-ink-100)' }}>
                    {formatBRL(product.price)}
                  </span>
                  {product.compare_at_price && (
                    <span className="text-xs line-through" style={{ color: 'var(--bb-ink-40)' }}>
                      {formatBRL(product.compare_at_price)}
                    </span>
                  )}
                </div>

                {product.variants.length > 1 && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                    {product.variants.length} opcoes
                  </p>
                )}

                <div className="mt-3">
                  {product.status === 'out_of_stock' ? (
                    <button
                      type="button"
                      disabled
                      className="w-full rounded-lg px-3 py-2 min-h-[44px] text-sm font-medium opacity-50"
                      style={{
                        background: 'var(--bb-depth-3)',
                        color: 'var(--bb-ink-40)',
                        border: '1px solid var(--bb-glass-border)',
                      }}
                    >
                      Indisponivel
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(product)}
                      className="w-full rounded-lg px-3 py-2 min-h-[44px] text-sm font-medium transition-all hover:opacity-80"
                      style={{ background: 'var(--bb-brand)', color: '#fff' }}
                    >
                      Comprar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
