"""
Embedding router — POST /embed endpoint.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List

from app.models.embedder import get_embedder

router = APIRouter()


class EmbedRequest(BaseModel):
    texts: List[str] = Field(..., min_length=1, max_length=100)


class EmbedResponse(BaseModel):
    embeddings: List[List[float]]
    inference_time_ms: float


@router.post("/embed", response_model=EmbedResponse)
async def embed(request: EmbedRequest):
    """Generate embeddings for a list of texts."""
    try:
        embedder = get_embedder()
        result = embedder.embed(request.texts)
        return EmbedResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding failed: {str(e)}")
