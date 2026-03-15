import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { Subscription } from '@/lib/types';

export interface SubscriptionWithPlan extends Subscription {
  plan_name: string;
  plan_price: number;
  plan_interval: string;
}

export async function getSubscriptionByStudent(studentId: string): Promise<SubscriptionWithPlan> {
  try {
    if (isMock()) {
      const { mockGetSubscriptionByStudent } = await import('@/lib/mocks/subscriptions.mock');
      return mockGetSubscriptionByStudent(studentId);
    }
    const res = await fetch(`/api/subscriptions?studentId=${studentId}`);
    if (!res.ok) throw new ServiceError(res.status, 'subscriptions.getByStudent');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'subscriptions.getByStudent');
  }
}

export async function createSubscription(studentId: string, planId: string): Promise<Subscription> {
  try {
    if (isMock()) {
      const { mockCreateSubscription } = await import('@/lib/mocks/subscriptions.mock');
      return mockCreateSubscription(studentId, planId);
    }
    const res = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId, plan_id: planId }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'subscriptions.create');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'subscriptions.create');
  }
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockCancelSubscription } = await import('@/lib/mocks/subscriptions.mock');
      return mockCancelSubscription(subscriptionId);
    }
    const res = await fetch(`/api/subscriptions/${subscriptionId}/cancel`, { method: 'POST' });
    if (!res.ok) throw new ServiceError(res.status, 'subscriptions.cancel');
  } catch (error) {
    handleServiceError(error, 'subscriptions.cancel');
  }
}

export async function changePlan(subscriptionId: string, newPlanId: string): Promise<Subscription> {
  try {
    if (isMock()) {
      const { mockChangePlan } = await import('@/lib/mocks/subscriptions.mock');
      return mockChangePlan(subscriptionId, newPlanId);
    }
    const res = await fetch(`/api/subscriptions/${subscriptionId}/change-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan_id: newPlanId }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'subscriptions.changePlan');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'subscriptions.changePlan');
  }
}
