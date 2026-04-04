'use client';

import { forwardRef, useState } from 'react';
import { Button } from '@/components/ui/Button';

interface ReviewFormProps {
  onSubmit: (rating: number, text: string) => Promise<void>;
  loading?: boolean;
}

const ReviewForm = forwardRef<HTMLFormElement, ReviewFormProps>(function ReviewForm({ onSubmit, loading }, ref) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [text, setText] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0 || text.trim().length < 10) return;
    await onSubmit(rating, text.trim());
    setRating(0);
    setText('');
  }

  const displayRating = hoveredRating || rating;

  return (
    <form ref={ref} onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-bb-black mb-2">Sua avaliação</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className={`text-2xl transition-colors ${
                star <= displayRating ? 'text-yellow-500' : 'text-bb-gray-300'
              } hover:scale-110`}
            >
              &#9733;
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 self-center text-sm text-bb-gray-500">
              {rating === 1 ? 'Ruim' : rating === 2 ? 'Regular' : rating === 3 ? 'Bom' : rating === 4 ? 'Muito bom' : 'Excelente'}
            </span>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-bb-black mb-1">Seu comentário</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Conte como foi sua experiência com o curso..."
          rows={4}
          className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm text-bb-black placeholder:text-bb-gray-400 focus:border-bb-red focus:outline-none focus:ring-1 focus:ring-bb-red"
        />
        <p className="mt-1 text-xs text-bb-gray-500">Mínimo de 10 caracteres ({text.length}/10)</p>
      </div>

      <Button
        type="submit"
        disabled={rating === 0 || text.trim().length < 10}
        loading={loading}
        className="w-full sm:w-auto"
      >
        Enviar Avaliação
      </Button>
    </form>
  );
});

ReviewForm.displayName = 'ReviewForm';
export { ReviewForm };
