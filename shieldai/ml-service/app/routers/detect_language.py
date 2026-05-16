"""
POST /detect-language — Language detection endpoint.
Detects language, script, and code-mixing for input text.
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.models import language_detector

router = APIRouter()


class DetectLanguageRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000)


class DetectLanguageResponse(BaseModel):
    language: str
    confidence: float
    is_code_mixed: bool
    time_ms: float


@router.post("/detect-language", response_model=DetectLanguageResponse)
async def detect_language(request: DetectLanguageRequest):
    """Detect the language of input text."""
    result = language_detector.detect(request.text)
    return DetectLanguageResponse(**result)
