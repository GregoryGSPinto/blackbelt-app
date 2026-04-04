'use client';

import { useState, useCallback, useEffect } from 'react';

// ── Types ─────────────────────────────────────────────────────

export interface TourStep {
  target: string; // CSS selector
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export interface Tour {
  id: string;
  name: string;
  steps: TourStep[];
}

const STORAGE_KEY = 'bb_completed_tours';

// ── Hook ──────────────────────────────────────────────────────

export function useProductTour(tourId: string) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isActive, setIsActive] = useState(false);

  const getCompletedTours = useCallback((): string[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  const hasCompleted = useCallback(() => {
    return getCompletedTours().includes(tourId);
  }, [tourId, getCompletedTours]);

  const markCompleted = useCallback(() => {
    const completed = getCompletedTours();
    if (!completed.includes(tourId)) {
      completed.push(tourId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
    }
  }, [tourId, getCompletedTours]);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const endTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(-1);
    markCompleted();
  }, [markCompleted]);

  const nextStep = useCallback((totalSteps: number) => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      endTour();
    }
  }, [currentStep, endTour]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const resetTour = useCallback(() => {
    const completed = getCompletedTours().filter((id) => id !== tourId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
  }, [tourId, getCompletedTours]);

  // Auto-start on first visit
  useEffect(() => {
    if (!hasCompleted()) {
      const timer = setTimeout(() => startTour(), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCompleted, startTour]);

  return {
    currentStep,
    isActive,
    hasCompleted: hasCompleted(),
    startTour,
    nextStep,
    prevStep,
    endTour,
    resetTour,
  };
}

// ── Tour definitions ──────────────────────────────────────────

export const ADMIN_TOUR: Tour = {
  id: 'admin-first-visit',
  name: 'Tour do Admin',
  steps: [
    { target: '[data-tour="sidebar"]', title: 'Menu Lateral', content: 'Navegue entre todas as seções da academia pelo menu lateral.', placement: 'right' },
    { target: '[data-tour="dashboard-headlines"]', title: 'Métricas', content: 'Acompanhe os números mais importantes em tempo real.', placement: 'bottom' },
    { target: '[data-tour="quick-actions"]', title: 'Ações Rápidas', content: 'Acesse as funcionalidades mais usadas com um clique.', placement: 'top' },
    { target: '[data-tour="notifications"]', title: 'Notificações', content: 'Fique por dentro de tudo que acontece na academia.', placement: 'bottom' },
    { target: '[data-tour="search"]', title: 'Busca (Cmd+K)', content: 'Encontre qualquer coisa rapidamente com Cmd+K.', placement: 'bottom' },
  ],
};

export const STUDENT_TOUR: Tour = {
  id: 'student-first-visit',
  name: 'Tour do Aluno',
  steps: [
    { target: '[data-tour="checkin-fab"]', title: 'Check-in', content: 'Registre sua presença no treino com um toque.', placement: 'top' },
    { target: '[data-tour="progress"]', title: 'Seu Progresso', content: 'Acompanhe sua evolução, XP e conquistas.', placement: 'bottom' },
    { target: '[data-tour="content"]', title: 'Conteúdo', content: 'Assista vídeos e faça quizzes para aprender mais.', placement: 'bottom' },
  ],
};
