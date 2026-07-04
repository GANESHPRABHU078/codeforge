# CodeForge AI — AI-Powered Code Generation Agent

CodeForge AI converts natural-language software requirements into
production-ready, multi-file source code using structured prompt
engineering, Retrieval-Augmented Generation (RAG), and the Google
Gemini API (with Groq as a pluggable fallback).

## Features
- JWT-secured multi-user platform
- Natural language -> multi-file code generation
- Prompt engineering: role prompting, few-shot examples, RAG context
  injection, internal chain-of-thought, self-reflection correction pass
- Secondary AI agents: Explain, Generate Tests, Generate Docs,
  Detect Errors, Refactor, Quality Suggestions, Deployment Suggestions
- Project save / search / version history / ZIP export
- Chat with your generated code (RAG-grounded)

## Tech Stack
Java 17 · Spring Boot 3 · React 18 + Vite + Tailwind · MongoDB ·
ChromaDB (via a Python FastAPI wrapper) · Google Gemini API · Docker

## Project Structure
```
codeforge-ai/
├── codeforge-backend/     Spring Boot REST API (layered architecture)
├── codeforge-frontend/    React + Vite + Tailwind SPA
├── vector-service/        FastAPI + ChromaDB microservice (RAG)
├── docker-compose.yml
└── .env.example
```

## Getting Started

### Option A — Docker (recommended)

Prerequisites: Docker & Docker Compose, a Gemini API key (https://ai.google.dev)

```bash
cp .env.example .env        # then fill in GEMINI_API_KEY and JWT_SECRET
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Swagger docs: http://localhost:8080/swagger-ui.html
- Vector service health check: http://localhost:8000/health

### Option B — Run services individually (for development)

**MongoDB:** run locally or via `docker run -p 27017:27017 mongo:7`

**Vector service:**
```bash
cd vector-service
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

**Backend:**
```bash
cd codeforge-backend
export GEMINI_API_KEY=your-key
export JWT_SECRET=your-secret
mvn spring-boot:run
```

**Frontend:**
```bash
cd codeforge-frontend
npm install
npm run dev
```

## API Overview
See `docs/architecture` notes in the original project blueprint for the
full endpoint list, sequence diagram, and class diagram. Core endpoints:

```
POST /api/auth/register | /api/auth/login | /api/auth/refresh
POST /api/generate/code | /explain | /tests | /docs | /detect-errors
     | /refactor | /quality-suggestions | /deployment-suggestions
GET  /api/projects | /api/projects/{id} | /api/projects/{id}/download
GET  /api/projects/{id}/versions
POST /api/projects/{id}/chat
```

All endpoints except `/api/auth/**` require `Authorization: Bearer <jwt>`.

## Notes on This Scaffold
This is a complete, compilable-by-inspection scaffold: every layer
(controller → service → repository, security, prompt templates, RAG
client, LLM strategy pattern) is wired end-to-end. Things worth doing
before your first real run:

1. Get a free Gemini API key and put it in `.env`.
2. Run `mvn clean package` inside `codeforge-backend` once, locally
   (this sandbox doesn't have access to Maven Central, so the backend
   hasn't been build-verified here — the frontend has been).
3. Adjust `application.yml` if you're pointing at MongoDB Atlas instead
   of a local/containerized instance.

## License
MIT
