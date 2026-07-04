"""
CodeForge AI - Vector Service (Lightweight Edition)
====================================================
A minimal FastAPI microservice for vector storage and similarity search.
Uses numpy cosine similarity instead of ChromaDB + sentence-transformers,
keeping memory under 100MB (safe for Render free tier 512MB limit).

Embeddings are provided by the Spring Boot backend (Gemini text-embedding-004).
This service ONLY stores and retrieves pre-computed embedding vectors.

Endpoints:
  POST /embed   - chunk text, accept embeddings, store them
  POST /query   - find top-k similar chunks by cosine similarity
  POST /delete  - remove all vectors for a project
  GET  /health  - health check
  GET  /docs    - FastAPI Swagger UI
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import json
import os
import uuid

# ─────────────────────────────────────────────
# App Setup
# ─────────────────────────────────────────────
app = FastAPI(
    title="CodeForge AI - Vector Service",
    description="Lightweight vector store for RAG — no PyTorch required",
    version="2.0.0",
)

# Persist vector store to a JSON file (mounted volume on Docker / Render disk)
STORAGE_PATH = os.environ.get("VECTOR_STORE_PATH", "/data/vector_store.json")

# In-memory vector store: list of dicts
# Each entry: { id, text, embedding (list[float]), metadata (dict) }
vector_store: List[dict] = []


def load_store():
    """Load persisted vectors from disk on startup."""
    global vector_store
    try:
        if os.path.exists(STORAGE_PATH):
            with open(STORAGE_PATH, "r", encoding="utf-8") as f:
                vector_store = json.load(f)
            print(f"[VectorStore] Loaded {len(vector_store)} vectors from {STORAGE_PATH}")
        else:
            vector_store = []
            print("[VectorStore] Starting with empty store")
    except Exception as e:
        print(f"[VectorStore] Load error (starting empty): {e}")
        vector_store = []


def save_store():
    """Persist vectors to disk."""
    try:
        os.makedirs(os.path.dirname(STORAGE_PATH), exist_ok=True)
        with open(STORAGE_PATH, "w", encoding="utf-8") as f:
            json.dump(vector_store, f)
    except Exception as e:
        print(f"[VectorStore] Save warning: {e}")


def cosine_similarity(a: List[float], b: List[float]) -> float:
    """Compute cosine similarity between two embedding vectors."""
    va = np.array(a, dtype=np.float32)
    vb = np.array(b, dtype=np.float32)
    norm_a = np.linalg.norm(va)
    norm_b = np.linalg.norm(vb)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(va, vb) / (norm_a * norm_b))


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 100) -> List[str]:
    """Simple sliding-window chunker (~chunk_size chars per chunk)."""
    if len(text) <= chunk_size:
        return [text]
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunks.append(text[start:end])
        if end == len(text):
            break
        start = end - overlap
    return chunks


# ─────────────────────────────────────────────
# Request / Response Models
# ─────────────────────────────────────────────

class EmbedRequest(BaseModel):
    content: str
    user_id: str
    project_id: str
    file_name: str
    language: Optional[str] = "text"
    # Pre-computed embeddings from Spring Boot (Gemini text-embedding-004)
    # If provided, stored as-is. If omitted, chunks are stored as text-only (no similarity).
    embeddings: Optional[List[List[float]]] = None


class QueryRequest(BaseModel):
    query: str
    user_id: str
    top_k: int = 4
    # Query embedding from Spring Boot (Gemini)
    query_embedding: Optional[List[float]] = None


class DeleteRequest(BaseModel):
    project_id: str


# ─────────────────────────────────────────────
# Startup
# ─────────────────────────────────────────────

@app.on_event("startup")
def startup():
    load_store()


# ─────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status": "ok",
        "vectors_stored": len(vector_store),
    }


@app.post("/embed")
def embed(req: EmbedRequest):
    """
    Chunk the content and store each chunk with its embedding.
    If embeddings are provided (from Spring Boot/Gemini), they are stored directly.
    Otherwise text is stored for keyword fallback.
    """
    chunks = chunk_text(req.content)
    added = 0

    for i, chunk in enumerate(chunks):
        embedding = None
        if req.embeddings and i < len(req.embeddings):
            embedding = req.embeddings[i]

        entry = {
            "id": str(uuid.uuid4()),
            "text": chunk,
            "embedding": embedding,
            "metadata": {
                "user_id": req.user_id,
                "project_id": req.project_id,
                "file_name": req.file_name,
                "language": req.language or "text",
            },
        }
        vector_store.append(entry)
        added += 1

    save_store()
    return {"status": "indexed", "chunks_added": added}


@app.post("/query")
def query(req: QueryRequest):
    """
    Return top-k most relevant chunks for a query.
    Uses cosine similarity if query_embedding is provided,
    otherwise falls back to keyword substring match.
    """
    # Filter by user_id
    user_vectors = [v for v in vector_store if v["metadata"].get("user_id") == req.user_id]

    if not user_vectors:
        return {"results": []}

    # Cosine similarity search (when embedding provided)
    if req.query_embedding:
        scored = []
        for v in user_vectors:
            if v.get("embedding"):
                score = cosine_similarity(req.query_embedding, v["embedding"])
                scored.append((score, v["text"]))
        scored.sort(key=lambda x: x[0], reverse=True)
        results = [text for _, text in scored[:req.top_k]]
    else:
        # Fallback: keyword substring match
        q_lower = req.query.lower()
        matched = [v["text"] for v in user_vectors if q_lower in v["text"].lower()]
        results = matched[:req.top_k]

    return {"results": results}


@app.post("/delete")
def delete(req: DeleteRequest):
    """Remove all stored vectors for a given project."""
    global vector_store
    before = len(vector_store)
    vector_store = [
        v for v in vector_store
        if v["metadata"].get("project_id") != req.project_id
    ]
    removed = before - len(vector_store)
    save_store()
    return {"status": "deleted", "chunks_removed": removed}


@app.get("/stats")
def stats():
    """Return aggregate store statistics."""
    projects = set(v["metadata"].get("project_id") for v in vector_store)
    users = set(v["metadata"].get("user_id") for v in vector_store)
    return {
        "total_vectors": len(vector_store),
        "unique_projects": len(projects),
        "unique_users": len(users),
    }
