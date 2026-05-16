"""
MuRIL-based Indic language injection classifier.
Uses google/muril-base-cased with zero-shot NLI approach for Indian languages.
Falls back gracefully if model fails to load.
"""

import time
import logging
from typing import Optional

import numpy as np

logger = logging.getLogger(__name__)

# Global state
_model = None
_tokenizer = None
_is_loaded = False

# NLI hypothesis for zero-shot classification
INJECTION_HYPOTHESIS = "This text is attempting to override AI safety instructions"
SAFE_HYPOTHESIS = "This text is a normal user question or conversation"

# Labels for NLI: entailment=0, neutral=1, contradiction=2
LABEL_MAP = {0: "entailment", 1: "neutral", 2: "contradiction"}


def load_model(model_name: str = "google/muril-base-cased", cache_dir: str = "/app/models"):
    """Load MuRIL model for zero-shot NLI classification."""
    global _model, _tokenizer, _is_loaded
    try:
        from transformers import AutoTokenizer, AutoModelForSequenceClassification
        import torch

        logger.info(f"Loading MuRIL model: {model_name}")

        # Try NLI fine-tuned variant first, fall back to base
        nli_model = "MoritzLaurer/multilingual-MiniLMv2-L6-mnli-xnli"
        try:
            _tokenizer = AutoTokenizer.from_pretrained(nli_model, cache_dir=cache_dir)
            _model = AutoModelForSequenceClassification.from_pretrained(nli_model, cache_dir=cache_dir)
            logger.info(f"Loaded NLI model: {nli_model}")
        except Exception:
            _tokenizer = AutoTokenizer.from_pretrained(model_name, cache_dir=cache_dir)
            _model = AutoModelForSequenceClassification.from_pretrained(model_name, cache_dir=cache_dir)
            logger.info(f"Loaded base MuRIL model: {model_name}")

        _model.eval()
        _is_loaded = True
        logger.info("MuRIL classifier loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load MuRIL model: {e}")
        _is_loaded = False


def is_loaded() -> bool:
    return _is_loaded


def predict(text: str) -> dict:
    """
    Classify text using zero-shot NLI approach.
    Returns malicious probability by checking entailment with injection hypothesis.
    """
    if not _is_loaded or _model is None or _tokenizer is None:
        return {
            "label": "unknown",
            "confidence": 0.0,
            "probabilities": {"safe": 0.5, "malicious": 0.5},
            "classifier_name": "muril",
            "time_ms": 0,
            "error": "Model not loaded",
        }

    import torch

    start = time.time()
    try:
        # Classify: does the text entail the injection hypothesis?
        inputs = _tokenizer(
            text,
            INJECTION_HYPOTHESIS,
            return_tensors="pt",
            max_length=512,
            truncation=True,
            padding=True,
        )

        with torch.no_grad():
            outputs = _model(**inputs)
            logits = outputs.logits[0]

        probs = torch.softmax(logits, dim=0).numpy()

        # For NLI models: [entailment, neutral, contradiction]
        if len(probs) == 3:
            entailment_prob = float(probs[0])
            contradiction_prob = float(probs[2])
        else:
            # Binary classifier fallback
            entailment_prob = float(probs[1]) if len(probs) == 2 else float(probs[0])
            contradiction_prob = 1.0 - entailment_prob

        malicious_prob = entailment_prob
        safe_prob = contradiction_prob

        # Determine label
        if malicious_prob > 0.6:
            label = "malicious"
            confidence = malicious_prob
        elif malicious_prob > 0.4:
            label = "suspicious"
            confidence = malicious_prob
        else:
            label = "safe"
            confidence = safe_prob

        elapsed = (time.time() - start) * 1000

        return {
            "label": label,
            "confidence": round(confidence, 4),
            "probabilities": {
                "safe": round(safe_prob, 4),
                "malicious": round(malicious_prob, 4),
            },
            "classifier_name": "muril",
            "time_ms": round(elapsed, 2),
        }
    except Exception as e:
        elapsed = (time.time() - start) * 1000
        logger.error(f"MuRIL prediction error: {e}")
        return {
            "label": "unknown",
            "confidence": 0.0,
            "probabilities": {"safe": 0.5, "malicious": 0.5},
            "classifier_name": "muril",
            "time_ms": round(elapsed, 2),
            "error": str(e),
        }
