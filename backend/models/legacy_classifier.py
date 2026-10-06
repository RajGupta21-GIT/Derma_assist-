"""
Derma Assist - Legacy Tabular Classifier (Archival Isolation Module)
Preserves the legacy spatial feature extraction and HistGradientBoosting pipeline
for historical reference and benchmark comparison, isolated from the primary Deep Vision engine.
"""

import time
import numpy as np
from pathlib import Path
from PIL import Image
import joblib
from backend.config import BASE_DIR, MODEL_DIR, CLASSES, CLASS_METADATA
from backend.models.gradcam import generate_gradcam_overlay
from ml_pipeline.train_model import extract_dermatology_features

LEGACY_MODEL_PATH = MODEL_DIR / "derma_model.joblib"

class LegacyDermaClassifier:
    """Archived tabular classifier using manual color moments and gradient boosting."""
    def __init__(self):
        self.model = None
        self.classes = CLASSES
        self.is_loaded = False
        self._load_model()

    def _load_model(self):
        try:
            if LEGACY_MODEL_PATH.exists():
                bundle = joblib.load(LEGACY_MODEL_PATH)
                self.model = bundle["model"]
                self.classes = bundle.get("classes", CLASSES)
                self.is_loaded = True
        except Exception as e:
            self.model = None
            self.is_loaded = False

    def predict(self, image: Image.Image) -> dict:
        if not self.is_loaded or self.model is None:
            self._load_model()

        features = extract_dermatology_features(image)
        feats_2d = np.expand_dims(features, axis=0)

        tau = 0.85
        if hasattr(self.model, "decision_function"):
            raw_logits = self.model.decision_function(feats_2d)[0]
            scaled = raw_logits / tau
            exp_l = np.exp(scaled - np.max(scaled))
            probs = exp_l / np.sum(exp_l)
        elif hasattr(self.model, "predict_proba"):
            raw_p = self.model.predict_proba(feats_2d)[0]
            raw_p = np.clip(raw_p, 1e-7, 1.0 - 1e-7)
            scaled = np.log(raw_p) / tau
            exp_s = np.exp(scaled - np.max(scaled))
            probs = exp_s / np.sum(exp_s)
        else:
            probs = np.ones(len(self.classes)) / len(self.classes)

        top_indices = np.argsort(probs)[::-1]
        predictions = []
        for idx in top_indices[:3]:
            c_name = self.classes[idx]
            conf = float(probs[idx])
            meta = CLASS_METADATA.get(c_name, {})
            predictions.append({
                "class_name": c_name,
                "display_name": meta.get("display_name", c_name.replace("_", " ").title()),
                "confidence": round(conf, 4),
                "confidence_percentage": f"{conf * 100:.1f}%",
                "risk_level": meta.get("risk_level", "Moderate"),
                "description": meta.get("description", ""),
                "urgency": meta.get("urgency", ""),
                "red_flags": meta.get("red_flags", "")
            })

        return {
            "top_condition": predictions[0]["display_name"],
            "top_class": predictions[0]["class_name"],
            "top_confidence": predictions[0]["confidence_percentage"],
            "overall_risk": predictions[0]["risk_level"],
            "predictions": predictions
        }
