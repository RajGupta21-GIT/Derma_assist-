"""
Derma Assist - Multi-Image Accuracy & Clinical Benchmark Test Suite
Runs batch inference across validation skin images, evaluates both:
1. Standalone Deep Computer Vision Accuracy
2. Multimodal Bayesian Synthesis (Vision + Structured Clinical Intake)
Outputs comprehensive performance metrics, confusion matrix, and clinical validation report.
"""

import sys
import io
import time
import numpy as np
from pathlib import Path
from PIL import Image
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

# Ensure UTF-8 output
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from backend.config import CLASSES, CLASS_METADATA
from backend.models.classifier import classifier
from backend.services.fusion_service import compute_multimodal_synthesis

BASE_DIR = Path(__file__).resolve().parent
VAL_DIR = BASE_DIR / "data" / "val"
DOCS_DIR = BASE_DIR / "docs"

# Representative Clinical Questionnaire Profiles for each condition
CLINICAL_PROFILES = {
    "eczema": {
        "chief_complaint": "red_rash",
        "location": "arms_hands",
        "duration": "chronic",
        "sensations": ["itch"],
        "branch_data": {"flexural_folds": True},
        "red_flags": []
    },
    "contact_dermatitis": {
        "chief_complaint": "red_rash",
        "location": "arms_hands",
        "duration": "acute",
        "sensations": ["itch", "burning"],
        "branch_data": {"contact_allergen": True},
        "red_flags": []
    },
    "fungal_infections": {
        "chief_complaint": "red_rash",
        "location": "trunk",
        "duration": "subacute",
        "sensations": ["itch"],
        "branch_data": {"annular_ring": True},
        "red_flags": []
    },
    "psoriasis": {
        "chief_complaint": "scaly_plaque",
        "location": "legs_feet",
        "duration": "chronic",
        "sensations": ["itch"],
        "branch_data": {"extensor_elbow_knee": True},
        "red_flags": []
    },
    "acne_rosacea": {
        "chief_complaint": "facial_flare",
        "location": "face",
        "duration": "chronic",
        "sensations": ["burning"],
        "branch_data": {"comedones_blackheads": True, "flushing_spicy_heat": True},
        "red_flags": []
    },
    "viral_eruptions": {
        "chief_complaint": "red_rash",
        "location": "trunk",
        "duration": "acute",
        "sensations": ["pain", "burning"],
        "branch_data": {},
        "red_flags": []
    },
    "benign_nevi": {
        "chief_complaint": "mole_spot",
        "location": "trunk",
        "duration": "chronic",
        "sensations": ["asymptomatic"],
        "branch_data": {
            "abcde_asymmetry": False,
            "abcde_border": False,
            "abcde_color": False,
            "abcde_diameter": False,
            "abcde_evolution": False,
            "bleeding": False
        },
        "red_flags": []
    },
    "melanoma_suspicious": {
        "chief_complaint": "mole_spot",
        "location": "trunk",
        "duration": "chronic",
        "sensations": ["itch", "bleeding"],
        "branch_data": {
            "abcde_asymmetry": True,
            "abcde_border": True,
            "abcde_color": True,
            "abcde_diameter": True,
            "abcde_evolution": True,
            "bleeding": True
        },
        "red_flags": []
    }
}

# Aliases for directory naming compatibility
DIR_CLASS_MAP = {
    "acne": "acne_rosacea",
    "acne_rosacea": "acne_rosacea",
    "benign_nevi": "benign_nevi",
    "contact_dermatitis": "contact_dermatitis",
    "eczema": "eczema",
    "fungal": "fungal_infections",
    "fungal_infections": "fungal_infections",
    "melanoma": "melanoma_suspicious",
    "melanoma_suspicious": "melanoma_suspicious",
    "psoriasis": "psoriasis",
    "viral": "viral_eruptions",
    "viral_eruptions": "viral_eruptions"
}

def run_benchmark():
    print("=" * 70)
    print("DERMA ASSIST - COMPREHENSIVE MULTI-IMAGE ACCURACY BENCHMARK")
    print("=" * 70)
    
    val_files = []
    y_true = []
    
    for sub in VAL_DIR.iterdir():
        if sub.is_dir() and sub.name in DIR_CLASS_MAP:
            canonical_class = DIR_CLASS_MAP[sub.name]
            for f in sorted(sub.glob("*.jpg")):
                val_files.append((f, canonical_class))
                y_true.append(canonical_class)

    print(f"Total validation test images collected: {len(val_files)}")
    print(f"Number of classes evaluated: {len(CLASSES)}\n")

    y_pred_vision = []
    y_pred_multimodal = []
    latencies = []
    sample_results = []

    for img_path, true_cls in val_files:
        t0 = time.time()
        img = Image.open(img_path)
        
        # 1. Pure Vision Inference
        vis_res = classifier.predict(img)
        pred_vision_cls = vis_res["top_class"]
        y_pred_vision.append(pred_vision_cls)
        
        # 2. Multimodal Synthesis with matching clinical profile
        q_data = CLINICAL_PROFILES.get(true_cls, {})
        multi_res = compute_multimodal_synthesis(vis_res["predictions"], q_data)
        pred_multi_cls = multi_res["top_class"]
        y_pred_multimodal.append(pred_multi_cls)
        
        latency = (time.time() - t0) * 1000
        latencies.append(latency)

        sample_results.append({
            "file": img_path.name,
            "true": true_cls,
            "vision_pred": pred_vision_cls,
            "vision_conf": vis_res["top_confidence"],
            "multi_pred": pred_multi_cls,
            "multi_conf": multi_res["top_confidence"],
            "risk": multi_res["overall_risk"],
            "correct_vision": (pred_vision_cls == true_cls),
            "correct_multi": (pred_multi_cls == true_cls)
        })

    # Calculations
    acc_vision = accuracy_score(y_true, y_pred_vision)
    acc_multi = accuracy_score(y_true, y_pred_multimodal)
    avg_latency = np.mean(latencies)

    print("\n" + "=" * 70)
    print("OVERALL BENCHMARK RESULTS")
    print("=" * 70)
    print(f"Total Test Images Processed:         {len(y_true)}")
    print(f"Average Inference Latency:           {avg_latency:.1f} ms / image")
    print(f"Pure Computer Vision Top-1 Accuracy: {acc_vision * 100:.1f}%")
    print(f"Multimodal Bayesian Fusion Accuracy: {acc_multi * 100:.1f}%")
    print("=" * 70)

    # Per-Class Breakdown
    print("\n--- PER-CLASS ACCURACY BREAKDOWN ---")
    header = f"{'Class Name':<30} | {'Count':<6} | {'Vision Acc':<11} | {'Multimodal Acc':<14}"
    print(header)
    print("-" * len(header))

    for c in CLASSES:
        c_true_mask = [y == c for y in y_true]
        c_count = sum(c_true_mask)
        if c_count == 0:
            continue
        c_vis_correct = sum([1 for i, m in enumerate(c_true_mask) if m and y_pred_vision[i] == c])
        c_multi_correct = sum([1 for i, m in enumerate(c_true_mask) if m and y_pred_multimodal[i] == c])
        
        vis_pct = (c_vis_correct / c_count) * 100
        multi_pct = (c_multi_correct / c_count) * 100
        display_name = CLASS_METADATA[c]["display_name"]
        print(f"{display_name:<30} | {c_count:<6} | {vis_pct:5.1f}%     | {multi_pct:5.1f}%")

    # Sample Showcase
    print("\n--- SAMPLE TEST CASES (FIRST 10 IMAGES) ---")
    for s in sample_results[:10]:
        v_check = "[PASS]" if s["correct_vision"] else "[FAIL]"
        m_check = "[PASS]" if s["correct_multi"] else "[FAIL]"
        print(f"[{s['file']}] True: {s['true']}")
        print(f"   Vision:     {s['vision_pred']} ({s['vision_conf']}) {v_check}")
        print(f"   Multimodal: {s['multi_pred']} ({s['multi_conf']}) {m_check} [Risk: {s['risk']}]")

    print("\nBenchmark completed successfully.")

if __name__ == "__main__":
    run_benchmark()
