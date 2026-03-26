'use client';

import { AuthProvider } from '@/lib/contexts/AuthContext';
import { PlanProvider } from '@/lib/contexts/PlanContext';
import { ToastProvider } from '@/lib/contexts/ToastContext';
import { ThemeProvider } from '@/lib/contexts/ThemeContext';
import { TutorialProvider } from '@/components/tutorial/TutorialProvider';
import { TutorialOverlay } from '@/components/tutorial/TutorialOverlay';
import { TutorialWelcome } from '@/components/tutorial/TutorialWelcome';
import { TutorialComplete } from '@/components/tutorial/TutorialComplete';
import { WelcomeMessage } from '@/components/shared/WelcomeMessage';
import { TelemetryInit } from '@/components/support/TelemetryInit';
import { NativeBridge } from '@/components/native/NativeBridge';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PlanProvider>
          <TutorialProvider>
            <ToastProvider>
              {children}
              <NativeBridge />
              <WelcomeMessage />
              <TutorialWelcome />
              <TutorialOverlay />
              <TutorialComplete />
              <TelemetryInit />
            </ToastProvider>
          </TutorialProvider>
        </PlanProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
