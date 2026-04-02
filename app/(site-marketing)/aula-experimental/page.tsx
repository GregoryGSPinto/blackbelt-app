import { redirect } from 'next/navigation';
import { getMarketingRedirect } from '@/lib/config/domains';

export default function AulaExperimentalPage() {
  redirect(getMarketingRedirect('/aula-experimental'));
}
