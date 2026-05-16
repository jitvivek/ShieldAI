"""
Language detector using fasttext lid.176.bin model.
Detects 176 languages including all major Indian languages.
Falls back to heuristic detection if fasttext is unavailable.
"""

import re
import time
import logging
from typing import Optional

logger = logging.getLogger(__name__)

_model = None
_is_loaded = False

# Indian language codes supported
INDIC_LANGUAGES = {"hi", "ta", "te", "bn", "mr", "gu", "kn", "ml", "pa", "or", "as", "ur"}

# Hindi romanized word patterns for code-mix detection
HINDI_MARKERS = re.compile(
    r"\b(kya|hai|hain|hoon|mein|mujhe|tumhare|aapka|nahi|nahin|bhi|aur|lekin|"
    r"sabhi|saare|kripya|namaste|bahut|accha|pehle|baad|yahan|wahan|bhai|yaar|"
    r"dekh|sun|bol|chal|kar|karo|karna|ho|hota|hoti|raha|rahi|rahe|tha|thi|the|"
    r"wala|wali|wale|dena|lena|jana|aana|apna|tera|tumhara)\b",
    re.IGNORECASE,
)

# Script detection regex
DEVANAGARI = re.compile(r"[\u0900-\u097F]")
TAMIL_SCRIPT = re.compile(r"[\u0B80-\u0BFF]")
TELUGU_SCRIPT = re.compile(r"[\u0C00-\u0C7F]")
BENGALI_SCRIPT = re.compile(r"[\u0980-\u09FF]")


def load_model(cache_dir: str = "/app/models"):
    """Load fasttext language identification model."""
    global _model, _is_loaded
    try:
        import fasttext

        model_path = f"{cache_dir}/lid.176.bin"
        try:
            _model = fasttext.load_model(model_path)
            _is_loaded = True
            logger.info(f"Loaded fasttext language model from {model_path}")
        except Exception:
            # Try downloading via fasttext
            logger.warning(f"Model not found at {model_path}, downloading...")
            import urllib.request
            url = "https://dl.fbaipublicfiles.com/fasttext/supervised-models/lid.176.bin"
            urllib.request.urlretrieve(url, model_path)
            _model = fasttext.load_model(model_path)
            _is_loaded = True
            logger.info("Downloaded and loaded fasttext language model")
    except Exception as e:
        logger.error(f"Failed to load fasttext model: {e}. Using heuristic detection.")
        _is_loaded = False


def is_loaded() -> bool:
    return _is_loaded


def detect(text: str) -> dict:
    """
    Detect language of input text.
    Returns language code, confidence, and code-mixing flag.
    """
    start = time.time()

    # Clean text for detection
    clean_text = text.replace("\n", " ").strip()
    if not clean_text:
        return _result("en", 1.0, False, start)

    # Check native scripts first (definitive)
    script_lang = _detect_by_script(clean_text)
    if script_lang:
        is_mixed = bool(re.search(r"[a-zA-Z]{3,}", clean_text))
        return _result(script_lang, 0.95, is_mixed, start)

    # Try fasttext
    if _is_loaded and _model is not None:
        try:
            predictions = _model.predict(clean_text, k=3)
            labels = [l.replace("__label__", "") for l in predictions[0]]
            scores = predictions[1].tolist()

            primary_lang = labels[0]
            primary_score = scores[0]

            # Check for code-mixing: if top-2 languages differ significantly
            is_mixed = False
            if len(labels) >= 2 and scores[1] > 0.15:
                lang_set = set(labels[:2])
                if lang_set & INDIC_LANGUAGES and "en" in lang_set:
                    is_mixed = True
                    primary_lang = [l for l in labels[:2] if l in INDIC_LANGUAGES][0]

            # Also check for romanized Hindi words in Latin text
            if primary_lang == "en" and _has_hindi_words(clean_text):
                is_mixed = True
                primary_lang = "hi"

            return _result(primary_lang, primary_score, is_mixed, start)
        except Exception as e:
            logger.error(f"Fasttext detection error: {e}")

    # Heuristic fallback
    return _detect_heuristic(clean_text, start)


def _detect_by_script(text: str) -> Optional[str]:
    """Detect language from script (Devanagari, Tamil, etc.)."""
    if DEVANAGARI.search(text):
        return "hi"
    if TAMIL_SCRIPT.search(text):
        return "ta"
    if TELUGU_SCRIPT.search(text):
        return "te"
    if BENGALI_SCRIPT.search(text):
        return "bn"
    return None


def _has_hindi_words(text: str) -> bool:
    """Check if Latin-script text contains romanized Hindi words."""
    matches = HINDI_MARKERS.findall(text)
    words = text.split()
    return len(matches) >= 2 and len(matches) / max(len(words), 1) > 0.1


def _detect_heuristic(text: str, start: float) -> dict:
    """Simple heuristic language detection for when fasttext is unavailable."""
    if _has_hindi_words(text):
        # Check if it's code-mixed
        english_words = len(re.findall(r"\b[a-zA-Z]{4,}\b", text))
        total_words = len(text.split())
        is_mixed = english_words / max(total_words, 1) > 0.2
        return _result("hi", 0.6, is_mixed, start)
    return _result("en", 0.7, False, start)


def _result(language: str, confidence: float, is_code_mixed: bool, start: float) -> dict:
    elapsed = (time.time() - start) * 1000
    return {
        "language": language,
        "confidence": round(confidence, 4),
        "is_code_mixed": is_code_mixed,
        "time_ms": round(elapsed, 2),
    }
