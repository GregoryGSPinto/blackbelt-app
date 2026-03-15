'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Spinner } from '@/components/ui/Spinner';
import type { AppStoreItem, AppCategory } from '@/lib/api/app-store.service';
import { listApps, getCategories, getFeatured } from '@/lib/api/app-store.service';

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-4 w-4 ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-bb-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-xs text-bb-gray-500">({rating.toFixed(1)})</span>
    </span>
  );
}

export default function AppStorePage() {
  const [apps, setApps] = useState<AppStoreItem[]>([]);
  const [featured, setFeatured] = useState<AppStoreItem[]>([]);
  const [categories, setCategories] = useState<AppCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    Promise.all([listApps(), getCategories(), getFeatured()]).then(([a, c, f]) => {
      setApps(a);
      setCategories(c);
      setFeatured(f);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let result = apps;
    if (categoryFilter !== 'all') {
      result = result.filter((a) => a.category === categoryFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [apps, categoryFilter, search]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bb-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-bb-gray-900 to-bb-gray-800 px-6 py-16 text-center text-white">
        <h1 className="text-3xl font-bold sm:text-4xl">BlackBelt App Store</h1>
        <p className="mx-auto mt-3 max-w-xl text-bb-gray-300">
          Descubra plugins e integracoes para potencializar sua academia.
        </p>
        <div className="mx-auto mt-6 max-w-md">
          <input
            type="text"
            placeholder="Buscar apps e plugins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border-0 bg-white/10 px-5 py-3 text-white placeholder-bb-gray-400 backdrop-blur focus:outline-none focus:ring-2 focus:ring-bb-red"
          />
        </div>
      </section>

      {/* Featured */}
      {!search && categoryFilter === 'all' && featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-10">
          <h2 className="mb-6 text-xl font-bold text-bb-gray-900">Em Destaque</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((app) => (
              <Link
                key={app.id}
                href={`/app-store/${app.id}`}
                className="group rounded-xl border border-bb-gray-200 bg-white p-5 transition-shadow hover:shadow-lg"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-bb-red/10 text-bb-red">
                  <span className="text-xl font-bold">{app.name.charAt(0)}</span>
                </div>
                <h3 className="font-semibold text-bb-gray-900 group-hover:text-bb-red">{app.name}</h3>
                <p className="mt-1 text-xs text-bb-gray-500">{app.author}</p>
                <StarRating rating={app.rating} />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-bb-gray-900">
                    {app.price === 0 ? 'Gratis' : `R$ ${app.price.toFixed(2)}`}
                  </span>
                  <span className="text-xs text-bb-gray-400">{app.downloads.toLocaleString('pt-BR')} downloads</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Category Filters */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              categoryFilter === 'all'
                ? 'bg-bb-red text-white'
                : 'bg-bb-gray-100 text-bb-gray-600 hover:bg-bb-gray-200'
            }`}
          >
            Todos ({apps.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                categoryFilter === cat.id
                  ? 'bg-bb-red text-white'
                  : 'bg-bb-gray-100 text-bb-gray-600 hover:bg-bb-gray-200'
              }`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>
      </section>

      {/* App Grid */}
      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((app) => (
            <Link
              key={app.id}
              href={`/app-store/${app.id}`}
              className="group flex flex-col rounded-xl border border-bb-gray-200 bg-white p-5 transition-shadow hover:shadow-lg"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-bb-gray-100 text-bb-gray-600">
                  <span className="text-lg font-bold">{app.name.charAt(0)}</span>
                </div>
                <span className="rounded-full bg-bb-gray-100 px-2 py-0.5 text-xs text-bb-gray-500">
                  {app.category}
                </span>
              </div>
              <h3 className="font-semibold text-bb-gray-900 group-hover:text-bb-red">{app.name}</h3>
              <p className="mt-1 text-xs text-bb-gray-500">{app.author} &middot; v{app.version}</p>
              <p className="mt-2 flex-1 text-sm text-bb-gray-600">{app.description}</p>
              <div className="mt-3">
                <StarRating rating={app.rating} />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-bb-gray-900">
                  {app.price === 0 ? 'Gratis' : `R$ ${app.price.toFixed(2)}/mes`}
                </span>
                <span className="text-xs text-bb-gray-400">
                  {app.downloads.toLocaleString('pt-BR')} downloads
                </span>
              </div>
            </Link>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-bb-gray-500">
            Nenhum app encontrado para sua busca.
          </div>
        )}
      </section>
    </div>
  );
}
