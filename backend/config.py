"""
Derma Assist - Backend Configuration & Clinical Metadata
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = BASE_DIR / "backend"
DATA_DIR = BASE_DIR / "data"
DEMO_DIR = DATA_DIR / "demo_samples"
MODEL_DIR = BACKEND_DIR / "models"
MODEL_PATH = MODEL_DIR / "derma_model.pth"

MODEL_DIR.mkdir(parents=True, exist_ok=True)
DEMO_DIR.mkdir(parents=True, exist_ok=True)

# API Keys & Secrets
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# CORS settings for React Vite frontend
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

# 8 Target Clinical Categories
CLASSES = [
    "eczema",
    "contact_dermatitis",
    "fungal_infections",
    "psoriasis",
    "acne_rosacea",
    "viral_eruptions",
    "benign_nevi",
    "melanoma_suspicious"
]

CLASS_METADATA = {
    "eczema": {
        "display_name": "Eczema (Atopic Dermatitis)",
        "risk_level": "Moderate",
        "description": "Chronic, pruritic inflammatory skin condition characterized by dry, erythematous, scaly patches and lichenification.",
        "urgency": "Routine outpatient follow-up. Emollient therapy and topical anti-inflammatories.",
        "red_flags": "Signs of secondary bacterial infection (honey-colored crusting, increasing warmth, fever)."
    },
    "contact_dermatitis": {
        "display_name": "Contact Dermatitis / Urticaria",
        "risk_level": "Moderate",
        "description": "Acute or chronic eczematous reaction provoked by external irritants or allergens, or transient edematous wheals.",
        "urgency": "Identify and eliminate offending allergen. Consider oral antihistamines.",
        "red_flags": "Facial swelling, lip or tongue edema, wheezing, or difficulty breathing (requires emergency evaluation)."
    },
    "fungal_infections": {
        "display_name": "Fungal Infection (Tinea / Ringworm)",
        "risk_level": "Mild-Moderate",
        "description": "Superficial dermatophyte infection presenting with an annular, erythematous scaly plaque with central clearing.",
        "urgency": "Topical or systemic antifungals. Maintain dry, clean skin.",
        "red_flags": "Extensive maceration, lack of response to topicals, or involvement of scalp/nails."
    },
    "psoriasis": {
        "display_name": "Psoriasis / Lichen Planus",
        "risk_level": "Moderate",
        "description": "Immune-mediated dermatosis featuring well-demarcated salmon-colored plaques with micaceous, silvery scales.",
        "urgency": "Consult dermatologist for topical corticosteroids, vitamin D analogs, or biologic therapy.",
        "red_flags": "Erythrodermic spread (>90% body surface area), generalized pustules, severe joint pain."
    },
    "acne_rosacea": {
        "display_name": "Acne Vulgaris & Rosacea",
        "risk_level": "Mild",
        "description": "Follicular disorder causing comedones, inflammatory papules, pustules, and telangiectasias or facial flushing.",
        "urgency": "Topical retinoids, benzoyl peroxide, or gentle non-comedogenic skincare.",
        "red_flags": "Nodulocystic scarring, ocular pain or gritty sensation in eyes (ocular rosacea)."
    },
    "viral_eruptions": {
        "display_name": "Viral Eruption (Herpes Zoster / Shingles)",
        "risk_level": "Moderate-High",
        "description": "Unilateral, dermatomal vesicular eruption associated with prodromal radicular pain, itching, or hyperesthesia.",
        "urgency": "Early oral antiviral therapy (within 72 hours of rash onset).",
        "red_flags": "Lesions near the tip of nose/eye (Hutchinson's sign - ophthalmic emergency risk), severe immunocompromised state."
    },
    "benign_nevi": {
        "display_name": "Benign Melanocytic Nevus (Mole)",
        "risk_level": "Low / Benign",
        "description": "Common circumscribed, pigmented benign proliferation of melanocytes with regular borders and uniform color.",
        "urgency": "Reassurance. Routine annual self-monitoring using the ABCDE rule.",
        "red_flags": "Any noticeable rapid change in symmetry, border regularity, color variation, or bleeding."
    },
    "melanoma_suspicious": {
        "display_name": "Suspicious Lesion / Melanoma",
        "risk_level": "High / Urgent Attention",
        "description": "Pigmented skin lesion displaying ABCDE warning signs (Asymmetry, Border irregularity, Color variegation, Diameter >6mm, Evolution).",
        "urgency": "Immediate in-person evaluation by a certified dermatologist for dermoscopy and excisional biopsy.",
        "red_flags": "Rapid enlargement, spontaneous bleeding, oozing, itching, or ulceration."
    }
}
