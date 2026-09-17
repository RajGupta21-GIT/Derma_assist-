"""
Derma Assist - Multimodal Bayesian Fusion & Clinical Safety Override Engine
Mathematically and clinically synthesizes deep learning vision probabilities
with the patient's structured branching questionnaire responses.
"""

from typing import Dict, Any, List
from backend.config import CLASS_METADATA, CLASSES

def compute_multimodal_synthesis(vision_predictions: List[Dict[str, Any]], questionnaire: Dict[str, Any]) -> Dict[str, Any]:
    """
    Combines:
    1. Vision Model softmax probabilities: P(Condition | Image)
    2. Questionnaire symptom multipliers: P(Symptoms | Condition)
    3. Emergency Clinical Safety Overrides (e.g. ABCDE malignancy triggers)
    """
    if not questionnaire:
        # If no questionnaire provided, fallback to pure vision prediction
        return {
            "top_condition": vision_predictions[0]["display_name"] if vision_predictions else "Indeterminate",
            "top_confidence": vision_predictions[0]["confidence_percentage"] if vision_predictions else "N/A",
            "overall_risk": vision_predictions[0]["risk_level"] if vision_predictions else "Moderate",
            "predictions": vision_predictions,
            "fusion_rationale": "Direct visual analysis without prior clinical questionnaire intake.",
            "safety_override_triggered": False,
            "red_flag_alerts": []
        }

    chief_complaint = questionnaire.get("chief_complaint", "")
    location = questionnaire.get("location", "")
    duration = questionnaire.get("duration", "")
    sensations = questionnaire.get("sensations", [])
    branch_data = questionnaire.get("branch_data", {})
    red_flags = questionnaire.get("red_flags", [])

    # Base priors from Vision Model
    class_scores = {}
    for pred in vision_predictions:
        class_scores[pred["class_name"]] = float(pred["confidence"])

    # Ensure all classes have a base baseline
    for c in CLASSES:
        if c not in class_scores:
            class_scores[c] = 0.05

    # 1. Symptom Likelihood Multipliers based on Branching Questionnaire
    multipliers = {c: 1.0 for c in CLASSES}
    rationale_points = []

    # Chief Complaint weighting
    if chief_complaint == "mole_spot":
        multipliers["melanoma_suspicious"] *= 2.8
        multipliers["benign_nevi"] *= 2.5
        multipliers["eczema"] *= 0.3
        multipliers["acne_rosacea"] *= 0.2
        rationale_points.append("Patient chief complaint indicates a pigmented mole/lesion.")

    elif chief_complaint == "red_rash":
        multipliers["contact_dermatitis"] *= 2.4
        multipliers["eczema"] *= 2.2
        multipliers["fungal_infections"] *= 2.0
        multipliers["viral_eruptions"] *= 1.8
        multipliers["benign_nevi"] *= 0.1
        rationale_points.append("Patient chief complaint focuses on an erythematous rash.")

    elif chief_complaint == "scaly_plaque":
        multipliers["psoriasis"] *= 3.5
        multipliers["eczema"] *= 2.0
        rationale_points.append("Presentation of scaly plaque strongly prioritizes papulosquamous disorders.")

    elif chief_complaint == "facial_flare":
        multipliers["acne_rosacea"] *= 3.8
        rationale_points.append("Facial distribution prioritizes Acne Vulgaris and Rosacea.")

    # Specific Branching Drill-Down Logic
    # Mole ABCDE branch
    is_mole_bleeding = branch_data.get("bleeding", False) or "bleeding" in sensations
    has_abcde_asymmetry = branch_data.get("abcde_asymmetry", False)
    has_abcde_border = branch_data.get("abcde_border", False)
    has_abcde_color = branch_data.get("abcde_color", False)
    has_abcde_diameter = branch_data.get("abcde_diameter", False)
    has_abcde_evolution = branch_data.get("abcde_evolution", False)

    abcde_count = sum([has_abcde_asymmetry, has_abcde_border, has_abcde_color, has_abcde_diameter, has_abcde_evolution])

    if abcde_count >= 2:
        multipliers["melanoma_suspicious"] *= (1.8 + abcde_count * 0.8)
        rationale_points.append(f"Questionnaire reveals {abcde_count} positive ABCDE criteria (elevating dysplastic/malignant risk).")

    # Rash branch
    if branch_data.get("annular_ring", False):
        multipliers["fungal_infections"] *= 3.8
        rationale_points.append("Annular ring morphology with active margin strongly correlates with Tinea (Ringworm).")

    if branch_data.get("contact_allergen", False):
        multipliers["contact_dermatitis"] *= 3.5
        rationale_points.append("Recent chemical/detergent or plant exposure correlates with acute Contact Dermatitis.")

    if branch_data.get("extensor_elbow_knee", False):
        multipliers["psoriasis"] *= 3.2
        rationale_points.append("Extensor surface plaque localization (elbows/knees) strongly supports Psoriasis.")

    if branch_data.get("flexural_folds", False):
        multipliers["eczema"] *= 3.0
        rationale_points.append("Flexural crease localization (inner elbows, behind knees) aligns with Atopic Dermatitis.")

    # 2. Compute Bayesian Posterior Scores
    posterior_scores = {}
    for c in CLASSES:
        prior = class_scores.get(c, 0.05)
        posterior_scores[c] = prior * multipliers.get(c, 1.0)

    # Normalize to sum to 1.0
    total_posterior = sum(posterior_scores.values()) + 1e-9
    for c in posterior_scores:
        posterior_scores[c] = posterior_scores[c] / total_posterior

    # Sort descending
    sorted_classes = sorted(posterior_scores.items(), key=lambda x: x[1], reverse=True)

    # 3. Emergency Safety Override Check
    safety_override = False
    active_alerts = []

    # Check for urgent malignancy red-flags
    if is_mole_bleeding or has_abcde_evolution or abcde_count >= 3:
        safety_override = True
        active_alerts.append("CRITICAL: Lesion exhibits active bleeding, rapid evolution, or marked ABCDE asymmetry.")
        # Ensure melanoma_suspicious is ranked top or prominently flagged
        if sorted_classes[0][0] != "melanoma_suspicious":
            # Clinical Override: Force melanoma to top differential
            sorted_classes = [("melanoma_suspicious", max(0.65, posterior_scores["melanoma_suspicious"]))] + [
                item for item in sorted_classes if item[0] != "melanoma_suspicious"
            ]

    # Check for systemic emergency red-flags
    if "high_fever" in red_flags or "facial_swelling" in red_flags:
        safety_override = True
        active_alerts.append("EMERGENCY: Systemic red flags (fever or facial angioedema) require immediate urgent care.")

    # Re-normalize top predictions
    re_total = sum([s[1] for s in sorted_classes[:3]]) + 1e-9
    final_predictions = []
    for c, score in sorted_classes[:3]:
        meta = CLASS_METADATA.get(c, {
            "display_name": c.replace("_", " ").title(),
            "risk_level": "Moderate",
            "description": "Clinical dermatological condition.",
            "urgency": "Consult a healthcare provider.",
            "red_flags": "Spreading or severe pain."
        })
        norm_conf = score / re_total
        final_predictions.append({
            "class_name": c,
            "display_name": meta["display_name"],
            "confidence": round(norm_conf, 4),
            "confidence_percentage": f"{norm_conf * 100:.1f}%",
            "risk_level": "High / Urgent Attention" if safety_override and c == "melanoma_suspicious" else meta["risk_level"],
            "description": meta["description"],
            "urgency": "Immediate biopsy required." if safety_override and c == "melanoma_suspicious" else meta["urgency"],
            "red_flags": meta["red_flags"]
        })

    top_pred = final_predictions[0]
    overall_risk = "High / Urgent Triage Required" if safety_override else top_pred["risk_level"]

    rationale_str = " ".join(rationale_points) if rationale_points else "Multimodal synthesis corroborates vision and clinical symptoms."

    return {
        "top_condition": top_pred["display_name"],
        "top_class": top_pred["class_name"],
        "top_confidence": top_pred["confidence_percentage"],
        "overall_risk": overall_risk,
        "predictions": final_predictions,
        "fusion_rationale": rationale_str,
        "safety_override_triggered": safety_override,
        "red_flag_alerts": active_alerts
    }
