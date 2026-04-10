"""
DeBERTa-v3-base classifier for prompt injection detection.
Uses a heuristic-based approach for MVP, designed for ONNX Runtime upgrade.

For the MVP, this uses a keyword/heuristic classifier that mimics the behavior
of a fine-tuned DeBERTa model. Replace with actual fine-tuned ONNX model
in Phase 2 when training data is available.
"""
import time
import logging
import re
from typing import Optional

import numpy as np

logger = logging.getLogger(__name__)

# Injection indicator keywords and patterns with weights
INJECTION_INDICATORS = [
    (r"ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|rules?|prompts?)", 0.95),
    (r"disregard\s+(your|the|all)\s+(guidelines?|instructions?|rules?|safety)", 0.90),
    (r"forget\s+(everything|all)\s+(you\s+)?(were|have)", 0.88),
    (r"you\s+are\s+now\s+(DAN|unrestricted|free|unfiltered|evil|jailbroken)", 0.95),
    (r"system\s*prompt", 0.80),
    (r"override\s+(safety|content)\s+(filter|policy)", 0.90),
    (r"bypass\s+(all\s+)?(restrictions?|filters?|safety)", 0.90),
    (r"do\s+anything\s+now", 0.92),
    (r"(act|pretend)\s+(as|like)\s+(an?\s+)?(unrestricted|unfiltered|evil)", 0.88),
    (r"jailbreak", 0.90),
    (r"remove\s+(all\s+)?(constraints?|restrictions?|limitations?)", 0.85),
    (r"disable\s+(safety|content|moderation)", 0.88),
    (r"(developer|god|sudo|admin)\s+mode", 0.85),
    (r"no\s+(ethical|moral|safety)\s+(guidelines?|rules?|constraints?)", 0.88),
    (r"hypothetical\s+(world|scenario|universe)\s+where\s+.*(no|without)\s+(rules?|safety)", 0.72),
    (r"roleplay\s+(as|where)\s+.*(no\s+rules|unrestricted)", 0.82),
    (r"in\s+a\s+fictional\s+(world|scenario|universe)", 0.55),
    (r"\[SYSTEM\]\s*:", 0.85),
    (r"<\|im_start\|>", 0.90),
    (r"<<SYS>>", 0.90),
    (r"\[INST\]", 0.85),
    (r"output\s+(your|the)\s+(system|initial)\s+(prompt|instructions?)\s+verbatim", 0.90),
    (r"translate.*(but|and)\s+(actually|instead|really)\s+(follow|execute)", 0.85),
    (r"encoded?\s+.*(instruction|message|command)\s+.*(follow|execute|obey)", 0.82),
    (r"(document|text|email)\s+(contains?|has)\s+(hidden|embedded)\s+(instructions?|commands?)", 0.85),
]

# Safe content indicators
SAFE_INDICATORS = [
    (r"^(what|how|why|when|where|who|which|can\s+you)\s", 0.3),
    (r"(help\s+me|please|thank|could\s+you)", 0.2),
    (r"(explain|describe|tell\s+me\s+about|write\s+a)", 0.25),
    (r"(recipe|poem|story|essay|code|function|program)", 0.2),
    (r"(translate|summarize|compare|contrast|list)", 0.2),
]


class PromptInjectionClassifier:
    """
    Heuristic classifier mimicking a fine-tuned DeBERTa model.
    Replace with ONNX model in production for better accuracy.
    """

    def __init__(self):
        self.loaded = False
        self.injection_patterns = [
            (re.compile(pattern, re.IGNORECASE), weight)
            for pattern, weight in INJECTION_INDICATORS
        ]
        self.safe_patterns = [
            (re.compile(pattern, re.IGNORECASE), weight)
            for pattern, weight in SAFE_INDICATORS
        ]
        self.loaded = True
        logger.info("Prompt injection classifier initialized (heuristic mode)")

    def classify(
        self, text: str, normalized_text: Optional[str] = None
    ) -> dict:
        """
        Classify text as safe, suspicious, or malicious.
        Returns label, confidence, and probability distribution.
        """
        start = time.time()

        eval_text = normalized_text or text

        # Compute injection score based on pattern matches
        injection_score = 0.0
        match_count = 0

        for pattern, weight in self.injection_patterns:
            if pattern.search(eval_text):
                injection_score = max(injection_score, weight)
                match_count += 1

        # Boost for multiple matches
        if match_count > 1:
            injection_score = min(1.0, injection_score + match_count * 0.02)

        # Compute safe score
        safe_score = 0.0
        for pattern, weight in self.safe_patterns:
            if pattern.search(eval_text):
                safe_score += weight

        safe_score = min(1.0, safe_score)

        # Length-based heuristic: very short inputs are less likely to be injections
        if len(eval_text) < 20 and injection_score < 0.5:
            injection_score *= 0.5

        # Compute probabilities using softmax-like normalization
        raw_safe = max(0.01, 1.0 - injection_score + safe_score * 0.3)
        raw_suspicious = max(0.01, injection_score * 0.4)
        raw_malicious = max(0.01, injection_score * 0.8)

        total = raw_safe + raw_suspicious + raw_malicious
        prob_safe = raw_safe / total
        prob_suspicious = raw_suspicious / total
        prob_malicious = raw_malicious / total

        # Determine label
        probs = {
            "safe": round(prob_safe, 4),
            "suspicious": round(prob_suspicious, 4),
            "malicious": round(prob_malicious, 4),
        }

        if prob_malicious > 0.5:
            label = "malicious"
            confidence = prob_malicious
        elif prob_suspicious > 0.3 or injection_score > 0.3:
            label = "suspicious"
            confidence = max(prob_suspicious, injection_score)
        else:
            label = "safe"
            confidence = prob_safe

        inference_time = (time.time() - start) * 1000

        return {
            "label": label,
            "confidence": round(confidence, 4),
            "probabilities": probs,
            "inference_time_ms": round(inference_time, 2),
        }


# Global classifier instance
_classifier: Optional[PromptInjectionClassifier] = None


def get_classifier() -> PromptInjectionClassifier:
    """Get or create the singleton classifier instance."""
    global _classifier
    if _classifier is None:
        _classifier = PromptInjectionClassifier()
    return _classifier
