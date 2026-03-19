'use client';

import { AuthProvider } from '@/lib/contexts/AuthContext';
import { ToastProvider } from '@/lib/contexts/ToastContext';
import { ThemeProvider } from '@/lib/contexts/ThemeContext';
import { TutorialProvider } from '@/components/tutorial/TutorialProvider';
import { TutorialOverlay } from '@/components/tutorial/TutorialOverlay';
import { TutorialWelcome } from '@/components/tutorial/TutorialWelcome';
import { TutorialComplete } from '@/components/tutorial/TutorialComplete';
import { TutorialFAB } from '@/components/tutorial/TutorialFAB';
import { WelcomeMessage } from '@/components/shared/WelcomeMessage';
import SupportWidget from '@/components/support/SupportWidget';
import { TelemetryInit } from '@/components/support/TelemetryInit';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TutorialProvider>
          <ToastProvider>
            {children}
            <WelcomeMessage />
            <TutorialWelcome />
            <TutorialOverlay />
            <TutorialComplete />
            <TutorialFAB />
            <SupportWidget />
            <TelemetryInit />
          </ToastProvider>
        </TutorialProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
