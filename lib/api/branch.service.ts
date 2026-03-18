import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
import type { Branch, CreateBranchPayload, BranchStats } from '@/lib/types/branch';

export async function listBranches(academyId: string): Promise<Branch[]> {
  try {
    if (isMock()) {
      const { mockListBranches } = await import('@/lib/mocks/branch.mock');
      return mockListBranches(academyId);
    }
    // API not yet implemented — use mock
    const { mockListBranches } = await import('@/lib/mocks/branch.mock');
      return mockListBranches(academyId);
  } catch (error) {
    handleServiceError(error, 'branch.list');
  }
}

export async function getBranch(branchId: string): Promise<Branch> {
  try {
    if (isMock()) {
      const { mockGetBranch } = await import('@/lib/mocks/branch.mock');
      return mockGetBranch(branchId);
    }
    // API not yet implemented — use mock
    const { mockGetBranch } = await import('@/lib/mocks/branch.mock');
      return mockGetBranch(branchId);
  } catch (error) {
    handleServiceError(error, 'branch.get');
  }
}

export async function createBranch(
  academyId: string,
  payload: CreateBranchPayload,
): Promise<Branch> {
  try {
    if (isMock()) {
      const { mockCreateBranch } = await import('@/lib/mocks/branch.mock');
      return mockCreateBranch(academyId, payload);
    }
    try {
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ academyId, ...payload }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[branch.createBranch] API not available, using mock fallback');
      const { mockCreateBranch } = await import('@/lib/mocks/branch.mock');
      return mockCreateBranch(academyId, payload);
    }

  } catch (error) {
    handleServiceError(error, 'branch.create');
  }
}

export async function getBranchStats(academyId: string): Promise<BranchStats[]> {
  try {
    if (isMock()) {
      const { mockBranchStats } = await import('@/lib/mocks/branch.mock');
      return mockBranchStats(academyId);
    }
    // API not yet implemented — use mock
    const { mockBranchStats } = await import('@/lib/mocks/branch.mock');
      return mockBranchStats(academyId);
  } catch (error) {
    handleServiceError(error, 'branch.stats');
  }
}
