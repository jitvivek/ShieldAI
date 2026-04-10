"""
Model loader utilities — download and cache models from HuggingFace.
"""
import os
import logging
from pathlib import Path

from app.config import settings

logger = logging.getLogger(__name__)


def get_model_path(model_name: str) -> Path:
    """Get the local cache path for a model."""
    safe_name = model_name.replace("/", "_")
    return Path(settings.model_cache_dir) / safe_name


def ensure_model_dir() -> None:
    """Ensure the model cache directory exists."""
    os.makedirs(settings.model_cache_dir, exist_ok=True)


def is_model_cached(model_name: str) -> bool:
    """Check if a model is already cached locally."""
    model_path = get_model_path(model_name)
    return model_path.exists() and any(model_path.iterdir())


def download_model(model_name: str, model_type: str = "classifier") -> Path:
    """
    Download a model from HuggingFace and cache it locally.
    Returns the local path to the downloaded model.
    """
    ensure_model_dir()
    model_path = get_model_path(model_name)

    if is_model_cached(model_name):
        logger.info(f"Model {model_name} already cached at {model_path}")
        return model_path

    logger.info(f"Downloading model {model_name} to {model_path}...")

    if model_type == "embedder":
        from sentence_transformers import SentenceTransformer

        model = SentenceTransformer(model_name, cache_folder=str(model_path))
        logger.info(f"Embedder model {model_name} downloaded successfully")
    else:
        from transformers import AutoTokenizer, AutoModelForSequenceClassification

        tokenizer = AutoTokenizer.from_pretrained(model_name)
        tokenizer.save_pretrained(str(model_path))

        try:
            model = AutoModelForSequenceClassification.from_pretrained(
                model_name, num_labels=3
            )
            model.save_pretrained(str(model_path))
        except Exception as e:
            logger.warning(
                f"Could not load classification model: {e}. "
                "Using base model for MVP — fine-tune for production."
            )
            from transformers import AutoModel

            model = AutoModel.from_pretrained(model_name)
            model.save_pretrained(str(model_path))

        logger.info(f"Classifier model {model_name} downloaded successfully")

    return model_path
