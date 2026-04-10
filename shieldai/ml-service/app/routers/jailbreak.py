"""
Phase 2 — Jailbreak classification router: POST /classify-jailbreak
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.models.jailbreak_classifier import get_jailbreak_classifier

router = APIRouter()


class JailbreakRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=50000)
    normalized_text: Optional[str] = None


class JailbreakResponse(BaseModel):
    label: str
    confidence: float
    probabilities: dict
    inference_time_ms: float


@router.post("/classify-jailbreak", response_model=JailbreakResponse)
async def classify_jailbreak(request: JailbreakRequest):
    """Classify text for jailbreak attempts (5-class)."""
    try:
        classifier = get_jailbreak_classifier()
        result = classifier.classify(
            text=request.text,
            normalized_text=request.normalized_text,
        )
        return JailbreakResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Jailbreak classification failed: {str(e)}")
