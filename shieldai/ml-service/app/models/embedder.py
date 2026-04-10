"""
Sentence transformer embeddings using all-MiniLM-L6-v2.
Returns 384-dimensional embeddings for semantic similarity computation.
"""
import time
import logging
from typing import List, Optional

import numpy as np

from app.config import settings

logger = logging.getLogger(__name__)


class SentenceEmbedder:
    """
    Sentence embedding model using all-MiniLM-L6-v2.
    Falls back to a simple TF-IDF-like approach if model loading fails.
    """

    def __init__(self):
        self.model = None
        self.loaded = False
        self.embedding_dim = 384
        self._load_model()

    def _load_model(self):
        """Attempt to load the sentence transformer model."""
        try:
            from sentence_transformers import SentenceTransformer

            self.model = SentenceTransformer(
                settings.embedder_model,
                cache_folder=settings.model_cache_dir,
            )
            self.loaded = True
            logger.info(
                f"Sentence embedder loaded: {settings.embedder_model}"
            )
        except Exception as e:
            logger.warning(
                f"Failed to load sentence transformer: {e}. "
                "Using fallback hash-based embeddings."
            )
            self.loaded = False

    def _fallback_embed(self, texts: List[str]) -> np.ndarray:
        """
        Fallback embedding using character n-gram hashing.
        Produces deterministic embeddings for consistency.
        """
        embeddings = []
        for text in texts:
            # Simple character n-gram hash-based embedding
            vec = np.zeros(self.embedding_dim, dtype=np.float32)
            text_lower = text.lower()
            for i in range(len(text_lower) - 2):
                ngram = text_lower[i : i + 3]
                idx = hash(ngram) % self.embedding_dim
                vec[idx] += 1.0

            # L2 normalize
            norm = np.linalg.norm(vec)
            if norm > 0:
                vec = vec / norm
            embeddings.append(vec)

        return np.array(embeddings)

    def embed(self, texts: List[str]) -> dict:
        """
        Generate embeddings for a list of texts.
        Returns embeddings and inference time.
        """
        start = time.time()

        if self.model is not None and self.loaded:
            embeddings = self.model.encode(
                texts,
                batch_size=settings.batch_size,
                show_progress_bar=False,
                normalize_embeddings=True,
            )
            embeddings_list = embeddings.tolist()
        else:
            embeddings = self._fallback_embed(texts)
            embeddings_list = embeddings.tolist()

        inference_time = (time.time() - start) * 1000

        return {
            "embeddings": embeddings_list,
            "inference_time_ms": round(inference_time, 2),
        }


# Global embedder instance
_embedder: Optional[SentenceEmbedder] = None


def get_embedder() -> SentenceEmbedder:
    """Get or create the singleton embedder instance."""
    global _embedder
    if _embedder is None:
        _embedder = SentenceEmbedder()
    return _embedder
