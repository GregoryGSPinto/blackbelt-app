'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProduct, listProducts, type Product, type ProductCategory } from '@/lib/api/store.service';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useCart } from '@/lib/hooks/useCart';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  quimono: 'Quimonos', faixa: 'Faixas', equipamento: 'Equipamentos',
  acessorio: 'Acessórios', vestuario: 'Vestuário', suplemento: 'Suplementos',
};

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { addItem, cartCount } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setAdded(false);
    getProduct(productId)
      .then((p) => {
        setProduct(p);
        if (p.variants.length > 0) {
          const available = p.variants.find((v) => v.stock > 0);
          setSelectedVariant(available?.id ?? p.variants[0].id);
        }
        setActiveImage(0);
        setQuantity(1);
        return listProducts(getActiveAcademyId(), { category: p.category });
      })
      .then((all) => {
        setRelated(all.filter((r) => r.id !== productId && r.status === 'active').slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, [productId]);

  function handleAddToCart() {
    if (!product) return;
    const variant = product.variants.find((v) => v.id === selectedVariant);
    if (!variant) return;
    addItem(
      {
        product_id: product.id,
        product_name: product.name,
        product_image: product.images[0] ?? '',
        variant_id: variant.id,
        variant_name: variant.name,
        unit_price: variant.price ?? product.price,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center">
        <p className="text-bb-gray-500">Produto não encontrado.</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.push('/loja')}>
          Voltar para a loja
        </Button>
      </div>
    );
  }

  const currentVariant = product.variants.find((v) => v.id === selectedVariant);
  const currentPrice = currentVariant?.price ?? product.price;
  const isOutOfStock = product.status === 'out_of_stock' || (currentVariant?.stock ?? 0) === 0;

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-bb-gray-400">
        <Link href="/loja" className="hover:text-bb-primary">Loja</Link>
        <span>/</span>
        <Link href={`/loja?category=${product.category}`} className="hover:text-bb-primary">
          {CATEGORY_LABEL[product.category]}
        </Link>
        <span>/</span>
        <span className="text-bb-gray-600">{product.name}</span>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Image gallery */}
        <div className="space-y-3">
          <div className="flex aspect-square items-center justify-center rounded-xl bg-bb-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-bb-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg border-2 bg-bb-gray-100 ${
                    activeImage === i ? 'border-bb-primary' : 'border-transparent'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-bb-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-4">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-bb-gray-400">
              {CATEGORY_LABEL[product.category]}
            </span>
            <h1 className="mt-1 text-2xl font-bold text-bb-black">{product.name}</h1>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-bb-black">{formatBRL(currentPrice)}</span>
            {product.compare_at_price && (
              <span className="text-lg text-bb-gray-400 line-through">
                {formatBRL(product.compare_at_price)}
              </span>
            )}
            {product.compare_at_price && (
              <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                -{Math.round((1 - product.price / product.compare_at_price) * 100)}%
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed text-bb-gray-600">{product.description}</p>

          {/* Variant selector */}
          {product.variants.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-bb-black">
                Tamanho / Variação
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => { setSelectedVariant(variant.id); setQuantity(1); }}
                    disabled={variant.stock === 0}
                    className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${
                      selectedVariant === variant.id
                        ? 'border-bb-primary bg-red-50 text-bb-primary'
                        : variant.stock === 0
                          ? 'border-bb-gray-200 bg-bb-gray-50 text-bb-gray-300 line-through'
                          : 'border-bb-gray-200 text-bb-gray-600 hover:border-bb-gray-400'
                    }`}
                  >
                    {variant.name}
                    {variant.stock <= 3 && variant.stock > 0 && (
                      <span className="ml-1 text-xs text-orange-500">({variant.stock})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="mb-2 block text-sm font-medium text-bb-black">Quantidade</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-bb-gray-300 text-bb-gray-600 hover:bg-bb-gray-50"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="flex h-10 w-12 items-center justify-center rounded-lg border border-bb-gray-300 font-mono text-sm font-bold">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(currentVariant?.stock ?? 10, quantity + 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-bb-gray-300 text-bb-gray-600 hover:bg-bb-gray-50"
                disabled={quantity >= (currentVariant?.stock ?? 10)}
              >
                +
              </button>
            </div>
          </div>

          {/* Add to cart */}
          <div className="flex gap-3">
            {isOutOfStock ? (
              <Button className="flex-1" disabled>
                Produto Esgotado
              </Button>
            ) : (
              <Button className="flex-1" onClick={handleAddToCart}>
                {added ? 'Adicionado!' : 'Adicionar ao Carrinho'}
              </Button>
            )}
            <Link href="/carrinho">
              <Button variant="secondary" className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>

          {/* Stock info */}
          {currentVariant && currentVariant.stock > 0 && currentVariant.stock <= 5 && (
            <p className="text-xs font-medium text-orange-600">
              Apenas {currentVariant.stock} unidades em estoque!
            </p>
          )}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-bb-black">Produtos Relacionados</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/loja/${r.id}`}
                className="group rounded-xl border border-bb-gray-200 bg-white p-3 transition-shadow hover:shadow-md"
              >
                <div className="flex aspect-square items-center justify-center rounded-lg bg-bb-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-bb-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-bold text-bb-black group-hover:text-bb-primary line-clamp-1">
                  {r.name}
                </h3>
                <p className="mt-1 font-bold text-bb-black">{formatBRL(r.price)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
