"""
ShieldAI ML Sidecar Service — FastAPI entry point.
Serves prompt injection classification and sentence embedding models.
"""
import time
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response

from app.routers import classify, embed
# PHASE 2 ADDITION
from app.routers import jailbreak
# India-specific
from app.routers import detect_language
from app.models.classifier import get_classifier
from app.models.embedder import get_embedder
from app.models import indic_classifier
from app.models import language_detector

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Prometheus metrics
REQUEST_COUNT = Counter(
    "ml_requests_total",
    "Total ML inference requests",
    ["endpoint", "status"],
)
REQUEST_LATENCY = Histogram(
    "ml_request_latency_seconds",
    "ML inference request latency",
    ["endpoint"],
    buckets=[0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0],
)

# Create FastAPI app
app = FastAPI(
    title="ShieldAI ML Service",
    description="ML inference sidecar for prompt injection detection",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(classify.router)
app.include_router(embed.router)
# PHASE 2 ADDITION
app.include_router(jailbreak.router)
# India-specific
app.include_router(detect_language.router)

# Startup event — preload models
@app.on_event("startup")
async def startup():
    """Pre-load models on startup for fast inference."""
    logger.info("Loading ML models...")
    start = time.time()

    try:
        get_classifier()
        logger.info("Classifier loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load classifier: {e}")

    try:
        get_embedder()
        logger.info("Embedder loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load embedder: {e}")

    # Load Indic models (graceful degradation)
    try:
        from app.config import get_settings
        settings = get_settings()
        cache_dir = settings.model_cache_dir if hasattr(settings, 'model_cache_dir') else '/app/models'
        indic_classifier.load_model(cache_dir=cache_dir)
        logger.info("MuRIL indic classifier loaded successfully")
    except Exception as e:
        logger.warning(f"MuRIL classifier not loaded (degraded mode): {e}")

    try:
        cache_dir = '/app/models'
        language_detector.load_model(cache_dir=cache_dir)
        logger.info("Language detector loaded successfully")
    except Exception as e:
        logger.warning(f"Language detector not loaded (degraded mode): {e}")

    elapsed = time.time() - start
    logger.info(f"ML models loaded in {elapsed:.2f}s")


@app.get("/health")
async def health():
    """Health check endpoint — verifies models are loaded and responsive."""
    classifier = get_classifier()
    embedder = get_embedder()

    classifier_ok = classifier.loaded
    embedder_ok = embedder.loaded

    # Quick inference test
    inference_ok = False
    try:
        test_result = classifier.classify("test input")
        inference_ok = test_result is not None
    except Exception:
        pass

    status = "healthy" if (classifier_ok and inference_ok) else "degraded"

    return {
        "status": status,
        "classifier": "loaded" if classifier_ok else "failed",
        "embedder": "loaded" if embedder_ok else "fallback",
        "inference": "ok" if inference_ok else "error",
    }


@app.get("/metrics")
async def metrics():
    """Prometheus-compatible metrics endpoint."""
    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST,
    )


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "ShieldAI ML Service",
        "version": "1.0.0",
        "endpoints": ["/classify", "/embed", "/health", "/metrics"],
    }
