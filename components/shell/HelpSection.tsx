'use client';

import { forwardRef, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTutorial } from '@/components/tutorial/TutorialProvider';
import { useToast } from '@/lib/hooks/useToast';
import { ROLE_TUTORIAL_MAP } from '@/lib/tutorials/definitions';
import { resetTourForProfile } from '@/lib/api/tour.service';
import { logServiceError } from '@/lib/api/errors';
import { HelpCircleIcon, LifeBuoyIcon, MessageIcon } from './icons';

// ── Sidebar Help Section ─────────────────────────────────────────────────
// Renders help items as sidebar links. Used in sidebar-based shells
// (Admin, SuperAdmin, Professor) as a nav group before the user card.

interface SidebarHelpSectionProps {
  onItemClick?: () => void;
  /** 'staff' = admin/professor/recepcao (ticket + whatsapp suporte),
   *  'student' = aluno/teen (fale com a academia),
   *  'kids' = tutorial only, no ticket/chat */
  variant?: 'staff' | 'student' | 'kids';
}

export const SidebarHelpSection = forwardRef<HTMLDivElement, SidebarHelpSectionProps>(
  function SidebarHelpSection({ onItemClick, variant = 'staff' }, ref) {
    const { profile } = useAuth();
    const { resetTutorial, isActive: isTutorialActive, progressLoaded } = useTutorial();
    const { toast } = useToast();

    const role = profile?.role ?? null;
    const tutorialId = role ? ROLE_TUTORIAL_MAP[role] : null;
    const canShowTutorial = !!tutorialId && progressLoaded && !isTutorialActive;

    function handleResetTutorial() {
      if (tutorialId) {
        resetTutorial(tutorialId);
        // Also reset the tour overlay (has_seen_tour flag)
        if (profile?.id) {
          resetTourForProfile(profile.id).catch((err) =>
            logServiceError(err, 'HelpSection.resetTour'),
          );
        }
        onItemClick?.();
      }
    }

    function handleOpenTicket() {
      toast('Sistema de tickets em breve!', 'info');
      onItemClick?.();
    }

    function handleFaleComAcademia() {
      toast('Fale com sua academia pelo chat de mensagens!', 'info');
      onItemClick?.();
    }

    return (
      <div ref={ref}>
        <p
          className="uppercase tracking-widest font-semibold"
          style={{
            fontSize: '10px',
            color: 'var(--bb-ink-30)',
            marginBottom: '4px',
            marginTop: '16px',
            paddingLeft: '16px',
          }}
        >
          AJUDA
        </p>
        <div className="flex flex-col gap-[2px]">
          {canShowTutorial && (
            <button
              type="button"
              onClick={handleResetTutorial}
              className="flex items-center gap-3 text-sm transition-colors text-left w-full"
              style={{
                padding: '10px 16px',
                borderRadius: 'var(--bb-radius-sm)',
                color: 'var(--bb-ink-60)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bb-depth-4)';
                e.currentTarget.style.color = 'var(--bb-ink-80)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--bb-ink-60)';
              }}
            >
              <HelpCircleIcon className="h-5 w-5" />
              Refazer Tutorial
            </button>
          )}

          {variant === 'staff' && (
            <>
              <button
                type="button"
                onClick={handleOpenTicket}
                className="flex items-center gap-3 text-sm transition-colors text-left w-full"
                style={{
                  padding: '10px 16px',
                  borderRadius: 'var(--bb-radius-sm)',
                  color: 'var(--bb-ink-60)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bb-depth-4)';
                  e.currentTarget.style.color = 'var(--bb-ink-80)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--bb-ink-60)';
                }}
              >
                <LifeBuoyIcon className="h-5 w-5" />
                Abrir Ticket
              </button>

              <a
                href="https://wa.me/5531996793625?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com%20o%20BlackBelt"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm transition-colors"
                style={{
                  padding: '10px 16px',
                  borderRadius: 'var(--bb-radius-sm)',
                  color: 'var(--bb-ink-60)',
                  textDecoration: 'none',
                }}
                onClick={() => onItemClick?.()}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bb-depth-4)';
                  e.currentTarget.style.color = 'var(--bb-ink-80)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--bb-ink-60)';
                }}
              >
                <MessageIcon className="h-5 w-5" />
                WhatsApp Suporte
              </a>
            </>
          )}

          {variant === 'student' && (
            <button
              type="button"
              onClick={handleFaleComAcademia}
              className="flex items-center gap-3 text-sm transition-colors text-left w-full"
              style={{
                padding: '10px 16px',
                borderRadius: 'var(--bb-radius-sm)',
                color: 'var(--bb-ink-60)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bb-depth-4)';
                e.currentTarget.style.color = 'var(--bb-ink-80)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--bb-ink-60)';
              }}
            >
              <MessageIcon className="h-5 w-5" />
              Fale com a Academia
            </button>
          )}

          {/* Kids variant: only shows tutorial reset, no ticket or chat */}
        </div>
      </div>
    );
  },
);

SidebarHelpSection.displayName = 'SidebarHelpSection';

// ── Header Help Button ───────────────────────────────────────────────────
// Compact help button + dropdown for bottom-nav shells that don't have a sidebar.

export function HeaderHelpButton({ variant = 'staff' }: { variant?: 'staff' | 'student' | 'kids' }) {
  const { profile } = useAuth();
  const { resetTutorial, isActive: isTutorialActive, progressLoaded } = useTutorial();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const role = profile?.role ?? null;
  const tutorialId = role ? ROLE_TUTORIAL_MAP[role] : null;
  const canShowTutorial = !!tutorialId && progressLoaded && !isTutorialActive;

  if (isTutorialActive) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
        style={{ color: 'var(--bb-ink-60)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--bb-ink-100)';
          e.currentTarget.style.background = 'var(--bb-depth-4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--bb-ink-60)';
          e.currentTarget.style.background = 'transparent';
        }}
        aria-label="Ajuda"
      >
        <HelpCircleIcon className="h-5 w-5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[51]" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-2 z-[52] w-56 overflow-hidden"
            style={{
              background: 'var(--bb-depth-3)',
              border: '1px solid var(--bb-glass-border)',
              boxShadow: 'var(--bb-shadow-lg)',
              borderRadius: 'var(--bb-radius-lg)',
              animation: 'scaleIn 0.15s ease-out',
              transformOrigin: 'top right',
            }}
          >
            <p
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--bb-ink-40)', borderBottom: '1px solid var(--bb-glass-border)' }}
            >
              Ajuda
            </p>

            {canShowTutorial && (
              <button
                type="button"
                onClick={() => {
                  if (tutorialId) resetTutorial(tutorialId);
                  // Also reset the tour overlay (has_seen_tour flag)
                  if (profile?.id) {
                    resetTourForProfile(profile.id).catch((err) =>
                      logServiceError(err, 'HeaderHelpButton.resetTour'),
                    );
                  }
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left"
                style={{ color: 'var(--bb-ink-80)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <HelpCircleIcon className="h-4 w-4" />
                Refazer Tutorial
              </button>
            )}

            {variant === 'staff' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    toast('Sistema de tickets em breve!', 'info');
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left"
                  style={{ color: 'var(--bb-ink-80)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <LifeBuoyIcon className="h-4 w-4" />
                  Abrir Ticket
                </button>

                <a
                  href="https://wa.me/5531996793625?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com%20o%20BlackBelt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                  style={{ color: 'var(--bb-ink-80)', textDecoration: 'none' }}
                  onClick={() => setOpen(false)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <MessageIcon className="h-4 w-4" />
                  WhatsApp Suporte
                </a>
              </>
            )}

            {variant === 'student' && (
              <button
                type="button"
                onClick={() => {
                  toast('Fale com sua academia pelo chat de mensagens!', 'info');
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left"
                style={{ color: 'var(--bb-ink-80)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <MessageIcon className="h-4 w-4" />
                Fale com a Academia
              </button>
            )}

            {/* Kids variant: only shows tutorial reset */}
          </div>
        </>
      )}
    </div>
  );
}

HeaderHelpButton.displayName = 'HeaderHelpButton';
