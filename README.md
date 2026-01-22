# Airtable-style Grid Application

A high-performance, realtime collaborative grid application built with TanStack Table, Fastify, and PostgreSQL. Handles 50,000+ rows with virtualization, realtime synchronization across multiple browser tabs, and inline cell editing.

## Features

- **Large dataset rendering**: Handles 50,000+ rows with virtualization using TanStack Virtual
- **Realtime collaboration**: Updates sync across multiple browser tabs and server nodes using Postgres LISTEN/NOTIFY
- **Inline editing**: Support for text, number, and select cell types with optimistic updates
- **Infinite scroll**: Seamless loading as you scroll, backed by server-side pagination
- **Resilient connections**: Automatic reconnection with exponential backoff, keepalive pings
- **Connection status indicator**: Header badge shows connected/reconnecting/disconnected states
- **Loading states**: Skeleton rows on initial load, footer spinner for pagination
- **Offline-aware updates**: Clear error toasts and retry when network is unavailable
- **Docker Compose**: One-command setup for entire stack

## Tech Stack

### Frontend
- **TanStack Start** - React framework with file-based routing
- **TanStack Table** - Headless table UI library
- **TanStack Virtual** - Virtual scrolling for performance
- **TanStack React Query** - Data fetching, caching, and optimistic updates
- **shadcn/ui** - UI component library
- **Sonner** - Toast notifications
- **Lucide React** - Icon set
- **Vitest** - Unit testing framework
- **TypeScript** - Type safety

### Backend
- **Fastify** - Fast web framework
- **Drizzle ORM** - Type-safe SQL toolkit
- **PostgreSQL** - Database with LISTEN/NOTIFY for realtime
- **TypeScript** - Type safety

## Architecture

```
┌─────────────┐         ┌─────────────┐
│   Frontend  │────────▶│   Backend   │
│  (React)    │◀────────│  (Fastify) │
└─────────────┘  SSE    └─────────────┘
                            │      │
                            │      │ LISTEN
                            ▼      ▼
                      ┌──────────────┐
                      │  PostgreSQL  │
                      │  (NOTIFY)    │
                      └──────────────┘
```

### Data Flow

1. **Initial Load**: Frontend requests the first batch via `GET /rows?page=0&pageSize=100` using React Query's `useInfiniteQuery`
2. **Cell Edit**: User double-clicks cell → optimistic update in React Query cache → `PATCH /rows/:id` → server updates DB → broadcasts via NOTIFY
3. **Infinite Scroll**: As you approach the end, the next page is fetched and appended automatically
4. **Realtime Sync**: 
   - Server sends `NOTIFY row_updates` to PostgreSQL
   - All backend nodes with LISTEN clients receive the notification
   - Each node broadcasts to its connected SSE clients
   - Frontend receives update → React Query cache updated → UI re-renders
5. **Virtualization**: Only visible rows are rendered using TanStack Virtual (40px row height estimate)

### Realtime Implementation

**Multi-Node Support:**
- Uses Postgres `LISTEN`/`NOTIFY` as a message broker
- Each backend instance has a dedicated Postgres LISTEN client
- When Node A updates a row → PostgreSQL NOTIFY → All nodes receive → Each broadcasts to its SSE clients
- Works seamlessly across multiple server instances behind load balancer

**Resilience Features:**
- **Backend**: 
  - LISTEN client auto-reconnects on disconnect (5s retry)
  - Keepalive pings every 30s to prevent proxy timeouts
  - Error handling and cleanup for disconnected clients
- **Frontend**:
  - Automatic EventSource reconnection with exponential backoff (1s → 2s → 4s → ... → max 30s)
  - Filters keepalive ping messages
  - Tracks connection status (connected/reconnecting/disconnected) with header badge
  - Offline/online detection to prevent silent update failures
  - Clean shutdown on component unmount

## Setup

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)

### Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd table-demo
```

2. Run the entire stack:
```bash
docker compose up --build
```

This will:
- Start PostgreSQL on port 5432
- Start backend on port 3001
- Start frontend on port 3000
- Automatically create tables and seed 50,000 rows

3. Open http://localhost:3000 in your browser

The application will automatically:
- Load the first 100 rows
- Set up realtime synchronization
- Allow inline editing by double-clicking cells

### Local Development

#### Backend

```bash
cd backend
npm install
npm run dev
```

The backend will:
- Connect to Postgres (ensure it's running via Docker or locally)
- Auto-create tables on startup
- Seed data if database is empty
- Start server on http://localhost:3001

**Environment Variables** (`backend/.env`):
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/table_demo
PORT=3001
HOST=0.0.0.0
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will start on http://localhost:3000

**Environment Variables** (`frontend/.env`):
```
VITE_API_URL=http://localhost:3001
```

#### Running Tests

```bash
cd frontend
npm test
```

Tests use Vitest and cover:
- Component rendering (CellEditor)
- React Query hooks (useRowsQuery, useUpdateRow)

## API Endpoints

### `GET /rows`
Get paginated rows.

**Query Parameters:**
- `page` (number, default: 0) - Page number
- `pageSize` (number, default: 100, max: 1000) - Rows per page

**Response:**
```json
{
  "rows": [
    {
      "id": 1,
      "col_text_1": "Text 1-1",
      "col_number_1": 123.45,
      "col_select_1": "Option A",
      ...
    }
  ],
  "total": 50000,
  "page": 0,
  "pageSize": 100
}
```

### `PATCH /rows/:id`
Update a row.

**Body:**
```json
{
  "updates": {
    "col_text_1": "new value",
    "col_number_1": 123.45,
    "col_select_1": "Option A"
  }
}
```

**Response:** Updated row object

**Realtime:** Update is broadcast to all connected clients via SSE

### `GET /rows/realtime`
Server-Sent Events stream for realtime updates.

**Events:**
- `data: {"type":"connected"}` - Initial connection message
- `data: {"type":"ping"}` - Keepalive ping (every 30s)
- `data: {row object}` - Row update notification

**Reconnection:** Client automatically reconnects with exponential backoff on connection loss

## Database Schema

The `rows` table contains:
- `id` (INTEGER, PRIMARY KEY)
- `col_text_1` through `col_text_9` (TEXT)
- `col_number_1` through `col_number_6` (NUMERIC)
- `col_select_1` through `col_select_4` (VARCHAR(100))
- `updated_at` (TIMESTAMP)

## Known Limitations & Trade-offs

### Performance

- **Offset-based pagination**: Uses `LIMIT/OFFSET` which works well for 50k rows but becomes slower for very large datasets (>1M rows). For production at scale, consider cursor-based pagination using row IDs.
- **Virtualization**: Only rows in viewport are rendered, but all column headers are always rendered. For 100+ columns, consider column virtualization.
- **Realtime payload size**: Postgres LISTEN/NOTIFY has message size limits (~8000 bytes). Current implementation handles typical row updates well. For larger payloads, consider Redis Pub/Sub or a message queue.

### Scalability

- **Postgres LISTEN/NOTIFY**: Works well for single-digit server instances. For horizontal scaling beyond ~10 nodes, consider Redis Pub/Sub or a dedicated message broker (RabbitMQ, Kafka).
- **Connection Pooling**: Each server instance maintains a dedicated LISTEN connection. Monitor PostgreSQL connection limits under high load (default max_connections is typically 100).
- **SSE Connections**: Each browser tab maintains one SSE connection. With many concurrent users, consider connection limits and resource usage.

### Data Consistency

- **Optimistic Updates**: Frontend updates immediately, rolls back on error. In high-contention scenarios (multiple users editing same cell simultaneously), last-write-wins may cause lost updates. Consider conflict resolution strategies (e.g., operational transforms, CRDTs) for production.
- **Realtime Delivery**: SSE connections can drop due to network issues. Current implementation includes automatic reconnection, but there's a brief window where updates might be missed. Consider implementing a "catch-up" mechanism that fetches recent updates on reconnect.

### UX

- **Loading States**: Skeleton rows on initial load and footer spinner during pagination.
- **Error Handling**: Toast notifications with retry actions, including offline-specific errors.
- **Cell Editing**: Double-click to edit. Could add keyboard navigation (arrow keys, Enter, Tab) for power users.
- **Column Resizing**: Fixed column widths. Could add drag-to-resize functionality.

## Architecture Decisions (ADRs)

### ADR 1: TanStack Start over Next.js
**Decision**: Use TanStack Start as the React framework.

**Rationale**:
- Task requirement specified TanStack template
- File-based routing with TanStack Router provides good developer experience
- Excellent integration with TanStack Table and Virtual
- Type-safe routing with TypeScript

**Trade-offs**:
- Less mature ecosystem compared to Next.js
- Smaller community and fewer resources

### ADR 2: Postgres LISTEN/NOTIFY over Redis Pub/Sub
**Decision**: Use PostgreSQL LISTEN/NOTIFY for realtime synchronization.

**Rationale**:
- Simpler setup (no additional service required)
- Works across multiple server nodes via shared database
- Sufficient for this use case (internal tool, moderate scale)
- No additional infrastructure to manage

**Trade-offs**:
- Less scalable than Redis for 10+ nodes
- Message size limits (~8000 bytes)
- Single point of failure (PostgreSQL)

**Alternatives Considered**:
- Redis Pub/Sub: Better scalability, but requires additional service
- WebSockets with message broker: More complex, bidirectional communication not needed

### ADR 3: SSE over WebSockets
**Decision**: Use Server-Sent Events (SSE) for client communication.

**Rationale**:
- Simpler implementation (HTTP-based, no protocol upgrade)
- Automatic reconnection handling by browsers
- Sufficient for one-way server→client updates
- Lower overhead than WebSockets

**Trade-offs**:
- No bidirectional communication (not needed here)
- Some proxy/load balancer configurations may not support SSE well
- Browser connection limits (typically 6 per domain)

**Alternatives Considered**:
- WebSockets: More complex, bidirectional communication unnecessary
- Polling: Higher server load, less real-time

### ADR 4: Drizzle ORM over Prisma/TypeORM
**Decision**: Use Drizzle ORM for database access.

**Rationale**:
- Lightweight and performant
- Type-safe SQL queries
- Excellent TypeScript support
- Better control over SQL generation
- No runtime overhead

**Trade-offs**:
- Less mature than Prisma
- Smaller community
- More manual SQL writing required

### ADR 5: Optimistic Updates
**Decision**: Implement optimistic updates for cell edits.

**Rationale**:
- Immediate UI feedback improves perceived performance
- Better user experience (no waiting for server response)
- React Query provides built-in rollback on error

**Trade-offs**:
- Potential for lost updates in high-contention scenarios
- Requires careful error handling and rollback logic
- May show inconsistent state briefly

### ADR 6: Infinite Scroll over Pagination
**Decision**: Use infinite scroll for loading rows.

**Rationale**:
- Better UX for large datasets (no page navigation)
- Seamless data loading
- Works well with virtualization

**Trade-offs**:
- Harder to jump to specific rows
- No direct URL-based navigation to specific pages
- Memory usage grows as more pages are loaded (mitigated by virtualization)

## Development

### Database Migrations

```bash
cd backend
npm run db:generate  # Generate migration files
npm run db:migrate   # Run migrations
```

### Seeding

```bash
cd backend
npm run seed  # Seed 50,000 rows
```

The seed script:
- Generates random data for all columns
- Inserts in batches of 1000 for performance
- Skips if database already has data

### Project Structure

```
table-demo/
├── backend/
│   ├── src/
│   │   ├── db.ts              # Database connection
│   │   ├── schema.ts           # Drizzle schema
│   │   ├── server.ts           # Fastify server setup
│   │   ├── realtime.ts         # SSE + LISTEN/NOTIFY setup
│   │   ├── routes/
│   │   │   └── rows.ts         # API routes
│   │   ├── init-db.ts          # Database initialization
│   │   └── seed.ts             # Data seeding
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── grid/           # Table components
│   │   ├── hooks/               # React Query hooks
│   │   ├── lib/
│   │   │   ├── api.ts           # API client
│   │   │   └── query-client.tsx # React Query setup
│   │   ├── types/               # TypeScript types
│   │   └── routes/              # TanStack Router routes
│   └── Dockerfile
└── docker-compose.yml
```

## Testing

Run frontend tests:
```bash
cd frontend
npm test
```

Test coverage includes:
- Component rendering and interactions (CellEditor)
- React Query hooks (useRowsQuery, useUpdateRow)
- Error handling

## License

ISC
