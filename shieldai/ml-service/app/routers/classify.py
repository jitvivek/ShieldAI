"""
Classification router — POST /classify endpoint.
Routes to DeBERTa (English) or MuRIL (Indic) based on detected language.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.models.classifier import get_classifier
from app.models import indic_classifier
from app.models import language_detector

router = APIRouter()

INDIC_LANGUAGES = {"hi", "ta", "te", "bn", "mr", "gu", "kn", "ml", "pa", "or", "as", "ur"}


class ClassifyRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=50000)
    normalized_text: Optional[str] = None
    language: Optional[str] = None


class ClassifyResponse(BaseModel):
    label: str
    confidence: float
    probabilities: dict
    inference_time_ms: float
    language_detected: Optional[str] = None
    classifier_used: Optional[str] = None


@router.post("/classify", response_model=ClassifyResponse)
async def classify(request: ClassifyRequest):
    """Classify text as safe, suspicious, or malicious.
    Routes to appropriate classifier based on detected language."""
    try:
        # Detect language if not provided
        lang = request.language
        is_code_mixed = False
        if not lang:
            lang_result = language_detector.detect(request.text)
            lang = lang_result["language"]
            is_code_mixed = lang_result["is_code_mixed"]

        text = request.text

        # Route based on language
        if lang in INDIC_LANGUAGES and indic_classifier.is_loaded():
            # Pure Indic → MuRIL
            result = indic_classifier.predict(text)
            classifier_used = "muril"
        elif is_code_mixed and indic_classifier.is_loaded():
            # Code-mixed → run both, take max
            en_classifier = get_classifier()
            en_result = en_classifier.classify(text=text, normalized_text=request.normalized_text)
            hi_result = indic_classifier.predict(text)

            en_mal = en_result.get("probabilities", {}).get("malicious", 0)
            hi_mal = hi_result.get("probabilities", {}).get("malicious", 0)

            if hi_mal > en_mal:
                result = hi_result
                classifier_used = "muril+deberta-ensemble"
            else:
                result = en_result
                classifier_used = "deberta+muril-ensemble"
        else:
            # English or fallback → DeBERTa
            classifier = get_classifier()
            result = classifier.classify(text=text, normalized_text=request.normalized_text)
            classifier_used = "deberta"

        return ClassifyResponse(
            label=result.get("label", "unknown"),
            confidence=result.get("confidence", 0.0),
            probabilities=result.get("probabilities", {}),
            inference_time_ms=result.get("inference_time_ms", result.get("time_ms", 0)),
            language_detected=lang,
            classifier_used=classifier_used,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")
