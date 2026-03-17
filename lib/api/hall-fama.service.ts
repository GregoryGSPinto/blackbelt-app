import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export interface RecordDTO {
  id: string;
  category: string;
  title: string;
  holderName: string;
  holderAvatar: string | null;
  value: string;
  description: string;
  achievedAt: string;
  modality: string;
}

export interface HallOfFameDTO {
  records: RecordDTO[];
  updatedAt: string;
}

export async function getHallOfFame(academyId: string): Promise<HallOfFameDTO> {
  try {
    if (isMock()) {
      const { mockGetHallOfFame } = await import('@/lib/mocks/hall-fama.mock');
      return mockGetHallOfFame(academyId);
    }
    try {
      const res = await fetch(`/api/hall-of-fame?academyId=${academyId}`);
      if (!res.ok) throw new ServiceError(res.status, 'hallFama.get');
      return res.json();
    } catch {
      console.warn('[hall-fama.getHallOfFame] API not available, using fallback');
      return {} as HallOfFameDTO;
    }
  } catch (error) { handleServiceError(error, 'hallFama.get'); }
}
