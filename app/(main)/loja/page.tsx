'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { listProducts, type Product, type ProductCategory } from '@/lib/api/store.service';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { useCart } from '@/lib/hooks/useCart';

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  quimono: 'Quimonos',
  faixa: 'Faixas',
  equipamento: 'Equipamentos',
  acessorio: 'Acessórios',
  vestuario: 'Vestuário',
  suplemento: 'Suplementos',
};

const CATEGORY_TABS: { key: string; label: string }[] = [
  { key: '', label: 'Todos' },
  { key: 'quimono', label: 'Quimonos' },
  { key: 'faixa', label: 'Faixas' },
  { key: 'equipamento', label: 'Equipamentos' },
  { key: 'acessorio', label: 'Acessórios' },
  { key: 'vestuario', label: 'Vestuário' },
  { key: 'suplemento', label: 'Suplementos' },
];

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function LojaPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  const { cartCount, addItem } = useCart();

  useEffect(() => {
    listProducts('academy-1').then(setProducts).finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    if (activeCategory && p.category !== activeCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) return false;
    }
    return true;
  });

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
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Loja" subtitle="Produtos oficiais da academia" />
        <Link href="/carrinho" className="relative">
          <Button variant="secondary">
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            Carrinho
          </Button>
          {cartCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
              {cartCount}
            </span>
          )}
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bb-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produto..."
          className="w-full rounded-lg border border-bb-gray-300 py-2.5 pl-10 pr-3 text-sm"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveCategory(tab.key)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === tab.key
                ? 'bg-bb-primary text-white'
                : 'bg-bb-gray-100 text-bb-gray-600 hover:bg-bb-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-bb-gray-500">{filtered.length} produtos</span>
        {(activeCategory || search) && (
          <button
            onClick={() => { setActiveCategory(''); setSearch(''); }}
            className="text-sm text-bb-primary hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-bb-gray-500">Nenhum produto encontrado.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="group relative overflow-hidden rounded-xl border border-bb-gray-200 bg-white transition-shadow hover:shadow-md"
            >
              {/* Badges */}
              <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
                {product.status === 'out_of_stock' && (
                  <span className="rounded bg-bb-gray-900 px-2 py-0.5 text-xs font-bold text-white">
                    Esgotado
                  </span>
                )}
                {product.compare_at_price && product.status !== 'out_of_stock' && (
                  <span className="rounded bg-green-600 px-2 py-0.5 text-xs font-bold text-white">
                    Promoção
                  </span>
                )}
                {product.featured && (
                  <span className="rounded bg-bb-primary px-2 py-0.5 text-xs font-bold text-white">
                    Destaque
                  </span>
                )}
              </div>

              {/* Image placeholder */}
              <Link href={`/loja/${product.id}`}>
                <div className="flex aspect-square items-center justify-center bg-bb-gray-100 group-hover:bg-bb-gray-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-bb-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </Link>

              {/* Info */}
              <div className="p-3">
                <span className="text-xs font-medium text-bb-gray-400">
                  {CATEGORY_LABEL[product.category]}
                </span>
                <Link href={`/loja/${product.id}`}>
                  <h3 className="mt-1 font-bold text-bb-black group-hover:text-bb-primary line-clamp-2">
                    {product.name}
                  </h3>
                </Link>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-lg font-extrabold text-bb-black">
                    {formatBRL(product.price)}
                  </span>
                  {product.compare_at_price && (
                    <span className="text-sm text-bb-gray-400 line-through">
                      {formatBRL(product.compare_at_price)}
                    </span>
                  )}
                </div>

                {product.variants.length > 1 && (
                  <p className="mt-1 text-xs text-bb-gray-400">
                    {product.variants.length} tamanhos disponíveis
                  </p>
                )}

                <div className="mt-3">
                  {product.status === 'out_of_stock' ? (
                    <Button variant="secondary" className="w-full" disabled>
                      Indisponível
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={() => handleQuickAdd(product)}>
                      Comprar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
