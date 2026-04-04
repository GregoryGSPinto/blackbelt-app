'use client';

import { CalendarView } from '@/components/calendar/CalendarView';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';

export default function AdminCalendarioPage() {
  return <CalendarView academyId={getActiveAcademyId()} title="Calendario da Academia" />;
}
