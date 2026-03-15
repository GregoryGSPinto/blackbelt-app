'use client';

import { forwardRef, useState } from 'react';
import type { Review } from '@/lib/api/reviews.service';
import { Card } from '@/components/ui/Card';

interface ReviewCardProps {
  review: Review;
  onHelpful?: (reviewId: string) => void;
}

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'text-sm' : 'text-lg';
  return (
    <span className={`flex gap-0.5 ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rating ? 'text-yellow-500' : 'text-bb-gray-300'}>
          &#9733;
        </span>
      ))}
    </span>
  );
}

const ReviewCard = forwardRef<HTMLDivElement, ReviewCardProps>(function ReviewCard({ review, onHelpful }, ref) {
  const [helpful, setHelpful] = useState(false);

  function handleHelpful() {
    if (helpful) return;
    setHelpful(true);
    onHelpful?.(review.id);
  }

  return (
    <Card ref={ref} className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bb-gray-100 text-xs font-bold text-bb-gray-500">
            {review.user_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-medium text-bb-black">{review.user_name}</p>
            <p className="text-xs text-bb-gray-500">Faixa {review.user_belt}</p>
          </div>
        </div>
        <span className="text-xs text-bb-gray-500">
          {new Date(review.created_at).toLocaleDateString('pt-BR')}
        </span>
      </div>

      <div className="mt-2">
        <Stars rating={review.rating} />
      </div>

      <p className="mt-2 text-sm text-bb-gray-700 leading-relaxed">{review.text}</p>

      {review.creator_response && (
        <div className="mt-3 rounded-lg bg-bb-gray-50 p-3 border-l-2 border-bb-red">
          <p className="text-xs font-semibold text-bb-gray-500 mb-1">Resposta do Professor</p>
          <p className="text-sm text-bb-gray-700">{review.creator_response}</p>
        </div>
      )}

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={handleHelpful}
          disabled={helpful}
          className={`flex items-center gap-1 text-xs transition-colors ${
            helpful ? 'text-bb-red' : 'text-bb-gray-500 hover:text-bb-red'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={helpful ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          {helpful ? `${review.helpful_count + 1}` : `${review.helpful_count}`} {review.helpful_count === 1 && !helpful ? 'pessoa achou útil' : 'pessoas acharam útil'}
        </button>
      </div>
    </Card>
  );
});

ReviewCard.displayName = 'ReviewCard';
export { ReviewCard, Stars };
