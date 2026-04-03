# BlackBelt v2 — Public API Documentation

## Base URL
```
https://blackbeltv2.vercel.app/api/v1
```

## Authentication
All requests require an API key via the `X-API-Key` header:
```
X-API-Key: bb_live_your_key_here
```

Generate API keys at: Admin → Integrações → API

## Rate Limits
- **100 requests per minute** per API key
- Rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Pagination
Cursor-based pagination:
```json
{
  "data": [...],
  "meta": { "total": 150, "limit": 20, "nextCursor": "abc123" },
  "links": { "self": "/api/v1/students", "next": "/api/v1/students?cursor=abc123&limit=20" }
}
```

Query params: `?limit=20&cursor=abc123`

## Endpoints

### Students

#### `GET /api/v1/students`
List all students.

Query params: `status` (active|inactive), `limit`, `cursor`

Response:
```json
{
  "data": [
    { "id": "st-1", "name": "João Silva", "email": "joao@email.com", "belt": "blue", "status": "active" }
  ],
  "meta": { "total": 48, "limit": 20, "nextCursor": null }
}
```

#### `POST /api/v1/students`
Create a student.

Body:
```json
{ "name": "Maria Santos", "email": "maria@email.com", "belt": "white" }
```

### Classes

#### `GET /api/v1/classes`
List all classes.

Response includes: `id`, `name`, `modality`, `schedule`, `capacity`, `enrolled`

### Attendance

#### `GET /api/v1/attendance`
List attendance records.

#### `POST /api/v1/attendance`
Register attendance.

Body:
```json
{ "studentId": "st-1", "classId": "cl-1" }
```

### Invoices

#### `GET /api/v1/invoices`
List invoices. Read-only.

Response includes: `id`, `studentId`, `amount`, `currency`, `status`, `dueDate`, `paidAt`

### Plans

#### `GET /api/v1/plans`
List available plans. Read-only.

### Events

#### `GET /api/v1/events`
List events. Read-only.

## Webhooks (Outgoing)

Configure at: Admin → Integrações → Webhooks

### Available Events
- `student.created`, `student.updated`
- `attendance.created`
- `invoice.created`, `invoice.paid`, `invoice.overdue`
- `progression.created` (belt promotion)
- `subscription.created`, `subscription.cancelled`

### Delivery
- `POST` with JSON payload
- Signature: `X-BlackBelt-Signature` header with HMAC-SHA256
- Retry: 3 attempts with exponential backoff (1min, 5min, 30min)
- Always respond with `2xx` to acknowledge receipt

### Payload Format
```json
{
  "event": "student.created",
  "timestamp": "2025-07-10T14:30:00Z",
  "data": { "id": "st-1", "name": "João Silva", ... }
}
```

## Error Responses
```json
{
  "error": { "message": "Missing X-API-Key header", "status": 401 }
}
```

Status codes: `400` (bad request), `401` (unauthorized), `404` (not found), `429` (rate limited), `500` (server error)
