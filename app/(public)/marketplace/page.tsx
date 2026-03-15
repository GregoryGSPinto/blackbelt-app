'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { listCourses, type MarketplaceCourse, type MarketplaceFilters, type CourseModality, type BeltLevel } from '@/lib/api/marketplace.service';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

const MODALITY_LABEL: Record<CourseModality, string> = {
  bjj: 'Jiu-Jitsu', judo: 'Judô', mma: 'MMA', muay_thai: 'Muay Thai', wrestling: 'Wrestling', no_gi: 'No-Gi',
};

const BELT_LABEL: Record<BeltLevel, string> = {
  branca: 'Branca', cinza: 'Cinza', amarela: 'Amarela', laranja: 'Laranja', verde: 'Verde',
  azul: 'Azul', roxa: 'Roxa', marrom: 'Marrom', preta: 'Preta', todas: 'Todas',
};

type Category = 'mais_vendidos' | 'novos' | 'para_sua_faixa';

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'mais_vendidos', label: 'Mais vendidos' },
  { id: 'novos', label: 'Novos' },
  { id: 'para_sua_faixa', label: 'Para sua faixa' },
];

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5 text-xs">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.round(rating) ? 'text-yellow-500' : 'text-bb-gray-300'}>&#9733;</span>
      ))}
      <span className="ml-1 text-bb-gray-500">{rating.toFixed(1)}</span>
    </span>
  );
}

export default function MarketplacePage() {
  const [courses, setCourses] = useState<MarketplaceCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modality, setModality] = useState<CourseModality | ''>('');
  const [belt, setBelt] = useState<BeltLevel | ''>('');
  const [priceRange, setPriceRange] = useState<string>('');
  const [minRating, setMinRating] = useState<string>('');
  const [category, setCategory] = useState<Category | ''>('mais_vendidos');
  const [showFilters, setShowFilters] = useState(false);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const filters: MarketplaceFilters = {};
      if (modality) filters.modality = modality;
      if (belt) filters.belt_level = belt;
      if (priceRange === 'ate150') { filters.min_price = 0; filters.max_price = 150; }
      if (priceRange === '150a250') { filters.min_price = 150; filters.max_price = 250; }
      if (priceRange === 'acima250') { filters.min_price = 250; }
      if (minRating) filters.min_rating = Number(minRating);
      if (search) filters.search = search;
      if (category) filters.category = category;
      const data = await listCourses(filters);
      setCourses(data);
    } finally {
      setLoading(false);
    }
  }, [modality, belt, priceRange, minRating, search, category]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <div className="min-h-screen bg-bb-gray-50">
      {/* Header */}
      <div className="bg-bb-black px-4 py-8 text-white sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold sm:text-3xl">Marketplace</h1>
          <p className="mt-1 text-sm text-white/70">Cursos de artes marciais criados por professores certificados</p>

          {/* Search Bar */}
          <div className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bb-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar cursos, professores, técnicas..."
                className="w-full rounded-lg bg-white/10 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/50 focus:bg-white/20 focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 rounded-lg bg-white/10 px-4 py-2.5 text-sm text-white hover:bg-white/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtros
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value as CourseModality | '')}
                className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white"
              >
                <option value="" className="text-bb-black">Modalidade</option>
                {Object.entries(MODALITY_LABEL).map(([key, label]) => (
                  <option key={key} value={key} className="text-bb-black">{label}</option>
                ))}
              </select>
              <select
                value={belt}
                onChange={(e) => setBelt(e.target.value as BeltLevel | '')}
                className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white"
              >
                <option value="" className="text-bb-black">Faixa</option>
                {Object.entries(BELT_LABEL).map(([key, label]) => (
                  <option key={key} value={key} className="text-bb-black">{label}</option>
                ))}
              </select>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white"
              >
                <option value="" className="text-bb-black">Preço</option>
                <option value="ate150" className="text-bb-black">Até R$ 150</option>
                <option value="150a250" className="text-bb-black">R$ 150 - R$ 250</option>
                <option value="acima250" className="text-bb-black">Acima de R$ 250</option>
              </select>
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white"
              >
                <option value="" className="text-bb-black">Avaliação</option>
                <option value="4.5" className="text-bb-black">4.5+ estrelas</option>
                <option value="4" className="text-bb-black">4+ estrelas</option>
                <option value="3" className="text-bb-black">3+ estrelas</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Categories */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(category === cat.id ? '' : cat.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                category === cat.id
                  ? 'bg-bb-red text-white'
                  : 'bg-white text-bb-gray-500 hover:bg-bb-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : courses.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-bb-gray-500">Nenhum curso encontrado</p>
            <p className="mt-1 text-sm text-bb-gray-400">Tente ajustar seus filtros</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Link key={course.id} href={`/marketplace/${course.id}`}>
                <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                  {/* Thumbnail */}
                  <div className="relative h-40 bg-gradient-to-br from-bb-gray-200 to-bb-gray-300">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-bb-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
                      </svg>
                    </div>
                    <span className="absolute left-2 top-2 rounded bg-bb-black/70 px-2 py-0.5 text-xs text-white">
                      {MODALITY_LABEL[course.modality]}
                    </span>
                    <span className="absolute right-2 top-2 rounded bg-bb-black/70 px-2 py-0.5 text-xs text-white">
                      {Math.floor(course.duration_total / 60)}h {course.duration_total % 60}min
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="font-semibold text-bb-black line-clamp-2 text-sm leading-tight">{course.title}</h3>
                    <p className="mt-1 text-xs text-bb-gray-500">{course.creator_name} · {course.creator_academy}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Stars rating={course.rating} />
                      <span className="text-xs text-bb-gray-400">({course.reviews_count})</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-lg font-bold text-bb-black">
                        R$ {course.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs text-bb-gray-500">{course.students_count} alunos</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
