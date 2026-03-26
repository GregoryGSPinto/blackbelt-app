'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getProduct,
  listProducts,
  listReviews,
  getSizeGuide,
  createReview,
  type Product,
  type ProductCategory,
  type ReviewDTO,
  type SizeGuideDTO,
} from '@/lib/api/store.service';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { useCart } from '@/lib/hooks/useCart';
import { useToast } from '@/lib/hooks/useToast';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { translateError } from '@/lib/utils/error-translator';

// -- Constants ---------------------------------------------------------------

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  quimono: 'Quimonos', faixa: 'Faixas', equipamento: 'Equipamentos',
  acessorio: 'Acessorios', vestuario: 'Vestuario', suplemento: 'Suplementos',
};

const SIZE_FEEDBACK_LABEL: Record<string, string> = {
  small: 'Menor que o esperado',
  perfect: 'Tamanho perfeito',
  large: 'Maior que o esperado',
};

// Map product categories to known size guide IDs
const CATEGORY_SIZE_GUIDE: Record<string, string> = {
  quimono: 'sg-kimonos-bjj',
  vestuario: 'sg-rashguards',
  faixa: 'sg-faixas',
};

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// -- Stars -------------------------------------------------------------------

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
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

function ClickableStars({
  value,
  onChange,
  size = 28,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}) {
  const [hover, setHover] = useState(0);
  return (
    <span className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= (hover || value);
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-110"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill={active ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={active ? 0 : 1.5}
              style={{
                width: size,
                height: size,
                color: active ? '#FBBF24' : 'var(--bb-ink-20)',
              }}
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        );
      })}
    </span>
  );
}

// -- Page --------------------------------------------------------------------

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { addItem, cartCount } = useCart();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Size guide state
  const [sizeGuide, setSizeGuide] = useState<SizeGuideDTO | null>(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Review form modal
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [reviewSizePurchased, setReviewSizePurchased] = useState('');
  const [reviewSizeFeedback, setReviewSizeFeedback] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

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

        // Load size guide based on category
        const guideId = CATEGORY_SIZE_GUIDE[p.category];
        if (guideId) {
          getSizeGuide(guideId)
            .then((sg) => { if (sg.sizes.length > 0) setSizeGuide(sg); })
            .catch(() => {});
        }

        return listProducts(getActiveAcademyId(), { category: p.category });
      })
      .then((all) => {
        setRelated(all.filter((r) => r.id !== productId && r.status === 'active').slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, [productId]);

  // Load reviews
  useEffect(() => {
    setReviewsLoading(true);
    listReviews(productId)
      .then(setReviews)
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
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

  const handleSubmitReview = useCallback(async () => {
    if (!product || reviewRating === 0) return;
    setSubmittingReview(true);
    try {
      const newReview = await createReview(
        productId,
        'user-1',
        getActiveAcademyId(),
        {
          rating: reviewRating,
          title: reviewTitle || undefined,
          body: reviewBody || undefined,
          size_purchased: reviewSizePurchased || undefined,
          size_feedback: reviewSizeFeedback || undefined,
        }
      );
      setReviews((prev) => [newReview, ...prev]);
      setShowReviewForm(false);
      setReviewRating(5);
      setReviewTitle('');
      setReviewBody('');
      setReviewSizePurchased('');
      setReviewSizeFeedback('');
      toast('Avaliacao enviada com sucesso!', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSubmittingReview(false);
    }
  }, [product, productId, reviewRating, reviewTitle, reviewBody, reviewSizePurchased, reviewSizeFeedback, toast]);

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
        <p style={{ color: 'var(--bb-ink-40)' }}>Produto nao encontrado.</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.push('/loja')}>
          Voltar para a loja
        </Button>
      </div>
    );
  }

  const currentVariant = product.variants.find((v) => v.id === selectedVariant);
  const currentPrice = currentVariant?.price ?? product.price;
  const isOutOfStock = product.status === 'out_of_stock' || (currentVariant?.stock ?? 0) === 0;

  // Review statistics
  const reviewCount = reviews.length;
  const avgRating = reviewCount > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
    : (product.rating_avg ?? 0);

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    return { star, count, pct: reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0 };
  });

  const perfectFitCount = reviews.filter((r) => r.size_feedback === 'perfect').length;
  const reviewsWithSizeFeedback = reviews.filter((r) => r.size_feedback).length;

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
        <Link href="/loja" className="transition-colors hover:opacity-80" style={{ color: 'var(--bb-brand)' }}>Loja</Link>
        <span>/</span>
        <Link href={`/loja?category=${product.category}`} className="transition-colors hover:opacity-80" style={{ color: 'var(--bb-brand)' }}>
          {CATEGORY_LABEL[product.category]}
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--bb-ink-60)' }}>{product.name}</span>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Image gallery */}
        <div className="space-y-3">
          <div
            className="flex aspect-square items-center justify-center"
            style={{ background: 'var(--bb-depth-3)', borderRadius: 'var(--bb-radius-lg)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} style={{ color: 'var(--bb-ink-20)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: 'var(--bb-depth-3)',
                    border: activeImage === i ? '2px solid var(--bb-brand)' : '2px solid transparent',
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} style={{ color: 'var(--bb-ink-20)' }}>
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
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
              {CATEGORY_LABEL[product.category]}
            </span>
            <h1 className="mt-1 text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>{product.name}</h1>

            {/* Rating summary */}
            {avgRating > 0 && (
              <div className="mt-1 flex items-center gap-2">
                <StarRating rating={avgRating} size={16} />
                <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                  {avgRating.toFixed(1)} ({product.rating_count ?? reviewCount} {(product.rating_count ?? reviewCount) === 1 ? 'avaliacao' : 'avaliacoes'})
                </span>
              </div>
            )}
          </div>

          {/* Brand & Material */}
          {(product.brand || product.material) && (
            <div className="flex flex-wrap gap-3">
              {product.brand && (
                <span
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-60)' }}
                >
                  Marca: {product.brand}
                </span>
              )}
              {product.material && (
                <span
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-60)' }}
                >
                  Material: {product.material}
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>{formatBRL(currentPrice)}</span>
            {product.compare_at_price && (
              <span className="text-lg line-through" style={{ color: 'var(--bb-ink-40)' }}>
                {formatBRL(product.compare_at_price)}
              </span>
            )}
            {product.compare_at_price && (
              <span
                className="rounded px-2 py-0.5 text-xs font-bold"
                style={{ background: '#DCFCE7', color: '#15803D' }}
              >
                -{Math.round((1 - product.price / product.compare_at_price) * 100)}%
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed" style={{ color: 'var(--bb-ink-60)' }}>{product.description}</p>

          {/* Variant selector */}
          {product.variants.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <label className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                  Tamanho / Variacao
                </label>
                {sizeGuide && (
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(true)}
                    className="text-xs font-medium underline transition-colors hover:opacity-80"
                    style={{ color: 'var(--bb-brand)' }}
                  >
                    Guia de Tamanhos
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => { setSelectedVariant(variant.id); setQuantity(1); }}
                    disabled={variant.stock === 0}
                    className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                    style={{
                      border: selectedVariant === variant.id
                        ? '2px solid var(--bb-brand)'
                        : variant.stock === 0
                          ? '2px solid var(--bb-ink-20)'
                          : '2px solid var(--bb-glass-border)',
                      background: selectedVariant === variant.id ? 'var(--bb-depth-3)' : 'transparent',
                      color: variant.stock === 0
                        ? 'var(--bb-ink-20)'
                        : selectedVariant === variant.id
                          ? 'var(--bb-brand)'
                          : 'var(--bb-ink-60)',
                      textDecoration: variant.stock === 0 ? 'line-through' : 'none',
                    }}
                  >
                    {variant.name}
                    {variant.stock <= 3 && variant.stock > 0 && (
                      <span className="ml-1 text-xs" style={{ color: '#F59E0B' }}>({variant.stock})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>Quantidade</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors"
                style={{
                  border: '1px solid var(--bb-glass-border)',
                  color: 'var(--bb-ink-60)',
                  background: 'var(--bb-depth-2)',
                }}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span
                className="flex h-10 w-12 items-center justify-center rounded-lg font-mono text-sm font-bold"
                style={{
                  border: '1px solid var(--bb-glass-border)',
                  color: 'var(--bb-ink-100)',
                  background: 'var(--bb-depth-2)',
                }}
              >
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(currentVariant?.stock ?? 10, quantity + 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors"
                style={{
                  border: '1px solid var(--bb-glass-border)',
                  color: 'var(--bb-ink-60)',
                  background: 'var(--bb-depth-2)',
                }}
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
                  <span
                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ background: '#EF4444' }}
                  >
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>

          {/* Stock info */}
          {currentVariant && currentVariant.stock > 0 && currentVariant.stock <= 5 && (
            <p className="text-xs font-medium" style={{ color: '#F59E0B' }}>
              Apenas {currentVariant.stock} unidades em estoque!
            </p>
          )}
        </div>
      </div>

      {/* ── Reviews section ─────────────────────────────────────────── */}
      <div
        className="space-y-6 rounded-xl p-4 sm:p-6"
        style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            Avaliacoes
          </h2>
          <Button size="sm" onClick={() => setShowReviewForm(true)}>
            Avaliar produto
          </Button>
        </div>

        {reviewsLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="md" />
          </div>
        ) : reviewCount === 0 ? (
          <p className="py-8 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
            Nenhuma avaliacao ainda. Seja o primeiro a avaliar!
          </p>
        ) : (
          <>
            {/* Rating overview */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Left: big number */}
              <div className="flex flex-col items-center justify-center gap-1">
                <span className="text-5xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>
                  {avgRating.toFixed(1)}
                </span>
                <StarRating rating={avgRating} size={22} />
                <span className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                  {reviewCount} {reviewCount === 1 ? 'avaliacao' : 'avaliacoes'}
                </span>
              </div>

              {/* Right: bar chart */}
              <div className="space-y-1.5">
                {ratingDistribution.map((d) => (
                  <div key={d.star} className="flex items-center gap-2">
                    <span className="w-8 text-right text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                      {d.star}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#FBBF24" style={{ width: 14, height: 14 }}>
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <div
                      className="h-2.5 flex-1 overflow-hidden rounded-full"
                      style={{ background: 'var(--bb-depth-3)' }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${d.pct}%`, background: '#FBBF24' }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                      {d.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Size feedback summary */}
            {reviewsWithSizeFeedback > 0 && (
              <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                {perfectFitCount} de {reviewsWithSizeFeedback} compradores acharam o tamanho perfeito
              </p>
            )}

            {/* Review list */}
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-lg p-4"
                  style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                          {review.author_name || 'Anonimo'}
                        </span>
                        {review.verified_purchase && (
                          <span
                            className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                            style={{ background: '#DCFCE7', color: '#15803D' }}
                          >
                            Compra verificada
                          </span>
                        )}
                      </div>
                      <StarRating rating={review.rating} size={14} />
                    </div>
                    <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                      {formatDate(review.created_at)}
                    </span>
                  </div>

                  {review.title && (
                    <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                      {review.title}
                    </p>
                  )}
                  {review.body && (
                    <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--bb-ink-60)' }}>
                      {review.body}
                    </p>
                  )}

                  {(review.size_purchased || review.size_feedback) && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {review.size_purchased && (
                        <span
                          className="rounded-full px-2 py-0.5 text-xs"
                          style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-60)' }}
                        >
                          Tamanho: {review.size_purchased}
                        </span>
                      )}
                      {review.size_feedback && (
                        <span
                          className="rounded-full px-2 py-0.5 text-xs"
                          style={{
                            background: review.size_feedback === 'perfect' ? '#DCFCE7' : '#FEF3C7',
                            color: review.size_feedback === 'perfect' ? '#15803D' : '#92400E',
                          }}
                        >
                          {SIZE_FEEDBACK_LABEL[review.size_feedback] ?? review.size_feedback}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Produtos Relacionados</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/loja/${r.id}`}
                className="group overflow-hidden p-3 transition-shadow hover:shadow-md"
                style={{
                  background: 'var(--bb-depth-2)',
                  border: '1px solid var(--bb-glass-border)',
                  borderRadius: 'var(--bb-radius-lg)',
                }}
              >
                <div
                  className="flex aspect-square items-center justify-center rounded-lg"
                  style={{ background: 'var(--bb-depth-3)' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} style={{ color: 'var(--bb-ink-20)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-bold line-clamp-1 transition-colors" style={{ color: 'var(--bb-ink-100)' }}>
                  {r.name}
                </h3>
                <p className="mt-1 font-bold" style={{ color: 'var(--bb-ink-100)' }}>{formatBRL(r.price)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Size Guide Modal ──────────────────────────────────────── */}
      <Modal open={showSizeGuide} onClose={() => setShowSizeGuide(false)} title="Guia de Tamanhos">
        {sizeGuide && (
          <div className="space-y-4">
            <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-60)' }}>
              {sizeGuide.name}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--bb-glass-border)' }}>
                    <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Tamanho</th>
                    {sizeGuide.sizes.some((s) => s.height_cm) && (
                      <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Altura</th>
                    )}
                    {sizeGuide.sizes.some((s) => s.weight_kg) && (
                      <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Peso</th>
                    )}
                    {sizeGuide.sizes.some((s) => s.chest_cm) && (
                      <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Peito</th>
                    )}
                    {sizeGuide.sizes.some((s) => s.length_cm) && (
                      <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Comprimento</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {sizeGuide.sizes.map((s, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                      <td className="px-3 py-2 font-medium" style={{ color: 'var(--bb-ink-100)' }}>{s.label}</td>
                      {sizeGuide.sizes.some((sz) => sz.height_cm) && (
                        <td className="px-3 py-2" style={{ color: 'var(--bb-ink-60)' }}>{s.height_cm ? `${s.height_cm} cm` : '-'}</td>
                      )}
                      {sizeGuide.sizes.some((sz) => sz.weight_kg) && (
                        <td className="px-3 py-2" style={{ color: 'var(--bb-ink-60)' }}>{s.weight_kg ? `${s.weight_kg} kg` : '-'}</td>
                      )}
                      {sizeGuide.sizes.some((sz) => sz.chest_cm) && (
                        <td className="px-3 py-2" style={{ color: 'var(--bb-ink-60)' }}>{s.chest_cm ? `${s.chest_cm} cm` : '-'}</td>
                      )}
                      {sizeGuide.sizes.some((sz) => sz.length_cm) && (
                        <td className="px-3 py-2" style={{ color: 'var(--bb-ink-60)' }}>{s.length_cm ? `${s.length_cm} cm` : '-'}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {sizeGuide.tips && (
              <p className="text-xs leading-relaxed" style={{ color: 'var(--bb-ink-40)' }}>
                {sizeGuide.tips}
              </p>
            )}
            <Button variant="secondary" className="w-full" onClick={() => setShowSizeGuide(false)}>
              Fechar
            </Button>
          </div>
        )}
      </Modal>

      {/* ── Review Form Modal ─────────────────────────────────────── */}
      <Modal open={showReviewForm} onClose={() => setShowReviewForm(false)} title="Avaliar produto">
        <div className="space-y-4">
          {/* Rating */}
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
              Sua nota
            </label>
            <ClickableStars value={reviewRating} onChange={setReviewRating} />
          </div>

          {/* Title */}
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
              Titulo (opcional)
            </label>
            <input
              type="text"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="Resuma sua experiencia"
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                color: 'var(--bb-ink-100)',
              }}
            />
          </div>

          {/* Body */}
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
              Comentario (opcional)
            </label>
            <textarea
              value={reviewBody}
              onChange={(e) => setReviewBody(e.target.value)}
              placeholder="Conte mais sobre sua experiencia com o produto..."
              rows={3}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                color: 'var(--bb-ink-100)',
              }}
            />
          </div>

          {/* Size purchased */}
          {product.variants.length > 0 && (
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                Tamanho comprado (opcional)
              </label>
              <select
                value={reviewSizePurchased}
                onChange={(e) => setReviewSizePurchased(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: 'var(--bb-depth-2)',
                  border: '1px solid var(--bb-glass-border)',
                  color: 'var(--bb-ink-100)',
                }}
              >
                <option value="">Selecione...</option>
                {product.variants.map((v) => (
                  <option key={v.id} value={v.name}>{v.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Size feedback */}
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
              O tamanho ficou... (opcional)
            </label>
            <div className="flex gap-2">
              {(['small', 'perfect', 'large'] as const).map((fb) => (
                <button
                  key={fb}
                  type="button"
                  onClick={() => setReviewSizeFeedback(reviewSizeFeedback === fb ? '' : fb)}
                  className="flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
                  style={{
                    border: reviewSizeFeedback === fb ? '2px solid var(--bb-brand)' : '2px solid var(--bb-glass-border)',
                    background: reviewSizeFeedback === fb ? 'var(--bb-depth-3)' : 'transparent',
                    color: reviewSizeFeedback === fb ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
                  }}
                >
                  {SIZE_FEEDBACK_LABEL[fb]}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setShowReviewForm(false)}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleSubmitReview} disabled={submittingReview || reviewRating === 0}>
              {submittingReview ? <Spinner size="sm" /> : 'Enviar avaliacao'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
