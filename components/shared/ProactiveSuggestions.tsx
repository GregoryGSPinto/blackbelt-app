'use client';

import { forwardRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  getSuggestions,
  dismissSuggestion,
  type Suggestion,
  type UserRole,
} from '@/lib/api/suggestions.service';
import { Card } from '@/components/ui/Card';

// ── Priority styles ────────────────────────────────────────────────────

const PRIORITY_BORDER: Record<string, string> = {
  high: 'border-l-4 border-l-bb-red',
  medium: 'border-l-4 border-l-yellow-500',
  low: 'border-l-4 border-l-blue-500',
};

// ── Props ──────────────────────────────────────────────────────────────

interface ProactiveSuggestionsProps {
  role: UserRole;
  userId: string;
  academyId: string;
}

// ── Component ──────────────────────────────────────────────────────────

const ProactiveSuggestions = forwardRef<HTMLDivElement, ProactiveSuggestionsProps>(
  function ProactiveSuggestions({ role, userId, academyId }, ref) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(true);

    const loadSuggestions = useCallback(async () => {
      try {
        const data = await getSuggestions(role, userId, academyId);
        setSuggestions(data);
      } catch {
        // Silently fail - suggestions are non-critical
      } finally {
        setLoading(false);
      }
    }, [role, userId, academyId]);

    useEffect(() => {
      loadSuggestions();
    }, [loadSuggestions]);

    async function handleDismiss(suggestionId: string) {
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
      try {
        await dismissSuggestion(suggestionId);
      } catch {
        // Already removed from UI - no need to revert
      }
    }

    if (loading || suggestions.length === 0) return null;

    return (
      <div ref={ref} className="space-y-3">
        <h3 className="text-sm font-semibold text-bb-gray-500">
          Sugestoes para voce
        </h3>
        {suggestions.map((suggestion) => (
          <Card
            key={suggestion.id}
            className={`relative p-3 ${PRIORITY_BORDER[suggestion.priority] ?? ''}`}
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-lg">{suggestion.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-bb-black">
                  {suggestion.title}
                </p>
                <p className="mt-0.5 text-xs text-bb-gray-500">
                  {suggestion.description}
                </p>
                <Link
                  href={suggestion.actionUrl}
                  className="mt-2 inline-block text-xs font-medium text-bb-red hover:underline"
                >
                  {suggestion.actionLabel}
                </Link>
              </div>
              <button
                onClick={() => handleDismiss(suggestion.id)}
                className="shrink-0 rounded-full p-1 text-bb-gray-500 transition-colors hover:bg-bb-gray-100 hover:text-bb-gray-700"
                aria-label="Dispensar sugestao"
                title="Dispensar por 7 dias"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </Card>
        ))}
      </div>
    );
  },
);

ProactiveSuggestions.displayName = 'ProactiveSuggestions';

export { ProactiveSuggestions };
export type { ProactiveSuggestionsProps };
