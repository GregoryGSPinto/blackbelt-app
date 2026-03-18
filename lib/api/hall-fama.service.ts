import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

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
    // API not yet implemented — use mock
    const { mockGetHallOfFame } = await import('@/lib/mocks/hall-fama.mock');
      return mockGetHallOfFame(academyId);
  } catch (error) { handleServiceError(error, 'hallFama.get'); }
}
