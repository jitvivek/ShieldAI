"""
Configuration settings for the ML sidecar service.
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_cache_dir: str = "/app/models"
    device: str = "cpu"

    # Model identifiers
    classifier_model: str = "microsoft/deberta-v3-base"
    embedder_model: str = "sentence-transformers/all-MiniLM-L6-v2"

    # Inference settings
    max_length: int = 512
    batch_size: int = 32

    class Config:
        env_file = ".env"


settings = Settings()
