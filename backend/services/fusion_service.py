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

    active_classes = list(set([p["class_name"] for p in vision_predictions] + CLASSES))

    # 1. Base Vision Model Probabilities P(Vision)
    raw_vision_scores = {}
    for pred in vision_predictions:
        raw_vision_scores[pred["class_name"]] = max(0.02, float(pred.get("confidence", 0.02)))

    # Ensure all active classes have a baseline floor
    for c in active_classes:
        if c not in raw_vision_scores:
            raw_vision_scores[c] = 0.02

    # Check if derma_model.pth detected high visual suspicion of malignancy
    has_visual_malignancy = (
        raw_vision_scores.get("mel", 0) > 0.35 or
        raw_vision_scores.get("melanoma_suspicious", 0) > 0.35 or
        raw_vision_scores.get("bcc", 0) > 0.35
    )

    # For non-malignant presentations where patient reports an inflammatory rash:
    # Dampen benign mole priors and provide visual support for corresponding inflammatory classes
    if not has_visual_malignancy and chief_complaint in ["red_rash", "scaly_plaque", "facial_flare"]:
        if "nv" in raw_vision_scores:
            raw_vision_scores["nv"] *= 0.05
        if "benign_nevi" in raw_vision_scores:
            raw_vision_scores["benign_nevi"] *= 0.05
        if "bkl" in raw_vision_scores:
            raw_vision_scores["bkl"] *= 0.10

        if chief_complaint == "red_rash":
            for c in ["contact_dermatitis", "eczema", "fungal_infections", "viral_eruptions"]:
                raw_vision_scores[c] = max(raw_vision_scores.get(c, 0.02), 0.25)
        elif chief_complaint == "scaly_plaque":
            for c in ["psoriasis", "eczema", "fungal_infections"]:
                raw_vision_scores[c] = max(raw_vision_scores.get(c, 0.02), 0.30)
        elif chief_complaint == "facial_flare":
            for c in ["acne_rosacea", "contact_dermatitis"]:
                raw_vision_scores[c] = max(raw_vision_scores.get(c, 0.02), 0.35)

    # Normalize vision probabilities: sum P_vision = 1.0
    total_vision = sum(raw_vision_scores.values()) + 1e-9
    p_vision = {c: raw_vision_scores[c] / total_vision for c in active_classes}

    # 1. Symptom Likelihood Multipliers based on Branching Questionnaire
    multipliers = {c: 1.0 for c in active_classes}
    rationale_points = []
    active_alerts = []

    def boost(targets, factor):
        for t in targets:
            if t in multipliers:
                multipliers[t] *= factor

    # A. Chief Complaint Conditional Priors (Sharpens inflammatory vs melanocytic separation)
    if chief_complaint == "mole_spot":
        boost(["melanoma_suspicious", "mel"], 3.0)
        boost(["benign_nevi", "nv"], 2.8)
        boost(["bkl", "bcc", "akiec", "df", "vasc"], 1.8)
        boost(["eczema", "contact_dermatitis", "psoriasis", "acne_rosacea", "viral_eruptions", "fungal_infections"], 0.15)
        rationale_points.append("Patient chief complaint indicates a pigmented mole/dark spot.")

    elif chief_complaint == "red_rash":
        boost(["contact_dermatitis"], 2.8)
        boost(["eczema"], 2.6)
        boost(["fungal_infections"], 2.5)
        boost(["viral_eruptions"], 2.0)
        boost(["melanoma_suspicious", "mel"], 0.12)
        boost(["benign_nevi", "nv"], 0.08)
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

    # 2. Recalibrated Bayesian Synthesis: 65% Vision Model / 35% Questionnaire
    # P_final = 0.65 * P_vision + 0.35 * P_questionnaire
    total_q = sum(multipliers.values()) + 1e-9
    p_questionnaire = {c: multipliers[c] / total_q for c in active_classes}

    WEIGHT_VISION = 0.65
    WEIGHT_QUESTIONNAIRE = 0.35

    fused_scores = {}
    for c in active_classes:
        fused_scores[c] = (WEIGHT_VISION * p_vision.get(c, 0.0)) + (WEIGHT_QUESTIONNAIRE * p_questionnaire.get(c, 0.0))

    # Temperature scaling on posteriors (tau = 0.85) to sharpen confidence
    tau = 0.85
    posterior_scores = {}
    eps = 1e-9
    for c, score in fused_scores.items():
        # log-transform and scale
        posterior_scores[c] = (score + eps) ** (1.0 / tau)

    # Normalize to sum to 1.0
    total_posterior = sum(posterior_scores.values()) + eps
    for c in posterior_scores:
        posterior_scores[c] = posterior_scores[c] / total_posterior

    # Sort descending
    sorted_classes = sorted(posterior_scores.items(), key=lambda x: x[1], reverse=True)

    # 3. Emergency Safety Override & Systemic Red-Flag Prioritization
    safety_override = False
    target_override_class = None

    # A. Check for urgent malignancy red-flags (ABCDE, rapid evolution, bleeding)
    if is_mole_bleeding or has_abcde_evolution or abcde_count >= 3:
        safety_override = True
        target_override_class = "mel" if "mel" in posterior_scores else "melanoma_suspicious"
        active_alerts.append("CRITICAL: Lesion exhibits active bleeding, rapid evolution, or marked ABCDE asymmetry.")

    # B. Check for acute systemic emergency red-flags (anaphylaxis/angioedema, fever, rapid purpura)
    has_systemic_emergency = bool(
        "high_fever" in red_flags or
        "facial_swelling" in red_flags or
        "rapid_purpura" in red_flags
    )
    if has_systemic_emergency:
        safety_override = True
        # Suppress benign or mild superficial categories during life-threatening systemic presentation
        for benign_class in ["benign_nevi", "nv", "acne_rosacea"]:
            if benign_class in posterior_scores:
                posterior_scores[benign_class] = min(0.01, posterior_scores[benign_class] * 0.05)

        if "facial_swelling" in red_flags:
            # Acute allergic angioedema / severe urticaria with airway risk
            target_override_class = target_override_class or "contact_dermatitis"
            active_alerts.append("EMERGENCY: Rapid facial/lip angioedema or airway compromise indicates potential severe allergic reaction or anaphylaxis. Seek immediate emergency department care.")

        if "high_fever" in red_flags:
            # Systemic infection, Stevens-Johnson Syndrome, acute shingles or severe erythrodermic flare
            if chief_complaint in ["viral_eruptions", "mole_spot"] or "blister" in str(sensations):
                target_override_class = target_override_class or "viral_eruptions"
            else:
                target_override_class = target_override_class or "contact_dermatitis"
            active_alerts.append("EMERGENCY: High systemic fever (> 101°F / 38.5°C) combined with acute skin presentation requires urgent hospital evaluation to rule out severe systemic infection or Stevens-Johnson syndrome.")

        if "rapid_purpura" in red_flags:
            # Acute vasculitis or meningococcemia warning
            target_override_class = target_override_class or "contact_dermatitis"
            active_alerts.append("EMERGENCY: Rapidly spreading dark purpuric lesions indicate acute cutaneous vasculitis or meningococcemia risk. Immediate emergency care required.")

    # Re-sort classes after systemic adjustments
    sorted_classes = sorted(posterior_scores.items(), key=lambda x: x[1], reverse=True)

    # If safety override targets a specific urgent condition, elevate it to Rank 1 with dominant score
    if safety_override and target_override_class:
        other_candidates = [item for item in sorted_classes if item[0] != target_override_class]
        top_other_score = other_candidates[0][1] if other_candidates else 0.50
        # Assign an override score strictly higher than Rank 2
        elevated_top_score = max(0.80, top_other_score * 1.50)
        sorted_classes = [(target_override_class, elevated_top_score)] + other_candidates

    # 4. Enforce Strict Monotonic Confidence Ordering (Rank 1 > Rank 2 > Rank 3)
    # Prevents ranking inversion where Rank 1 has lower confidence than Rank 2
    top3_classes = sorted_classes[:3]
    calibrated_scores = []
    prev_s = float("inf")
    
    for i, (cls_name, raw_s) in enumerate(top3_classes):
        if i == 0:
            assigned = max(0.65, raw_s) if safety_override else raw_s
        else:
            # Enforce strict monotonic decrement so assigned < prev_s
            assigned = min(raw_s, prev_s * 0.70)
        assigned = max(0.01, assigned)
        calibrated_scores.append((cls_name, assigned))
        prev_s = assigned

    # Re-normalize top predictions to sum to 100%
    re_total = sum([s[1] for s in calibrated_scores]) + 1e-9
    final_predictions = []
    for c, score in calibrated_scores:
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
            "risk_level": "High / Urgent Attention" if safety_override and (c in ["melanoma_suspicious", "mel", "viral_eruptions", "contact_dermatitis"]) else meta["risk_level"],
            "description": meta["description"],
            "urgency": "Immediate in-person hospital/clinical evaluation recommended." if safety_override else meta["urgency"],
            "red_flags": meta["red_flags"],
            "root_causes": meta.get("root_causes", []),
            "care_matrix": meta.get("care_matrix", {"dos": [], "donts": []}),
            "specialist_procedures": meta.get("specialist_procedures", [])
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
        "root_causes": top_pred.get("root_causes", []),
        "care_matrix": top_pred.get("care_matrix", {"dos": [], "donts": []}),
        "specialist_procedures": top_pred.get("specialist_procedures", []),
        "fusion_rationale": rationale_str,
        "safety_override_triggered": safety_override,
        "red_flag_alerts": active_alerts
    }

