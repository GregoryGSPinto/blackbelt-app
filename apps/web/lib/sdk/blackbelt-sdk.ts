// BlackBelt SDK - Local Development Kit
// Usage: import { BlackBeltSDK } from '@/lib/sdk/blackbelt-sdk'

export interface BlackBeltSDKConfig {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
}

export class BlackBeltSDK {
  private config: BlackBeltSDKConfig;

  constructor(config: BlackBeltSDKConfig) {
    this.config = { timeout: 30000, ...config };
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.config.baseUrl}/api/v1${path}`;
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(this.config.timeout!),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
      throw new BlackBeltAPIError(res.status, err.error?.message || 'Unknown error');
    }
    return res.json();
  }

  // Resources
  students = {
    list: (params?: { status?: string; limit?: number; cursor?: string }) =>
      this.request<PaginatedResponse<Student>>('GET', `/students?${toQuery(params)}`),
    create: (data: CreateStudentInput) =>
      this.request<{ data: Student }>('POST', '/students', data),
    get: (id: string) =>
      this.request<{ data: Student }>('GET', `/students/${id}`),
  };

  classes = {
    list: (params?: { limit?: number; cursor?: string }) =>
      this.request<PaginatedResponse<ClassItem>>('GET', `/classes?${toQuery(params)}`),
  };

  attendance = {
    list: (params?: { studentId?: string; classId?: string; limit?: number; cursor?: string }) =>
      this.request<PaginatedResponse<AttendanceRecord>>('GET', `/attendance?${toQuery(params)}`),
    create: (data: { studentId: string; classId: string }) =>
      this.request<{ data: AttendanceRecord }>('POST', '/attendance', data),
  };

  invoices = {
    list: (params?: { status?: string; limit?: number; cursor?: string }) =>
      this.request<PaginatedResponse<Invoice>>('GET', `/invoices?${toQuery(params)}`),
  };

  plans = {
    list: () => this.request<PaginatedResponse<Plan>>('GET', '/plans'),
  };

  events = {
    list: () => this.request<PaginatedResponse<Event>>('GET', '/events'),
  };
}

// Error class
export class BlackBeltAPIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'BlackBeltAPIError';
  }
}

// Helper types (simplified for SDK consumers)
interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; limit: number; nextCursor: string | null };
  links: { self: string; next: string | null };
}

interface Student {
  id: string;
  name: string;
  email: string;
  belt: string;
  status: string;
}

interface CreateStudentInput {
  name: string;
  email: string;
  belt?: string;
}

interface ClassItem {
  id: string;
  name: string;
  modality: string;
  schedule: string;
  capacity: number;
  enrolled: number;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string;
}

interface Invoice {
  id: string;
  studentId: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: string;
  paidAt: string | null;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
}

interface Event {
  id: string;
  name: string;
  date: string;
  type: string;
}

function toQuery(params?: Record<string, unknown>): string {
  if (!params) return '';
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
}
