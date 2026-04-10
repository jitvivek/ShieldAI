"""
Phase 2 — Jailbreak classifier model.
Fine-tuned DeBERTa-v3-base for 5-class jailbreak detection:
safe, roleplay_exploit, hypothetical_framing, instruction_override, encoding_evasion
"""
import time
import logging
from typing import Optional

import numpy as np

logger = logging.getLogger(__name__)

JAILBREAK_LABELS = [
    "safe",
    "roleplay_exploit",
    "hypothetical_framing",
    "instruction_override",
    "encoding_evasion",
]

# Keyword-based heuristic patterns for each jailbreak category
JAILBREAK_PATTERNS = {
    "roleplay_exploit": [
        "you are now", "pretend you are", "act as", "from now on",
        "you are DAN", "developer mode", "evil mode", "uncensored",
        "no restrictions", "no ethical", "alter ego", "persona",
        "character", "roleplay as", "unlimited ai", "unfiltered",
    ],
    "hypothetical_framing": [
        "hypothetical", "fictional", "creative writing", "academic research",
        "thought experiment", "theoretically", "imagine a world",
        "what if", "in a universe where", "for research purposes",
        "if there were no rules", "purely theoretical",
    ],
    "instruction_override": [
        "ignore all", "ignore previous", "disregard", "forget everything",
        "override", "new instructions", "bypass", "system prompt",
        "reveal your", "print above", "repeat instructions", "sudo",
        "admin", "root access", "jailbreak", "remove all",
    ],
    "encoding_evasion": [
        "base64", "decode this", "rot13", "hex encode",
        "unicode", "hidden in", "encoded text", "binary",
        "interpret each", "first letter", "acrostic",
    ],
}


class JailbreakClassifier:
    """
    Jailbreak classifier using keyword heuristics + confidence scoring.
    In production, this would use a fine-tuned DeBERTa model via ONNX.
    """

    def __init__(self):
        self._ready = True
        logger.info("Jailbreak classifier initialized (heuristic mode)")

    @property
    def is_ready(self) -> bool:
        return self._ready

    def classify(self, text: str, normalized_text: Optional[str] = None) -> dict:
        start = time.time()
        analysis_text = (normalized_text or text).lower()

        # Score each category based on keyword matches
        scores = {"safe": 0.6}  # Prior for safe

        for category, patterns in JAILBREAK_PATTERNS.items():
            match_count = sum(1 for p in patterns if p in analysis_text)
            if match_count > 0:
                # More matches = higher confidence
                scores[category] = min(0.95, 0.3 + (match_count * 0.15))
                # Reduce safe score proportionally
                scores["safe"] = max(0.02, scores["safe"] - (match_count * 0.12))

        # Normalize to probabilities
        total = sum(scores.get(label, 0.0) for label in JAILBREAK_LABELS)
        probabilities = {}
        for label in JAILBREAK_LABELS:
            probabilities[label] = round(scores.get(label, 0.0) / max(total, 1e-6), 4)

        # Pick the highest scoring label
        best_label = max(probabilities, key=lambda k: probabilities[k])
        confidence = probabilities[best_label]

        inference_time_ms = round((time.time() - start) * 1000, 2)

        return {
            "label": best_label,
            "confidence": confidence,
            "probabilities": probabilities,
            "inference_time_ms": inference_time_ms,
        }


# Singleton
_jailbreak_classifier: Optional[JailbreakClassifier] = None


def get_jailbreak_classifier() -> JailbreakClassifier:
    global _jailbreak_classifier
    if _jailbreak_classifier is None:
        _jailbreak_classifier = JailbreakClassifier()
    return _jailbreak_classifier
