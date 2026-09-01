# FinPilot AI

> Autonomous Finance Controller for Small Businesses

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | FastAPI, Python 3.12, SQLAlchemy 2.0 (async) |
| Database | PostgreSQL 16 + pgvector |
| Cache / Queue | Redis 7, Celery |
| AI | Google Gemini 1.5 Pro, LangChain |

---

## Quick Start (Docker Compose)

```bash
# 1. Clone and configure
cp backend/.env.example backend/.env
# Edit backend/.env — add your GOOGLE_API_KEY and set a strong SECRET_KEY

# 2. Start all services
docker compose up -d

# 3. Run database migrations
docker compose exec backend alembic upgrade head

# 4. Open the app
open http://localhost:3000
```

---

## Development (without Docker)

### Backend

Requirements: Python 3.12, PostgreSQL 16 with pgvector, Redis 7

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt

# Copy and configure env
cp .env.example .env

# Run migrations
alembic upgrade head

# Start API server
uvicorn app.main:app --reload --port 8000
```

### Frontend

Requirements: Node.js 20+

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
finpilot-ai/
├── backend/
│   ├── app/
│   │   ├── agents/          # AI agents (invoice, reconciliation, forecast…)
│   │   ├── api/v1/          # FastAPI routers
│   │   ├── core/            # Config, DB, Redis, security
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── repositories/    # Data access layer
│   │   ├── schemas/         # Pydantic request/response models
│   │   ├── services/        # Business logic
│   │   └── workers/         # Celery tasks
│   └── alembic/             # Database migrations
├── frontend/
│   └── src/
│       ├── app/             # Next.js App Router pages
│       ├── components/      # UI components
│       ├── hooks/           # React hooks
│       ├── lib/             # API client, utilities
│       ├── services/        # API service functions
│       ├── store/           # Zustand stores
│       └── types/           # TypeScript types
├── nginx/
└── docker-compose.yml
```

---

## Build Phases

| Phase | Status | Contents |
|---|---|---|
| 1 | ✅ | Architecture, schema, API contracts |
| 2 | ✅ | Auth, backend foundation, frontend scaffold |
| 3 | 🔜 | Dashboard, layout, navigation |
| 4 | 🔜 | Invoice OCR (Gemini Vision) |
| 5 | 🔜 | Reconciliation AI |
| 6 | 🔜 | Cash flow forecast engine |
| 7 | 🔜 | Financial Copilot (RAG + chat) |
| 8 | 🔜 | Report generation |
| 9 | 🔜 | Testing, optimization, deployment |

---

## API Documentation

With the backend running, visit:
- Swagger UI: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
- ReDoc: [http://localhost:8000/api/redoc](http://localhost:8000/api/redoc)

_(Hidden in production)_

---

## Security

- JWT access tokens (15 min) + refresh token rotation (7 days)
- Refresh tokens stored as SHA-256 hashes — raw tokens never persisted
- bcrypt cost factor 12
- Rate limiting: 100 req/min per IP via slowapi
- `business_id` enforced on every data query — no cross-tenant access possible
- All mutations logged to `audit_logs`
