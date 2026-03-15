import type { HealthDataPoint, WearableSession, RealtimeMetrics } from '@/lib/api/wearable.service';

const delay = () => new Promise((r) => setTimeout(r, 400));

function generateHRCurve(minutes: number): number[] {
  const points: number[] = [];
  for (let i = 0; i < minutes; i++) {
    let hr: number;
    if (i < 5) {
      hr = 70 + (i / 5) * 30;
    } else if (i < 15) {
      hr = 100 + ((i - 5) / 10) * 40;
    } else if (i < 45) {
      hr = 140 + Math.sin(i * 0.3) * 20 + Math.random() * 10;
    } else if (i < 55) {
      hr = 150 + Math.sin(i * 0.5) * 15 + Math.random() * 10;
    } else {
      hr = 160 - ((i - 55) / 5) * 80;
    }
    points.push(Math.round(Math.max(60, Math.min(180, hr))));
  }
  return points;
}

const now = new Date();

function makeHealthDataPoints(days: number): HealthDataPoint[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (days - 1 - i));
    const isTrainDay = [1, 3, 5].includes(d.getDay());
    const active = isTrainDay ? 55 + Math.round(Math.random() * 15) : 15 + Math.round(Math.random() * 20);
    const steps = isTrainDay ? 8000 + Math.round(Math.random() * 4000) : 3000 + Math.round(Math.random() * 3000);
    const calories = isTrainDay ? 450 + Math.round(Math.random() * 200) : 150 + Math.round(Math.random() * 100);
    return {
      timestamp: d.toISOString(),
      heart_rate_bpm: isTrainDay ? 130 + Math.round(Math.random() * 20) : 68 + Math.round(Math.random() * 10),
      calories_burned: calories,
      active_minutes: active,
      steps,
      heart_rate_zones: {
        rest_minutes: isTrainDay ? 5 : 30,
        fat_burn_minutes: isTrainDay ? 15 : 10,
        cardio_minutes: isTrainDay ? 25 + Math.round(Math.random() * 10) : 2,
        peak_minutes: isTrainDay ? 10 + Math.round(Math.random() * 5) : 0,
      },
    };
  });
}

const healthData30 = makeHealthDataPoints(30);

const hrCurve = generateHRCurve(60);

const trainingSessions: WearableSession[] = [
  {
    class_id: 'class-1',
    student_id: 'student-1',
    start: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    end: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 60,
    avg_heart_rate: 142,
    max_heart_rate: 174,
    calories: 620,
    intensity_score: 82,
  },
  {
    class_id: 'class-2',
    student_id: 'student-1',
    start: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000).toISOString(),
    end: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 55,
    avg_heart_rate: 138,
    max_heart_rate: 168,
    calories: 540,
    intensity_score: 76,
  },
  {
    class_id: 'class-3',
    student_id: 'student-1',
    start: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000).toISOString(),
    end: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 65,
    avg_heart_rate: 148,
    max_heart_rate: 178,
    calories: 710,
    intensity_score: 88,
  },
  {
    class_id: 'class-1',
    student_id: 'student-1',
    start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000).toISOString(),
    end: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 60,
    avg_heart_rate: 140,
    max_heart_rate: 170,
    calories: 580,
    intensity_score: 79,
  },
  {
    class_id: 'class-2',
    student_id: 'student-1',
    start: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000).toISOString(),
    end: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 50,
    avg_heart_rate: 135,
    max_heart_rate: 165,
    calories: 490,
    intensity_score: 72,
  },
];

export { hrCurve };

export async function mockSyncHealthData(_userId: string, data: unknown[]): Promise<{ synced: number }> {
  await delay();
  return { synced: Array.isArray(data) ? data.length : 0 };
}

export async function mockGetHealthHistory(_userId: string, period: '7d' | '30d' | '90d'): Promise<HealthDataPoint[]> {
  await delay();
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  if (days <= 30) return healthData30.slice(-days);
  return makeHealthDataPoints(days);
}

export async function mockGetRealtimeMetrics(_userId: string): Promise<RealtimeMetrics> {
  await delay();
  return {
    heart_rate_bpm: 72,
    calories_today: 320,
    steps_today: 5400,
    active_minutes_today: 35,
    last_sync: new Date().toISOString(),
    device_connected: true,
    device_name: 'Apple Watch Series 9',
    battery_pct: 68,
  };
}

export async function mockGetTrainingSession(_userId: string): Promise<WearableSession[]> {
  await delay();
  return trainingSessions;
}
