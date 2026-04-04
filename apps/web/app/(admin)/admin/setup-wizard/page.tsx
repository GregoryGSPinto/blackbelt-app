'use client';

import { useRouter } from 'next/navigation';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';

export default function SetupWizardPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-6">
      <OnboardingWizard
        onComplete={() => router.push('/admin')}
        academyId={getActiveAcademyId()}
      />
    </div>
  );
}
