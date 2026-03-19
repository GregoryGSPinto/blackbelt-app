'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { ROLE_TUTORIAL_MAP, getTutorialById } from '@/lib/tutorials/definitions';
import type { TutorialDefinition } from '@/lib/tutorials/definitions';
import type { TutorialProgress } from '@/lib/api/tutorial.service';
import * as tutorialService from '@/lib/api/tutorial.service';

// ── Context Types ──────────────────────────────────────────────────────

interface TutorialState {
  isActive: boolean;
  showWelcome: boolean;
  showWelcomeMessage: boolean;
  showComplete: boolean;
  currentTutorialId: string | null;
  currentTutorial: TutorialDefinition | null;
  currentStep: number;
  totalSteps: number;
  completedTutorials: string[];
  skippedTutorials: string[];
  inProgressTutorials: Record<string, number>; // tutorialId → currentStep
  progressLoaded: boolean;
}

interface TutorialContextValue extends TutorialState {
  startTutorial: (tutorialId: string) => void;
  beginSteps: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  dismissComplete: () => void;
  dismissWelcomeMessage: () => void;
  resetTutorial: (tutorialId: string) => void;
  isTutorialCompleted: (tutorialId: string) => boolean;
  shouldShowTutorial: (tutorialId: string) => boolean;
}

const TutorialContext = createContext<TutorialContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────

export function TutorialProvider({ children }: { children: ReactNode }) {
  const { profile, isProfileSwitch } = useAuth();

  // Guard: only auto-trigger the tutorial once per user per mount cycle.
  // This prevents re-triggering when effect deps change during the same session.
  const autoTriggeredForRef = useRef<string | null>(null);

  const [state, setState] = useState<TutorialState>({
    isActive: false,
    showWelcome: false,
    showWelcomeMessage: false,
    showComplete: false,
    currentTutorialId: null,
    currentTutorial: null,
    currentStep: 0,
    totalSteps: 0,
    completedTutorials: [],
    skippedTutorials: [],
    inProgressTutorials: {},
    progressLoaded: false,
  });

  // Load progress when profile changes
  useEffect(() => {
    if (!profile?.user_id) {
      setState((prev) => ({ ...prev, progressLoaded: false }));
      autoTriggeredForRef.current = null;
      return;
    }

    let cancelled = false;

    async function loadProgress() {
      try {
        const progress = await tutorialService.getTutorialProgress(profile!.user_id);
        if (cancelled) return;

        const completed = progress
          .filter((p: TutorialProgress) => p.status === 'completed')
          .map((p: TutorialProgress) => p.tutorial_id);
        const skipped = progress
          .filter((p: TutorialProgress) => p.status === 'skipped')
          .map((p: TutorialProgress) => p.tutorial_id);
        const inProgress: Record<string, number> = {};
        progress
          .filter((p: TutorialProgress) => p.status === 'in_progress')
          .forEach((p: TutorialProgress) => {
            inProgress[p.tutorial_id] = p.current_step;
          });

        setState((prev) => ({
          ...prev,
          completedTutorials: completed,
          skippedTutorials: skipped,
          inProgressTutorials: inProgress,
          progressLoaded: true,
        }));
      } catch {
        // On error, still mark as loaded but keep any existing progress
        // from the previous state so we don't re-trigger the tutorial
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            progressLoaded: true,
            // If we already have completed/skipped data (e.g. from a previous
            // successful load in this session), preserve it rather than clearing
          }));
        }
      }
    }

    loadProgress();
    return () => { cancelled = true; };
  }, [profile?.user_id]);

  // Auto-detect first access — only on initial login, NOT on profile switch or refresh
  useEffect(() => {
    if (!profile?.role || !profile?.user_id || !state.progressLoaded) return;
    if (state.isActive || state.showWelcome || state.showWelcomeMessage || state.showComplete) return;

    // Don't auto-trigger tutorial when user is switching profiles
    if (isProfileSwitch) return;

    const tutorialId = ROLE_TUTORIAL_MAP[profile.role];
    if (!tutorialId) return;

    // Only auto-trigger once per user+tutorial per mount cycle
    const triggerKey = `${profile.user_id}:${tutorialId}`;
    if (autoTriggeredForRef.current === triggerKey) return;

    const isCompleted = state.completedTutorials.includes(tutorialId);
    const isSkipped = state.skippedTutorials.includes(tutorialId);
    const inProgressStep = state.inProgressTutorials[tutorialId];
    const isInProgress = inProgressStep !== undefined;

    if (isCompleted || isSkipped) return;

    // Mark as triggered so we don't re-fire on subsequent renders
    autoTriggeredForRef.current = triggerKey;

    const tutorial = getTutorialById(tutorialId);
    if (!tutorial) return;

    if (isInProgress) {
      // Resume from where user left off
      setState((prev) => ({
        ...prev,
        isActive: true,
        showWelcome: false,
        showWelcomeMessage: false,
        currentTutorialId: tutorialId,
        currentTutorial: tutorial,
        totalSteps: tutorial.steps.length,
        currentStep: inProgressStep,
      }));
    } else {
      // First access — check if welcome message already shown
      const welcomeKey = `bb_welcome_shown_${profile.role}_${profile.user_id}`;
      const alreadyShownWelcome = typeof window !== 'undefined' && localStorage.getItem(welcomeKey) === '1';

      if (alreadyShownWelcome) {
        // Welcome message already shown — go straight to tutorial welcome
        setState((prev) => ({
          ...prev,
          showWelcome: true,
          showWelcomeMessage: false,
          currentTutorialId: tutorialId,
          currentTutorial: tutorial,
          totalSteps: tutorial.steps.length,
          currentStep: 0,
        }));
      } else {
        // First ever access — show welcome message first
        setState((prev) => ({
          ...prev,
          showWelcomeMessage: true,
          showWelcome: false,
          currentTutorialId: tutorialId,
          currentTutorial: tutorial,
          totalSteps: tutorial.steps.length,
          currentStep: 0,
        }));
      }
    }
  }, [profile?.role, profile?.user_id, state.progressLoaded, state.completedTutorials, state.skippedTutorials, state.inProgressTutorials, state.isActive, state.showWelcome, state.showWelcomeMessage, state.showComplete, isProfileSwitch]);

  const startTutorial = useCallback((tutorialId: string) => {
    const tutorial = getTutorialById(tutorialId);
    if (!tutorial) return;

    setState((prev) => ({
      ...prev,
      showWelcome: true,
      showComplete: false,
      isActive: false,
      currentTutorialId: tutorialId,
      currentTutorial: tutorial,
      totalSteps: tutorial.steps.length,
      currentStep: 0,
    }));
  }, []);

  const beginSteps = useCallback(() => {
    if (!profile?.user_id || !state.currentTutorialId) return;

    tutorialService.startTutorial(profile.user_id, state.currentTutorialId);

    setState((prev) => ({
      ...prev,
      showWelcome: false,
      isActive: true,
      currentStep: 0,
    }));
  }, [profile?.user_id, state.currentTutorialId]);

  const nextStep = useCallback(() => {
    setState((prev) => {
      if (!prev.currentTutorial) return prev;
      const next = prev.currentStep + 1;
      if (next >= prev.totalSteps) {
        // Complete
        if (profile?.user_id && prev.currentTutorialId) {
          tutorialService.completeTutorial(profile.user_id, prev.currentTutorialId);
        }
        return {
          ...prev,
          isActive: false,
          showComplete: true,
          currentStep: prev.totalSteps - 1,
          completedTutorials: prev.currentTutorialId
            ? [...prev.completedTutorials, prev.currentTutorialId]
            : prev.completedTutorials,
        };
      }

      if (profile?.user_id && prev.currentTutorialId) {
        tutorialService.updateTutorialStep(profile.user_id, prev.currentTutorialId, next);
      }

      return { ...prev, currentStep: next };
    });
  }, [profile?.user_id]);

  const prevStep = useCallback(() => {
    setState((prev) => {
      if (prev.currentStep <= 0) return prev;
      const next = prev.currentStep - 1;

      if (profile?.user_id && prev.currentTutorialId) {
        tutorialService.updateTutorialStep(profile.user_id, prev.currentTutorialId, next);
      }

      return { ...prev, currentStep: next };
    });
  }, [profile?.user_id]);

  const skipTutorialFn = useCallback(() => {
    if (profile?.user_id && state.currentTutorialId) {
      tutorialService.skipTutorial(profile.user_id, state.currentTutorialId);
    }

    setState((prev) => ({
      ...prev,
      isActive: false,
      showWelcome: false,
      showComplete: false,
      skippedTutorials: prev.currentTutorialId
        ? [...prev.skippedTutorials, prev.currentTutorialId]
        : prev.skippedTutorials,
      currentTutorialId: null,
      currentTutorial: null,
    }));
  }, [profile?.user_id, state.currentTutorialId]);

  const completeTutorialFn = useCallback(() => {
    if (profile?.user_id && state.currentTutorialId) {
      tutorialService.completeTutorial(profile.user_id, state.currentTutorialId);
    }

    setState((prev) => ({
      ...prev,
      isActive: false,
      showComplete: true,
      completedTutorials: prev.currentTutorialId
        ? [...prev.completedTutorials, prev.currentTutorialId]
        : prev.completedTutorials,
    }));
  }, [profile?.user_id, state.currentTutorialId]);

  const dismissWelcomeMessage = useCallback(() => {
    // Mark welcome message as shown in localStorage
    if (profile?.role && profile?.user_id) {
      const welcomeKey = `bb_welcome_shown_${profile.role}_${profile.user_id}`;
      if (typeof window !== 'undefined') {
        localStorage.setItem(welcomeKey, '1');
      }
    }

    // Transition to tutorial welcome
    setState((prev) => ({
      ...prev,
      showWelcomeMessage: false,
      showWelcome: true,
    }));
  }, [profile?.role, profile?.user_id]);

  const dismissComplete = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showComplete: false,
      currentTutorialId: null,
      currentTutorial: null,
    }));
  }, []);

  const resetTutorialFn = useCallback(async (tutorialId: string) => {
    if (!profile?.user_id) return;

    await tutorialService.resetTutorial(profile.user_id, tutorialId);

    // Clear auto-trigger guard so the tutorial can re-trigger
    autoTriggeredForRef.current = null;

    setState((prev) => ({
      ...prev,
      completedTutorials: prev.completedTutorials.filter((id) => id !== tutorialId),
      skippedTutorials: prev.skippedTutorials.filter((id) => id !== tutorialId),
      inProgressTutorials: Object.fromEntries(
        Object.entries(prev.inProgressTutorials).filter(([id]) => id !== tutorialId),
      ),
    }));

    // Auto-start after reset
    startTutorial(tutorialId);
  }, [profile?.user_id, startTutorial]);

  const isTutorialCompleted = useCallback((tutorialId: string) => {
    return state.completedTutorials.includes(tutorialId);
  }, [state.completedTutorials]);

  const shouldShowTutorial = useCallback((tutorialId: string) => {
    return !state.completedTutorials.includes(tutorialId) &&
      !state.skippedTutorials.includes(tutorialId);
  }, [state.completedTutorials, state.skippedTutorials]);

  const value = useMemo<TutorialContextValue>(() => ({
    ...state,
    startTutorial,
    beginSteps,
    nextStep,
    prevStep,
    skipTutorial: skipTutorialFn,
    completeTutorial: completeTutorialFn,
    dismissComplete,
    dismissWelcomeMessage,
    resetTutorial: resetTutorialFn,
    isTutorialCompleted,
    shouldShowTutorial,
  }), [state, startTutorial, beginSteps, nextStep, prevStep, skipTutorialFn, completeTutorialFn, dismissComplete, dismissWelcomeMessage, resetTutorialFn, isTutorialCompleted, shouldShowTutorial]);

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial(): TutorialContextValue {
  const ctx = useContext(TutorialContext);
  if (!ctx) throw new Error('useTutorial must be used within TutorialProvider');
  return ctx;
}
