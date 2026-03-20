'use client';

import { useEffect, useState, useCallback } from 'react';
import { getStudentCard, type StudentCard } from '@/lib/api/access-control.service';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';

const BELT_COLORS: Record<string, string> = {
  Branca: 'bg-white border border-bb-gray-300',
  Cinza: 'bg-gray-400',
  Amarela: 'bg-yellow-400',
  Laranja: 'bg-orange-500',
  Verde: 'bg-green-600',
  Azul: 'bg-blue-600',
  Roxa: 'bg-purple-600',
  Marrom: 'bg-amber-800',
  Preta: 'bg-black',
  Coral: 'bg-red-500',
};

function QRCodeDisplay({ token, size = 200 }: { token: string; size?: number }) {
  // Render a visual QR code placeholder using the token
  const cells = 21;
  const cellSize = size / cells;
  // Simple deterministic pattern from token
  const hash = token.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

  return (
    <div className="mx-auto flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <rect width={size} height={size} fill="white" />
        {Array.from({ length: cells }, (_, row) =>
          Array.from({ length: cells }, (__, col) => {
            // Finder patterns (corners)
            const isFinderTL = row < 7 && col < 7;
            const isFinderTR = row < 7 && col >= cells - 7;
            const isFinderBL = row >= cells - 7 && col < 7;
            const isFinder = isFinderTL || isFinderTR || isFinderBL;

            let filled = false;
            if (isFinder) {
              const lr = isFinderTL ? row : isFinderTR ? row : row - (cells - 7);
              const lc = isFinderTL ? col : isFinderTR ? col - (cells - 7) : col;
              const outer = lr === 0 || lr === 6 || lc === 0 || lc === 6;
              const inner = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
              filled = outer || inner;
            } else {
              filled = ((hash + row * 31 + col * 17) % 3) !== 0;
            }

            return filled ? (
              <rect
                key={`${row}-${col}`}
                x={col * cellSize}
                y={row * cellSize}
                width={cellSize}
                height={cellSize}
                fill="black"
              />
            ) : null;
          }),
        )}
      </svg>
    </div>
  );
}

export default function CarteirinhaPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState<StudentCard | null>(null);
  const [countdown, setCountdown] = useState('');

  const loadCard = useCallback(() => {
    getStudentCard('student-1')
      .then(setCard)
      .catch((err) => toast(translateError(err), 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    loadCard();
  }, [loadCard]);

  // Auto-renew QR code
  useEffect(() => {
    if (!card) return;

    const interval = setInterval(() => {
      const expiresAt = new Date(card.qr_code_expires).getTime();
      const remaining = Math.max(0, expiresAt - Date.now());

      if (remaining <= 0) {
        loadCard();
        return;
      }

      const min = Math.floor(remaining / 60000);
      const sec = Math.floor((remaining % 60000) / 1000);
      setCountdown(`${min}:${sec.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [card, loadCard]);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!card) return <div className="p-6 text-center text-sm text-bb-gray-500">Carteirinha indisponível.</div>;

  const beltClass = BELT_COLORS[card.belt] || 'bg-bb-gray-400';
  const isActive = card.membership_active;

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-xl font-bold text-bb-black">Carteirinha Digital</h1>

      {/* Card */}
      <Card className="overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-bb-primary to-bb-primary/80 px-6 py-4 text-white">
          <p className="text-xs font-medium opacity-80">{card.academy}</p>
          <p className="text-[10px] opacity-60">{card.unit}</p>
        </div>

        {/* Student Info */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-bb-gray-200">
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-bb-gray-400">
                {card.student_name.charAt(0)}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-bb-black">{card.student_name}</h2>
              <div className="mt-1 flex items-center gap-2">
                <div className={`h-3 w-12 rounded ${beltClass}`} />
                <span className="text-xs text-bb-gray-500">Faixa {card.belt}</span>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="border-t border-bb-gray-100 px-6 py-6 text-center">
          {isActive ? (
            <>
              <QRCodeDisplay token={card.qr_code_token} size={180} />
              <p className="mt-3 text-xs text-bb-gray-500">
                Apresente na catraca para acesso
              </p>
              <p className="mt-1 text-[10px] text-bb-gray-400">
                Atualiza em {countdown || '...'}
              </p>
            </>
          ) : (
            <div className="py-8">
              <p className="text-sm font-medium text-red-600">Matrícula Inativa</p>
              <p className="mt-1 text-xs text-bb-gray-500">Regularize sua situação para acessar a academia.</p>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center justify-between border-t border-bb-gray-100 px-6 py-3">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-bb-gray-500">
              {isActive ? 'Matrícula ativa' : 'Matrícula inativa'}
            </span>
          </div>
          <span className="text-[10px] text-bb-gray-400">
            Válida até {new Date(card.membership_expires).toLocaleDateString('pt-BR')}
          </span>
        </div>
      </Card>

      {/* Add to Wallet */}
      <Button variant="primary" className="w-full">
        Adicionar ao Wallet
      </Button>

      {/* ID */}
      <p className="text-center text-[10px] text-bb-gray-400">
        ID: {card.student_id}
      </p>
    </div>
  );
}
