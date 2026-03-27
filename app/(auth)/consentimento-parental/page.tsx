import type { Metadata } from 'next';
import ParentalConsentFlow from '@/components/legal/ParentalConsentFlow';

export const metadata: Metadata = {
  title: 'Consentimento Parental — BlackBelt',
  description: 'Autorizacao do responsavel para uso do BlackBelt por menores',
};

export default function ConsentimentoParentalPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: 'var(--bb-depth-1)' }}
    >
      <ParentalConsentFlow />
    </div>
  );
}
