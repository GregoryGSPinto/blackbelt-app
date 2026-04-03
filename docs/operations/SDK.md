# BlackBelt SDK

Local development kit for integrating with the BlackBelt API.

## Installation

This is a local SDK (not published to npm). Import directly:

```typescript
import { BlackBeltSDK } from '@/lib/sdk/blackbelt-sdk';
```

## Initialization

```typescript
const sdk = new BlackBeltSDK({
  baseUrl: 'https://blackbelts.com.br',
  apiKey: 'bb_live_xxxxxxxxxxxxxxxx',
  timeout: 30000, // optional, default 30s
});
```

## Resources

### Students

```typescript
// List students (cursor-based pagination)
const students = await sdk.students.list({ status: 'active', limit: 20 });

// Get a single student
const student = await sdk.students.get('student-id');

// Create a student
const created = await sdk.students.create({ name: 'John Doe', email: 'john@example.com', belt: 'white' });
```

### Classes

```typescript
const classes = await sdk.classes.list({ limit: 50 });
```

### Attendance

```typescript
// List attendance records
const records = await sdk.attendance.list({ studentId: 'student-id', limit: 100 });

// Register attendance
const attendance = await sdk.attendance.create({ studentId: 'student-id', classId: 'class-id' });
```

### Invoices

```typescript
const invoices = await sdk.invoices.list({ status: 'pending', limit: 20 });
```

### Plans

```typescript
const plans = await sdk.plans.list();
```

### Events

```typescript
const events = await sdk.events.list();
```

## Webhook Validation

Validate incoming webhook signatures using HMAC-SHA256:

```typescript
import { validateWebhookSignature, parseWebhookEvent } from '@/lib/sdk/webhooks-validator';

const isValid = await validateWebhookSignature(rawBody, signatureHeader, webhookSecret);

if (isValid) {
  const event = parseWebhookEvent(rawBody);
  console.log(event.event); // e.g. 'student.created'
  console.log(event.data);  // event payload
}
```

## Error Handling

The SDK throws `BlackBeltAPIError` for non-2xx responses:

```typescript
import { BlackBeltAPIError } from '@/lib/sdk/blackbelt-sdk';

try {
  await sdk.students.get('invalid-id');
} catch (err) {
  if (err instanceof BlackBeltAPIError) {
    console.error(err.status);  // HTTP status code
    console.error(err.message); // Error message from API
  }
}
```

## Pagination

All list endpoints return paginated responses:

```typescript
interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; limit: number; nextCursor: string | null };
  links: { self: string; next: string | null };
}
```

Use `nextCursor` to fetch subsequent pages:

```typescript
let cursor: string | undefined;
do {
  const page = await sdk.students.list({ cursor, limit: 50 });
  processStudents(page.data);
  cursor = page.meta.nextCursor ?? undefined;
} while (cursor);
```

## Rate Limits

- 100 requests per minute per API key
- Responses include `X-RateLimit-Remaining` header
