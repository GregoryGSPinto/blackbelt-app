import { isMock } from '@/lib/env';
import type { Subscription } from '@/lib/types';
import { logServiceError } from '@/lib/api/errors';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, plans(name, price, interval)')
      .eq('student_id', studentId)
      .eq('status', 'active')
      .maybeSingle();
    if (error || !data) {
      logServiceError(error, 'subscriptions');
      const { mockGetSubscriptionByStudent } = await import('@/lib/mocks/subscriptions.mock');
      return mockGetSubscriptionByStudent(studentId);
    }
    return data as unknown as SubscriptionWithPlan;
  } catch (error) {
    logServiceError(error, 'subscriptions');
    const { mockGetSubscriptionByStudent } = await import('@/lib/mocks/subscriptions.mock');
    return mockGetSubscriptionByStudent(studentId);
  }
}

export async function createSubscription(studentId: string, planId: string): Promise<Subscription> {
  try {
    if (isMock()) {
      const { mockCreateSubscription } = await import('@/lib/mocks/subscriptions.mock');
      return mockCreateSubscription(studentId, planId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({ student_id: studentId, plan_id: planId, status: 'active' })
      .select()
      .single();
    if (error || !data) {
      logServiceError(error, 'subscriptions');
      const { mockCreateSubscription } = await import('@/lib/mocks/subscriptions.mock');
      return mockCreateSubscription(studentId, planId);
    }
    return data as unknown as Subscription;
  } catch (error) {
    logServiceError(error, 'subscriptions');
    const { mockCreateSubscription } = await import('@/lib/mocks/subscriptions.mock');
    return mockCreateSubscription(studentId, planId);
  }
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockCancelSubscription } = await import('@/lib/mocks/subscriptions.mock');
      return mockCancelSubscription(subscriptionId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('id', subscriptionId);
    if (error) {
      logServiceError(error, 'subscriptions');
    }
  } catch (error) {
    logServiceError(error, 'subscriptions');
  }
}

export async function changePlan(subscriptionId: string, newPlanId: string): Promise<Subscription> {
  try {
    if (isMock()) {
      const { mockChangePlan } = await import('@/lib/mocks/subscriptions.mock');
      return mockChangePlan(subscriptionId, newPlanId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ plan_id: newPlanId })
      .eq('id', subscriptionId)
      .select()
      .single();
    if (error || !data) {
      logServiceError(error, 'subscriptions');
      const { mockChangePlan } = await import('@/lib/mocks/subscriptions.mock');
      return mockChangePlan(subscriptionId, newPlanId);
    }
    return data as unknown as Subscription;
  } catch (error) {
    logServiceError(error, 'subscriptions');
    const { mockChangePlan } = await import('@/lib/mocks/subscriptions.mock');
    return mockChangePlan(subscriptionId, newPlanId);
  }
}
