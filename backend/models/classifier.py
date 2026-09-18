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

    def compute_melanin_index(self, image: Image.Image) -> dict:
        """
        Computes lesion Melanin Index (MI) relative to surrounding baseline skin:
        - Normalizes for Fitzpatrick phototypes IV-VI (Indian skin tones).
        - Prevents elevated constitutional baseline melanin from being misclassified as malignancy.
        - Calculates Delta Contrast = (Lesion MI - Baseline MI) / (|Baseline MI| + epsilon)
        """
        try:
            img_rgb = image.convert("RGB").resize((128, 128))
            arr = np.array(img_rgb, dtype=np.float32) / 255.0
            r, g = arr[:, :, 0], arr[:, :, 1]

            # Melanin Index map (optical pigment density approximation)
            melanin_map = np.log(1.0 / (r + 1e-5)) - np.log(1.0 / (g + 1e-5))

            # Lesion central region (central 50% box: rows 32..96, cols 32..96)
            lesion_patch = melanin_map[32:96, 32:96]
            lesion_mi = float(np.mean(lesion_patch))

            # Baseline peripheral skin (outer 16px perimeter)
            mask = np.ones((128, 128), dtype=bool)
            mask[16:112, 16:112] = False
            baseline_patch = melanin_map[mask]
            baseline_mi = float(np.mean(baseline_patch))

            epsilon = 1e-4
            delta_contrast = (lesion_mi - baseline_mi) / (abs(baseline_mi) + epsilon)

            # High baseline melanin indicates darker phototypes (Fitzpatrick IV-VI)
            high_baseline = bool(baseline_mi > 0.10 or np.mean(arr[mask, 0]) < 0.60)

            return {
                "lesion_mi": round(lesion_mi, 4),
                "baseline_mi": round(baseline_mi, 4),
                "delta_contrast": round(delta_contrast, 4),
                "high_baseline_melanin": high_baseline,
                "phototype_detected": "Fitzpatrick IV-VI (Darker/Indian Tone)" if high_baseline else "Fitzpatrick I-III (Lighter Tone)"
            }
        except Exception as e:
            return {
                "lesion_mi": 0.0,
                "baseline_mi": 0.0,
                "delta_contrast": 0.0,
                "high_baseline_melanin": False,
                "phototype_detected": "Standard"
            }

    def predict(self, image: Image.Image) -> dict:
        """
        Runs diagnostic inference on an input PIL image:
        - Extracts multi-scale spatial and dermatological features
        - Applies logit temperature scaling (tau = 0.85) for sharpened confidence
        - Computes lesion Melanin Index relative to surrounding baseline skin
        - Normalizes for Fitzpatrick IV-VI phototypes
        - Computes Grad-CAM attention heatmap
        """
        start_time = time.time()

        if not self.is_loaded or self.model is None:
            self._load_model()

        # Extract features
        features = extract_dermatology_features(image)
        feats_2d = np.expand_dims(features, axis=0)

        # 1. Compute raw logits and apply temperature scaling (tau = 0.85)
        tau = 0.85
        if hasattr(self.model, "decision_function"):
            try:
                raw_logits = self.model.decision_function(feats_2d)[0]
                scaled_logits = raw_logits / tau
                exp_logits = np.exp(scaled_logits - np.max(scaled_logits))
                probs = exp_logits / np.sum(exp_logits)
            except Exception:
                probs = self.model.predict_proba(feats_2d)[0]
        elif hasattr(self.model, "predict_proba"):
            raw_p = self.model.predict_proba(feats_2d)[0]
            eps = 1e-7
            raw_p = np.clip(raw_p, eps, 1.0 - eps)
            scaled = np.log(raw_p) / tau
            exp_s = np.exp(scaled - np.max(scaled))
            probs = exp_s / np.sum(exp_s)
        else:
            probs = np.ones(len(self.classes)) / len(self.classes)

        # 2. Melanin Index (MI) Calibration for Indian Skin Tones (Fitzpatrick IV-VI)
        melanin_metrics = self.compute_melanin_index(image)
        if "melanoma_suspicious" in self.classes:
            mel_idx = self.classes.index("melanoma_suspicious")
            # If surrounding skin has high constitutional melanin and lesion contrast is low,
            # avoid falsely classifying baseline brown skin tone as malignancy
            if melanin_metrics["high_baseline_melanin"] and melanin_metrics["delta_contrast"] < 0.15:
                probs[mel_idx] *= 0.60
                probs = probs / np.sum(probs)

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
            "melanin_metrics": melanin_metrics,
            "inference_time_ms": inference_time_ms
        }

# Singleton instance
classifier = DermaClassifier()
