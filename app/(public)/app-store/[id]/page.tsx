'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import type { AppStoreItem, AppReview } from '@/lib/api/app-store.service';
import { getApp, getAppReviews } from '@/lib/api/app-store.service';

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizeClass} ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-bb-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export default function AppDetailPage() {
  const params = useParams();
  const appId = params.id as string;
  const [app, setApp] = useState<AppStoreItem | null>(null);
  const [reviews, setReviews] = useState<AppReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeScreenshot, setActiveScreenshot] = useState(0);

  useEffect(() => {
    Promise.all([getApp(appId), getAppReviews(appId)]).then(([a, r]) => {
      setApp(a);
      setReviews(r);
      setLoading(false);
    });
  }, [appId]);

  if (loading || !app) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bb-gray-50">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-5xl px-6 pt-6">
        <nav className="text-sm text-bb-gray-500">
          <Link href="/app-store" className="hover:text-bb-red">
            App Store
          </Link>
          <span className="mx-2">/</span>
          <span className="text-bb-gray-900">{app.name}</span>
        </nav>
      </div>

      {/* Header */}
      <section className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-bb-red/10 text-bb-red">
            <span className="text-3xl font-bold">{app.name.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-bb-gray-900">{app.name}</h1>
            <p className="mt-1 text-sm text-bb-gray-500">{app.author} &middot; v{app.version}</p>
            <div className="mt-2 flex items-center gap-3">
              <StarRating rating={app.rating} size="lg" />
              <span className="text-sm text-bb-gray-500">{app.rating.toFixed(1)} ({app.reviewCount} avaliacoes)</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-bb-gray-500">
              <span>{app.downloads.toLocaleString('pt-BR')} downloads</span>
              <span>&middot;</span>
              <span>{app.compatibility}</span>
              <span>&middot;</span>
              <span className="capitalize">{app.category}</span>
            </div>
          </div>
          <div className="shrink-0">
            <Button variant="primary">
              {app.price === 0 ? 'Instalar Gratis' : `Comprar R$ ${app.price.toFixed(2)}/mes`}
            </Button>
          </div>
        </div>
      </section>

      {/* Screenshots */}
      {app.screenshots.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 pb-8">
          <h2 className="mb-4 font-semibold text-bb-gray-900">Screenshots</h2>
          <div className="rounded-xl border border-bb-gray-200 bg-bb-gray-100 p-8 text-center">
            <div className="mb-4 flex h-48 items-center justify-center rounded-lg bg-white text-bb-gray-400">
              {app.screenshots[activeScreenshot]}
            </div>
            <div className="flex justify-center gap-2">
              {app.screenshots.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveScreenshot(idx)}
                  className={`h-2 w-8 rounded-full transition-colors ${
                    idx === activeScreenshot ? 'bg-bb-red' : 'bg-bb-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-5xl px-6 pb-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section>
              <h2 className="mb-3 font-semibold text-bb-gray-900">Descricao</h2>
              <p className="text-sm leading-relaxed text-bb-gray-600">{app.longDescription}</p>
            </section>

            {/* Features */}
            <section>
              <h2 className="mb-3 font-semibold text-bb-gray-900">Funcionalidades</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {app.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-bb-gray-600">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </section>

            {/* Reviews */}
            <section>
              <h2 className="mb-3 font-semibold text-bb-gray-900">
                Avaliacoes ({reviews.length})
              </h2>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-xl border border-bb-gray-200 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-bb-gray-900">{review.authorName}</span>
                        <span className="text-xs text-bb-gray-400">
                          {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="mt-1">
                        <StarRating rating={review.rating} />
                      </div>
                      <p className="mt-2 text-sm text-bb-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-bb-gray-500">Nenhuma avaliacao ainda.</p>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-xl border border-bb-gray-200 bg-white p-5">
              <h3 className="mb-3 font-semibold text-bb-gray-900">Informacoes</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-bb-gray-500">Preco</dt>
                  <dd className="font-medium text-bb-gray-900">
                    {app.price === 0 ? 'Gratis' : `R$ ${app.price.toFixed(2)}/mes`}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-bb-gray-500">Versao</dt>
                  <dd className="text-bb-gray-900">{app.version}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-bb-gray-500">Categoria</dt>
                  <dd className="capitalize text-bb-gray-900">{app.category}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-bb-gray-500">Compatibilidade</dt>
                  <dd className="text-bb-gray-900">{app.compatibility}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-bb-gray-500">Autor</dt>
                  <dd className="text-bb-gray-900">{app.author}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-bb-gray-500">Downloads</dt>
                  <dd className="text-bb-gray-900">{app.downloads.toLocaleString('pt-BR')}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
