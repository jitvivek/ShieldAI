"""
Classification router — POST /classify endpoint.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.models.classifier import get_classifier

router = APIRouter()


class ClassifyRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=50000)
    normalized_text: Optional[str] = None


class ClassifyResponse(BaseModel):
    label: str
    confidence: float
    probabilities: dict
    inference_time_ms: float


@router.post("/classify", response_model=ClassifyResponse)
async def classify(request: ClassifyRequest):
    """Classify text as safe, suspicious, or malicious."""
    try:
        classifier = get_classifier()
        result = classifier.classify(
            text=request.text,
            normalized_text=request.normalized_text,
        )
        return ClassifyResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")
