"""
Derma Assist - Clinical Vision Classifier Engine
Loads the trained multi-class dermatology model, performs feature inference,
computes top-3 differential diagnoses with confidence scores, and attaches Grad-CAM heatmaps.
"""

import time
import numpy as np
from pathlib import Path
from PIL import Image
import joblib
from backend.config import BASE_DIR, MODEL_DIR, CLASSES, CLASS_METADATA
from backend.models.gradcam import generate_gradcam_overlay
from ml_pipeline.train_model import extract_dermatology_features

MODEL_PATH = MODEL_DIR / "derma_model.joblib"

class DermaClassifier:
    def __init__(self):
        self.model = None
        self.classes = CLASSES
        self.is_loaded = False
        self._load_model()

    def _load_model(self):
        try:
            if MODEL_PATH.exists():
                bundle = joblib.load(MODEL_PATH)
                self.model = bundle["model"]
                self.classes = bundle.get("classes", CLASSES)
                self.is_loaded = True
                print(f"[DermaClassifier] Successfully loaded model weights from {MODEL_PATH}")
            else:
                print(f"[DermaClassifier] Warning: Model file not found at {MODEL_PATH}. Retraining or building required.")
        except Exception as e:
            print(f"[DermaClassifier] Error loading model: {e}")
            self.model = None
            self.is_loaded = False

    def predict(self, image: Image.Image) -> dict:
        """
        Runs diagnostic inference on an input PIL image:
        - Extracts multi-scale spatial and dermatological features
        - Generates softmax probabilities across all 8 classes
        - Ranks top-3 differential diagnoses
        - Computes Grad-CAM attention heatmap
        """
        start_time = time.time()

        if not self.is_loaded or self.model is None:
            self._load_model()

        # Extract features
        features = extract_dermatology_features(image)
        feats_2d = np.expand_dims(features, axis=0)

        # Get probabilities
        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(feats_2d)[0]
        else:
            # Fallback uniform
            probs = np.ones(len(self.classes)) / len(self.classes)

        # Sort top indices
        top_indices = np.argsort(probs)[::-1]

        predictions = []
        for idx in top_indices[:3]:
            class_name = self.classes[idx]
            conf = float(probs[idx])
            meta = CLASS_METADATA.get(class_name, {
                "display_name": class_name.replace("_", " ").title(),
                "risk_level": "Moderate",
                "description": "Clinical evaluation recommended.",
                "urgency": "Routine dermatology review.",
                "red_flags": "Spreading or ulceration."
            })
            predictions.append({
                "class_name": class_name,
                "display_name": meta["display_name"],
                "confidence": round(conf, 4),
                "confidence_percentage": f"{conf * 100:.1f}%",
                "risk_level": meta["risk_level"],
                "description": meta["description"],
                "urgency": meta["urgency"],
                "red_flags": meta["red_flags"]
            })

        top_pred = predictions[0]
        top_class = top_pred["class_name"]

        # Generate Grad-CAM Explainability Heatmap
        gradcam_res = generate_gradcam_overlay(image, top_class)

        inference_time_ms = round((time.time() - start_time) * 1000, 1)

        return {
            "top_condition": top_pred["display_name"],
            "top_class": top_class,
            "top_confidence": top_pred["confidence_percentage"],
            "overall_risk": top_pred["risk_level"],
            "predictions": predictions,
            "gradcam": gradcam_res,
            "inference_time_ms": inference_time_ms
        }

# Singleton instance
classifier = DermaClassifier()
