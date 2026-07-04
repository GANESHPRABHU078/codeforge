"""
CodeForge AI - Vector Service
A lightweight FastAPI microservice that wraps ChromaDB and exposes a
simple embed/query/delete API for the Spring Boot backend's RagService.

Endpoints:
  POST /embed   - chunk + embed + store a piece of content
  POST /query   - retrieve top-k relevant chunks for a query
  POST /delete  - remove all vectors for a project
  GET  /health  - health check
"""

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import chromadb
from chromadb.utils import embedding_functions
import uuid

app = FastAPI(title="CodeForge AI - Vector Service")

# Persistent local ChromaDB store (mounted as a Docker volume in docker-compose)
client = chromadb.PersistentClient(path="/data/chroma")

# Uses a local sentence-transformers model so this microservice doesn't need
# its own external API key. Swap for Gemini's embedding-001 model if you'd
# rather keep embeddings consistent with the generation provider.
embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

code_collection = client.get_or_create_collection(
    name="code_snippets_collection", embedding_function=embedding_fn
)
best_practices_collection = client.get_or_create_collection(
    name="best_practices_collection", embedding_function=embedding_fn
)


class EmbedRequest(BaseModel):
    content: str
    user_id: str
    project_id: str
    file_name: str
    language: Optional[str] = "text"


class QueryRequest(BaseModel):
    query: str
    user_id: str
    top_k: int = 4


class DeleteRequest(BaseModel):
    project_id: str


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 100) -> List[str]:
    """Simple sliding-window chunker (~chunk_size chars per chunk)."""
    if len(text) <= chunk_size:
        return [text]
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    return chunks


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/embed")
def embed(req: EmbedRequest):
    chunks = chunk_text(req.content)
    ids = [str(uuid.uuid4()) for _ in chunks]
    metadatas = [
        {
            "user_id": req.user_id,
            "project_id": req.project_id,
            "file_name": req.file_name,
            "language": req.language or "text",
        }
        for _ in chunks
    ]

    code_collection.add(documents=chunks, ids=ids, metadatas=metadatas)
    return {"status": "indexed", "chunks_added": len(chunks)}


@app.post("/query")
def query(req: QueryRequest):
    results = code_collection.query(
        query_texts=[req.query],
        n_results=req.top_k,
        where={"user_id": req.user_id},
    )

    documents = results.get("documents", [[]])[0] if results.get("documents") else []
    return {"results": documents}


@app.post("/delete")
def delete(req: DeleteRequest):
    code_collection.delete(where={"project_id": req.project_id})
    return {"status": "deleted"}
