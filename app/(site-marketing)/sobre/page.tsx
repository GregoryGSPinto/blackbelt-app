import { redirect } from 'next/navigation';
import { getMarketingRedirect } from '@/lib/config/domains';

export default function SobrePage() {
  redirect(getMarketingRedirect('/sobre'));
}
