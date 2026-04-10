#!/bin/bash
# Download and cache ML models from HuggingFace.
# Usage: bash scripts/download-models.sh [MODEL_CACHE_DIR]

set -euo pipefail

MODEL_CACHE_DIR="${1:-./ml-service/models}"

echo "=== ShieldAI Model Download Script ==="
echo "Cache directory: $MODEL_CACHE_DIR"
echo ""

mkdir -p "$MODEL_CACHE_DIR"

# Check for Python and pip
if ! command -v python3 &> /dev/null; then
    echo "ERROR: python3 is required but not found."
    exit 1
fi

# Install dependencies if needed
pip3 install --quiet transformers sentence-transformers optimum onnxruntime torch

echo "--- Downloading DeBERTa-v3-base ---"
python3 -c "
from transformers import AutoTokenizer, AutoModel
import os

model_name = 'microsoft/deberta-v3-base'
cache_dir = os.path.join('$MODEL_CACHE_DIR', 'microsoft_deberta-v3-base')
os.makedirs(cache_dir, exist_ok=True)

print(f'Downloading {model_name}...')
tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.save_pretrained(cache_dir)
model = AutoModel.from_pretrained(model_name)
model.save_pretrained(cache_dir)
print(f'Saved to {cache_dir}')
"
echo "✅ DeBERTa-v3-base downloaded"

echo ""
echo "--- Downloading all-MiniLM-L6-v2 ---"
python3 -c "
from sentence_transformers import SentenceTransformer
import os

model_name = 'sentence-transformers/all-MiniLM-L6-v2'
cache_dir = '$MODEL_CACHE_DIR'
os.makedirs(cache_dir, exist_ok=True)

print(f'Downloading {model_name}...')
model = SentenceTransformer(model_name, cache_folder=cache_dir)
print(f'Saved to {cache_dir}')
"
echo "✅ all-MiniLM-L6-v2 downloaded"

echo ""
echo "--- Attempting ONNX conversion for DeBERTa ---"
python3 -c "
try:
    from optimum.onnxruntime import ORTModelForSequenceClassification
    from transformers import AutoTokenizer
    import os

    model_dir = os.path.join('$MODEL_CACHE_DIR', 'microsoft_deberta-v3-base')
    onnx_dir = os.path.join('$MODEL_CACHE_DIR', 'deberta-v3-base-onnx')
    os.makedirs(onnx_dir, exist_ok=True)

    print('Converting to ONNX format...')
    # Note: For production, fine-tune first then convert
    print('Skipping ONNX conversion — use fine-tuned model for production')
except ImportError:
    print('optimum not available — skipping ONNX conversion')
except Exception as e:
    print(f'ONNX conversion error (non-fatal): {e}')
" || true
echo "ℹ️  ONNX conversion is optional — heuristic classifier works for MVP"

echo ""
echo "=== Model download complete ==="
echo "Models cached at: $MODEL_CACHE_DIR"
ls -la "$MODEL_CACHE_DIR" 2>/dev/null || echo "(directory empty or not accessible)"
