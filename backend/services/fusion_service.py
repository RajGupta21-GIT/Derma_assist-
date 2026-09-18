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
    prior_treatments = str(questionnaire.get("prior_treatments", "")).lower()
    fitzpatrick_tone = questionnaire.get("fitzpatrick_tone", "")

    # Base priors from Vision Model with Laplace baseline floor (prevents 0.0 lock)
    class_scores = {}
    for pred in vision_predictions:
        class_scores[pred["class_name"]] = max(0.02, float(pred.get("confidence", 0.02)))

    # Ensure all classes have a baseline floor
    for c in CLASSES:
        if c not in class_scores:
            class_scores[c] = 0.02

    # 1. Symptom Likelihood Multipliers based on Branching Questionnaire
    multipliers = {c: 1.0 for c in CLASSES}
    rationale_points = []
    active_alerts = []

    # A. Chief Complaint Conditional Priors (Sharpens inflammatory vs melanocytic separation)
    if chief_complaint == "mole_spot":
        multipliers["melanoma_suspicious"] *= 3.0
        multipliers["benign_nevi"] *= 2.8
        multipliers["eczema"] *= 0.15
        multipliers["contact_dermatitis"] *= 0.15
        multipliers["psoriasis"] *= 0.10
        multipliers["acne_rosacea"] *= 0.10
        multipliers["viral_eruptions"] *= 0.15
        multipliers["fungal_infections"] *= 0.15
        rationale_points.append("Patient chief complaint indicates a pigmented mole/dark spot.")

    elif chief_complaint == "red_rash":
        multipliers["contact_dermatitis"] *= 2.8
        multipliers["eczema"] *= 2.6
        multipliers["fungal_infections"] *= 2.5
        multipliers["viral_eruptions"] *= 2.0
        multipliers["melanoma_suspicious"] *= 0.12
        multipliers["benign_nevi"] *= 0.08
        rationale_points.append("Patient chief complaint focuses on an erythematous or pruritic rash.")

    elif chief_complaint == "scaly_plaque":
        multipliers["psoriasis"] *= 4.2
        multipliers["eczema"] *= 2.4
        multipliers["fungal_infections"] *= 2.0
        multipliers["melanoma_suspicious"] *= 0.10
        multipliers["benign_nevi"] *= 0.05
        rationale_points.append("Presentation of scaly plaque strongly prioritizes papulosquamous disorders.")

    elif chief_complaint == "facial_flare":
        multipliers["acne_rosacea"] *= 4.5
        multipliers["contact_dermatitis"] *= 1.8
        multipliers["melanoma_suspicious"] *= 0.10
        multipliers["benign_nevi"] *= 0.08
        rationale_points.append("Facial distribution prioritizes Acne Vulgaris and Rosacea.")

    # B. Indian Skin Phototype (Fitzpatrick IV-VI) Calibration
    is_indian_phototype = (
        fitzpatrick_tone in ["type_iv", "type_v", "type_vi", "indian_wheatish", "indian_brown", "indian_deep"]
        or questionnaire.get("phototype", "").startswith("type_")
    )
    if is_indian_phototype:
        rationale_points.append("Calibrated for Indian skin phototype (Fitzpatrick IV–VI): Erythema presents as violaceous / post-inflammatory hyperpigmentation rather than bright pink.")

    # C. Anatomical Site Likelihoods & Tropical Climate/Humidity
    if location == "groin_folds":
        multipliers["fungal_infections"] *= 3.2
        multipliers["eczema"] *= 2.0
        rationale_points.append("Groin/flexural crease localization strongly correlates with intertrigo and tinea cruris (3.2x multiplier).")
    elif location == "face":
        multipliers["acne_rosacea"] *= 3.0
        multipliers["contact_dermatitis"] *= 1.5
    elif location == "scalp":
        multipliers["psoriasis"] *= 2.5
        multipliers["fungal_infections"] *= 2.0

    has_tropical_factor = (
        branch_data.get("tropical_humidity", False)
        or branch_data.get("sweat_moisture", False)
        or "sweat" in prior_treatments
        or location in ["groin_folds", "legs_feet"]
    )
    if has_tropical_factor:
        multipliers["fungal_infections"] *= 3.0
        multipliers["contact_dermatitis"] *= 1.8
        rationale_points.append("Tropical humidity and occlusive sweat retention significantly elevate fungal dermatophyte (Tinea) and sweat dermatitis priors.")

    # D. Over-the-Counter Steroid Cream Misuse Detection (Betnovate, Quadriderm, Panderm, Clobetasol)
    steroid_keywords = ["betnovate", "quadriderm", "panderm", "steroid", "clobetasol", "momate", "dermive", "cortisone", "hydrocortisone"]
    reported_steroids = (
        [kw for kw in steroid_keywords if kw in prior_treatments]
        or branch_data.get("otc_steroid_use", False)
        or branch_data.get("steroid_use", False)
    )
    
    if reported_steroids:
        # High clinical suspicion for Tinea Incognito or Steroid-induced Rosacea
        multipliers["fungal_infections"] *= 3.2
        multipliers["acne_rosacea"] *= 2.2
        active_alerts.append("CLINICAL ALERT: Prior application of potent OTC steroid cream (e.g. Betnovate/Quadriderm) detected. High risk of Tinea Incognito (steroid-masked fungal flare) and rebound erythema.")
        rationale_points.append("History of topical steroid cream application alters classical presentation and markedly elevates Tinea Incognito probability.")

    # E. Specific Branching Drill-Down Logic & Evolution Velocity
    # Mole ABCDE branch
    is_mole_bleeding = branch_data.get("bleeding", False) or "bleeding" in sensations
    has_abcde_asymmetry = branch_data.get("abcde_asymmetry", False)
    has_abcde_border = branch_data.get("abcde_border", False)
    has_abcde_color = branch_data.get("abcde_color", False)
    has_abcde_diameter = branch_data.get("abcde_diameter", False)
    has_abcde_evolution = branch_data.get("abcde_evolution", False)

    abcde_count = sum([has_abcde_asymmetry, has_abcde_border, has_abcde_color, has_abcde_diameter, has_abcde_evolution])

    # Evolution velocity: rapid evolution + bleeding enforces a 10.0x multiplier on Melanoma / High Risk
    if (is_mole_bleeding or "bleeding" in sensations) and (has_abcde_evolution or duration == "acute"):
        multipliers["melanoma_suspicious"] *= 10.0
        rationale_points.append("High-velocity evolution: rapid lesion change combined with spontaneous bleeding activates emergency oncological prioritization (10x multiplier).")
    elif abcde_count >= 2:
        multipliers["melanoma_suspicious"] *= (2.5 + abcde_count * 1.2)
        rationale_points.append(f"Questionnaire reveals {abcde_count} positive ABCDE criteria (elevating dysplastic/malignant risk).")

    # Rash branch
    if branch_data.get("annular_ring", False):
        multipliers["fungal_infections"] *= 4.0
        rationale_points.append("Annular ring morphology with active peripheral margin strongly supports Tinea (Ringworm).")

    if branch_data.get("contact_allergen", False):
        multipliers["contact_dermatitis"] *= 3.8
        rationale_points.append("Recent chemical, detergent, cosmetic, or plant exposure correlates with acute Contact Dermatitis.")

    if branch_data.get("extensor_elbow_knee", False) or location in ["arms_hands", "legs_feet"]:
        multipliers["psoriasis"] *= 3.4
        rationale_points.append("Extensor surface plaque localization (elbows/knees) strongly supports Psoriasis.")

    if branch_data.get("flexural_folds", False):
        multipliers["eczema"] *= 3.2
        multipliers["fungal_infections"] *= 2.6
        rationale_points.append("Flexural crease localization (inner elbows, behind knees, groin) aligns with Atopic Dermatitis and intertriginous fungal disease.")

    if branch_data.get("flushing_spicy_heat", False):
        multipliers["acne_rosacea"] *= 3.6
        rationale_points.append("Vascular flushing provoked by spicy food, heat, or sun exposure strongly supports Rosacea.")

    # 2. Compute Bayesian Posterior Scores with Temperature Calibration
    raw_posteriors = {}
    for c in CLASSES:
        prior = class_scores.get(c, 0.05)
        raw_posteriors[c] = prior * multipliers.get(c, 1.0)

    # Temperature scaling on posteriors (tau = 0.85) to sharpen confidence
    tau = 0.85
    posterior_scores = {}
    eps = 1e-9
    for c, score in raw_posteriors.items():
        # log-transform and scale
        posterior_scores[c] = (score + eps) ** (1.0 / tau)

    # Normalize to sum to 1.0
    total_posterior = sum(posterior_scores.values()) + eps
    for c in posterior_scores:
        posterior_scores[c] = posterior_scores[c] / total_posterior

    # Sort descending
    sorted_classes = sorted(posterior_scores.items(), key=lambda x: x[1], reverse=True)

    # 3. Emergency Safety Override Check
    safety_override = False

    # Check for urgent malignancy red-flags
    if is_mole_bleeding or has_abcde_evolution or abcde_count >= 3:
        safety_override = True
        active_alerts.append("CRITICAL: Lesion exhibits active bleeding, rapid evolution, or marked ABCDE asymmetry.")
        # Ensure melanoma_suspicious is ranked top or prominently flagged
        if sorted_classes[0][0] != "melanoma_suspicious":
            sorted_classes = [("melanoma_suspicious", max(0.70, posterior_scores.get("melanoma_suspicious", 0.70)))] + [
                item for item in sorted_classes if item[0] != "melanoma_suspicious"
            ]

    # Check for systemic emergency red-flags
    if "high_fever" in red_flags or "facial_swelling" in red_flags or "rapid_purpura" in red_flags:
        safety_override = True
        active_alerts.append("EMERGENCY: Systemic red flags (fever, facial angioedema, or rapid purpura) require immediate urgent medical care.")

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
            "urgency": "Immediate in-person biopsy recommended." if safety_override and c == "melanoma_suspicious" else meta["urgency"],
            "red_flags": meta["red_flags"]
        })

    top_pred = final_predictions[0]
    overall_risk = "High / Urgent Triage Required" if safety_override else top_pred["risk_level"]

    rationale_str = " ".join(rationale_points) if rationale_points else "Multimodal synthesis corroborates vision features and clinical history."

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
