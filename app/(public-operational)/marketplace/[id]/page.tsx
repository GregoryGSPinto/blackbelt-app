'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getCourse, purchaseCourse, type MarketplaceCourse } from '@/lib/api/marketplace.service';
import { getReviews, getAverageRating, createReview, type Review, type AverageRating } from '@/lib/api/reviews.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

import { Skeleton } from '@/components/ui/Skeleton';
import { ReviewCard, Stars } from '@/components/marketplace/ReviewCard';
import { ReviewForm } from '@/components/marketplace/ReviewForm';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';

const MODALITY_LABEL: Record<string, string> = {
  bjj: 'Jiu-Jitsu', judo: 'Judô', mma: 'MMA', muay_thai: 'Muay Thai', wrestling: 'Wrestling', no_gi: 'No-Gi',
};

export default function CourseDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();

  const [course, setCourse] = useState<MarketplaceCourse | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<AverageRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [purchased, setPurchased] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [c, r, a] = await Promise.all([
          getCourse(id),
          getReviews(id),
          getAverageRating(id),
        ]);
        setCourse(c);
        setReviews(r.reviews);
        setAvgRating(a);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handlePurchase() {
    if (!course) return;
    setPurchasing(true);
    try {
      await purchaseCourse(course.id, 'student-1');
      setPurchased(true);
      toast('Compra realizada com sucesso!', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setPurchasing(false);
    }
  }

  async function handleReview(rating: number, text: string) {
    setReviewLoading(true);
    try {
      const review = await createReview(id, 'student-1', rating, text);
      setReviews((prev) => [review, ...prev]);
      toast('Avaliação enviada!', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setReviewLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton variant="card" className="h-56" />
        <Skeleton variant="text" className="h-8 w-64" />
        <Skeleton variant="card" className="h-40" />
      </div>
    );
  }

  if (!course) return null;

  const totalVideos = course.modules.reduce((s, m) => s + m.videos.length, 0);

  return (
    <div className="min-h-screen bg-bb-gray-50 pb-8">
      {/* Hero / Preview Video */}
      <div className="relative flex aspect-video max-h-[400px] w-full items-center justify-center bg-bb-black">
        <div className="text-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
          </svg>
          <p className="mt-2 text-sm opacity-60">Preview do Curso</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 sm:p-6">
          <Badge variant="active" size="sm">{MODALITY_LABEL[course.modality]}</Badge>
          <h1 className="mt-2 text-xl font-bold text-white sm:text-2xl">{course.title}</h1>
          <p className="mt-1 text-sm text-white/70">{course.creator_name} · {course.creator_academy}</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Quick Stats + Purchase */}
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-sm text-bb-gray-500">
            <Stars rating={course.rating} />
            <span>({course.reviews_count} avaliações)</span>
            <span>{course.students_count} alunos</span>
            <span>{course.modules.length} módulos</span>
            <span>{totalVideos} aulas</span>
            <span>{Math.floor(course.duration_total / 60)}h {course.duration_total % 60}min</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-bb-black">
              R$ {course.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <Button
              onClick={handlePurchase}
              loading={purchasing}
              disabled={purchased}
              size="lg"
            >
              {purchased ? 'Comprado' : `Comprar R$ ${course.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            </Button>
          </div>
        </div>

        {/* Description */}
        <Card className="mt-6 p-4 sm:p-6">
          <h2 className="font-semibold text-bb-black">Sobre o Curso</h2>
          <p className="mt-2 text-sm text-bb-gray-700 leading-relaxed">{course.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="active" size="sm">Faixa {course.belt_level === 'todas' ? 'Todas' : course.belt_level}</Badge>
            <Badge variant="pending" size="sm">{MODALITY_LABEL[course.modality]}</Badge>
          </div>
        </Card>

        {/* Modules Accordion */}
        <div className="mt-6">
          <h2 className="mb-3 font-semibold text-bb-black">Conteúdo do Curso</h2>
          <div className="space-y-2">
            {course.modules.map((mod, idx) => {
              const isOpen = expandedModule === mod.id;
              return (
                <Card key={mod.id} className="overflow-hidden p-0">
                  <button
                    onClick={() => setExpandedModule(isOpen ? null : mod.id)}
                    className="flex w-full items-center justify-between p-4 text-left hover:bg-bb-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-bb-gray-100 text-xs font-bold text-bb-gray-500">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-medium text-bb-black text-sm">{mod.title}</p>
                        <p className="text-xs text-bb-gray-500">{mod.videos.length} aulas · {mod.duration}min</p>
                      </div>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 text-bb-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="border-t border-bb-gray-100 bg-bb-gray-50 px-4 py-2">
                      {mod.videos.map((video, vIdx) => (
                        <div
                          key={video.id}
                          className="flex items-center gap-3 py-2 text-sm"
                        >
                          {purchased ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-bb-red" fill="currentColor" viewBox="0 0 24 24">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-bb-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                          )}
                          <span className={purchased ? 'text-bb-black' : 'text-bb-gray-400'}>
                            {vIdx + 1}. {video.title}
                          </span>
                          <span className="ml-auto text-xs text-bb-gray-500">{video.duration}min</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* About Professor */}
        <Card className="mt-6 p-4 sm:p-6">
          <h2 className="font-semibold text-bb-black">Sobre o Professor</h2>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bb-gray-200 text-lg font-bold text-bb-gray-500">
              {course.creator_name.split(' ').slice(-1)[0][0]}
            </div>
            <div>
              <p className="font-medium text-bb-black">{course.creator_name}</p>
              <p className="text-sm text-bb-gray-500">{course.creator_academy}</p>
            </div>
          </div>
        </Card>

        {/* Rating Distribution */}
        {avgRating && (
          <Card className="mt-6 p-4 sm:p-6">
            <h2 className="font-semibold text-bb-black">Avaliações</h2>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="text-center">
                <p className="text-4xl font-bold text-bb-black">{avgRating.average.toFixed(1)}</p>
                <Stars rating={avgRating.average} />
                <p className="mt-1 text-xs text-bb-gray-500">{avgRating.total} avaliações</p>
              </div>
              <div className="flex-1 space-y-1">
                {avgRating.distribution.map((d) => (
                  <div key={d.stars} className="flex items-center gap-2 text-sm">
                    <span className="w-3 text-bb-gray-500">{d.stars}</span>
                    <span className="text-yellow-500 text-xs">&#9733;</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-bb-gray-100">
                      <div
                        className="h-full rounded-full bg-yellow-500"
                        style={{ width: avgRating.total > 0 ? `${(d.count / avgRating.total) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="w-6 text-right text-xs text-bb-gray-500">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Review Form */}
        <Card className="mt-6 p-4 sm:p-6">
          <h2 className="mb-3 font-semibold text-bb-black">Deixe sua avaliação</h2>
          <ReviewForm onSubmit={handleReview} loading={reviewLoading} />
        </Card>

        {/* Reviews List */}
        <div className="mt-6 space-y-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </div>
  );
}
