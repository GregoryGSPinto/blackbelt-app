'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getWishlist, removeFromWishlist, type WishlistItem } from '@/lib/api/wishlist.service';
import { getBalance, type RewardBalance } from '@/lib/api/store-rewards.service';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { useCart } from '@/lib/hooks/useCart';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function DesejosPage() {
  const { toast } = useToast();
  const { addItem } = useCart();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [balance, setBalance] = useState<RewardBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getWishlist('user-1'),
      getBalance('user-1'),
    ]).then(([w, b]) => {
      setItems(w);
      setBalance(b);
    }).finally(() => setLoading(false));
  }, []);

  async function handleRemove(productId: string) {
    try {
      await removeFromWishlist('user-1', productId);
      setItems((prev) => prev.filter((i) => i.product_id !== productId));
      toast('Removido dos desejos', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  function handleMoveToCart(item: WishlistItem) {
    const product = item.product;
    const variant = product.variants[0];
    if (!variant || product.status === 'out_of_stock') {
      toast('Produto indisponível', 'error');
      return;
    }
    addItem({
      product_id: product.id,
      product_name: product.name,
      product_image: product.images[0] ?? '',
      variant_id: variant.id,
      variant_name: variant.name,
      unit_price: variant.price ?? product.price,
    });
    handleRemove(product.id);
    toast('Movido para o carrinho', 'success');
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
      <PageHeader title="Lista de Desejos" subtitle="Produtos que você salvou para depois" />

      {/* Rewards balance */}
      {balance && (
        <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-bb-primary to-red-700 p-4 text-white">
          <div>
            <p className="text-sm font-medium opacity-90">Seus Pontos de Recompensa</p>
            <p className="text-2xl font-extrabold">{balance.points} pts</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">Equivalente a</p>
            <p className="text-lg font-bold">{formatBRL(balance.value_brl)}</p>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="py-16 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-bb-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h2 className="mt-4 text-lg font-bold text-bb-black">Nenhum item na lista</h2>
          <p className="mt-1 text-sm text-bb-gray-500">Explore a loja e adicione produtos aos seus desejos.</p>
          <Link href="/loja">
            <Button className="mt-6">Explorar Loja</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-xl border border-bb-gray-200 bg-white transition-shadow hover:shadow-md"
            >
              {item.product.status === 'out_of_stock' && (
                <span className="absolute left-2 top-2 z-10 rounded bg-bb-gray-900 px-2 py-0.5 text-xs font-bold text-white">
                  Esgotado
                </span>
              )}
              {item.product.compare_at_price && item.product.status !== 'out_of_stock' && (
                <span className="absolute left-2 top-2 z-10 rounded bg-green-600 px-2 py-0.5 text-xs font-bold text-white">
                  Promoção
                </span>
              )}

              <Link href={`/loja/${item.product.id}`}>
                <div className="flex aspect-square items-center justify-center bg-bb-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-bb-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </Link>

              <div className="p-3">
                <Link href={`/loja/${item.product.id}`}>
                  <h3 className="font-bold text-bb-black group-hover:text-bb-primary line-clamp-2">
                    {item.product.name}
                  </h3>
                </Link>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-lg font-extrabold text-bb-black">
                    {formatBRL(item.product.price)}
                  </span>
                  {item.product.compare_at_price && (
                    <span className="text-sm text-bb-gray-400 line-through">
                      {formatBRL(item.product.compare_at_price)}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs text-bb-gray-400">
                  Adicionado em {new Date(item.added_at).toLocaleDateString('pt-BR')}
                </p>

                <div className="mt-3 flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => handleMoveToCart(item)}
                    disabled={item.product.status === 'out_of_stock'}
                  >
                    Mover para Carrinho
                  </Button>
                  <button
                    onClick={() => handleRemove(item.product_id)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-bb-gray-200 text-bb-gray-400 hover:border-red-300 hover:text-red-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
