'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/shared/PageHeader';
import { useCart } from '@/lib/hooks/useCart';

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function CarrinhoPage() {
  const router = useRouter();
  const { items, cartTotal, updateQuantity, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader title="Carrinho" subtitle="Seu carrinho de compras" />
        <div className="py-16 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-bb-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <h2 className="mt-4 text-lg font-bold text-bb-black">Carrinho vazio</h2>
          <p className="mt-1 text-sm text-bb-gray-500">Explore a loja e adicione produtos ao carrinho.</p>
          <Link href="/loja">
            <Button className="mt-6">Ver Produtos</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader title="Carrinho" subtitle={`${items.length} ${items.length === 1 ? 'item' : 'itens'} no carrinho`} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart items */}
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => (
            <div
              key={`${item.product_id}-${item.variant_id}`}
              className="flex gap-4 rounded-xl border border-bb-gray-200 bg-white p-4"
            >
              {/* Image placeholder */}
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-bb-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-bb-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link href={`/loja/${item.product_id}`} className="font-bold text-bb-black hover:text-bb-primary">
                    {item.product_name}
                  </Link>
                  <p className="text-xs text-bb-gray-400">Variação: {item.variant_name}</p>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center rounded border border-bb-gray-300 text-sm text-bb-gray-600 hover:bg-bb-gray-50"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-mono text-sm font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded border border-bb-gray-300 text-sm text-bb-gray-600 hover:bg-bb-gray-50"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-bold text-bb-black">
                      {formatBRL(item.unit_price * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeItem(item.product_id, item.variant_id)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button onClick={clearCart} className="text-sm text-bb-gray-500 hover:text-red-500 hover:underline">
              Limpar carrinho
            </button>
          </div>
        </div>

        {/* Order summary */}
        <div className="rounded-xl border border-bb-gray-200 bg-white p-4 lg:sticky lg:top-4 lg:self-start">
          <h3 className="font-bold text-bb-black">Resumo do Pedido</h3>
          <div className="mt-4 space-y-2">
            {items.map((item) => (
              <div key={`${item.product_id}-${item.variant_id}`} className="flex justify-between text-sm">
                <span className="text-bb-gray-500 line-clamp-1">{item.product_name} x{item.quantity}</span>
                <span className="flex-shrink-0 text-bb-black">{formatBRL(item.unit_price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-bb-gray-200 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-bb-gray-500">Subtotal</span>
              <span className="font-bold text-bb-black">{formatBRL(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-bb-gray-500">Frete</span>
              <span className="text-bb-gray-400">Calculado no checkout</span>
            </div>
          </div>
          <div className="mt-4 border-t border-bb-gray-200 pt-4">
            <div className="flex justify-between">
              <span className="text-lg font-bold text-bb-black">Total</span>
              <span className="text-lg font-extrabold text-bb-black">{formatBRL(cartTotal)}</span>
            </div>
          </div>
          <Button className="mt-4 w-full" onClick={() => router.push('/checkout-loja')}>
            Finalizar Compra
          </Button>
          <Link href="/loja">
            <Button variant="ghost" className="mt-2 w-full">
              Continuar Comprando
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
