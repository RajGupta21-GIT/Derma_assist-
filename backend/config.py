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

# Display names matching CLASSES
CLASS_NAMES = [
    "Eczema (Atopic Dermatitis)",
    "Contact Dermatitis / Urticaria",
    "Fungal Infection (Tinea / Ringworm)",
    "Psoriasis / Lichen Planus",
    "Acne Vulgaris & Rosacea",
    "Viral Eruption (Herpes Zoster / Shingles)",
    "Benign Melanocytic Nevus (Mole)",
    "Suspicious Lesion / Melanoma"
]

CLASS_METADATA = {
    "eczema": {
        "display_name": "Eczema (Atopic Dermatitis)",
        "risk_level": "Moderate",
        "description": "Chronic, pruritic inflammatory skin condition characterized by dry, erythematous, scaly patches and lichenification.",
        "urgency": "Routine outpatient follow-up. Emollient therapy and topical anti-inflammatories.",
        "red_flags": "Signs of secondary bacterial infection (honey-colored crusting, increasing warmth, fever).",
        "root_causes": [
            {"icon": "🧬", "title": "Epidermal Barrier Breakdown", "description": "Loss-of-function Filaggrin (FLG) mutations reducing natural skin barrier integrity."},
            {"icon": "🌾", "title": "Environmental Allergens", "description": "House dust mites, pollen, pet dander, and dry low-humidity winter air triggering flares."},
            {"icon": "🧼", "title": "Detergents & Harsh Soaps", "description": "Surfactants stripping essential epidermal ceramides and provoking cutaneous micro-fissuring."},
            {"icon": "⚡", "title": "Immune Dysregulation", "description": "Overactive Th2 inflammatory pathway elevating IgE and persistent pruritus sensations."}
        ],
        "care_matrix": {
            "donts": [
                {"title": "No scalding hot baths", "description": "Hot water dissolves natural sebum and accelerates transepidermal water loss."},
                {"title": "No scratching or rubbing", "description": "Breaks the stratum corneum and leads to secondary bacterial impetiginization."},
                {"title": "No wool or abrasive fabrics", "description": "Causes mechanical friction and triggers intense itch-scratch cycles."},
                {"title": "No fragranced lotions", "description": "Perfumes and preservatives in standard cosmetics worsen allergic inflammation."}
            ],
            "dos": [
                {"title": "3-Minute ceramide moisturization", "description": "Apply rich ceramide barrier cream within 3 minutes of a lukewarm bath."},
                {"title": "Cool damp compresses", "description": "Apply a cool damp cloth for 10-15 minutes to alleviate burning and itch."},
                {"title": "100% loose breathable cotton", "description": "Allows proper cutaneous ventilation and minimizes friction on flexural folds."},
                {"title": "Keep fingernails trimmed short", "description": "Prevents deep excoriations and trauma to the skin barrier during sleep."}
            ]
        },
        "specialist_procedures": [
            {"name": "Total Serum IgE & Eosinophil Count", "description": "Quantifies allergic immune hyper-reactivity and atopic diathesis."},
            {"name": "Skin Prick Allergy Testing", "description": "Identifies specific environmental or dietary immunoglobulin triggers."},
            {"name": "Bacterial Swab & Culture", "description": "Excludes secondary Staphylococcus aureus superinfection on weeping patches."}
        ]
    },
    "contact_dermatitis": {
        "display_name": "Contact Dermatitis / Urticaria",
        "risk_level": "Moderate",
        "description": "Acute or chronic eczematous reaction provoked by external irritants or allergens, or transient edematous wheals.",
        "urgency": "Identify and eliminate offending allergen. Consider oral antihistamines.",
        "red_flags": "Facial swelling, lip or tongue edema, wheezing, or difficulty breathing (requires emergency evaluation).",
        "root_causes": [
            {"icon": "🖐️", "title": "Direct Chemical Irritation", "description": "Strong detergents, household bleach, industrial solvents, or frequent handwashing."},
            {"icon": "💍", "title": "Contact Allergen Exposure", "description": "Delayed Type-IV hypersensitivity to nickel jewelry, cosmetics, perfumes, or hair dyes (PPD)."},
            {"icon": "🌿", "title": "Botanical Sensitizers", "description": "Contact with Toxicodendron plants (urushiol), Parthenium weed, or essential oils."},
            {"icon": "🩹", "title": "Topical Medicament Sensitivity", "description": "Reaction to OTC topical antibiotic ointments (neomycin) or adhesive bandages."}
        ],
        "care_matrix": {
            "donts": [
                {"title": "Do not re-expose to suspected triggers", "description": "Strictly stop using new soaps, cosmetics, jewelry, or topical formulations."},
                {"title": "No vigorous scrubbing", "description": "Washing repeatedly with harsh soaps worsens epidermal disruption."},
                {"title": "No topical neomycin creams", "description": "Frequent causes of secondary allergic contact dermatitis and sensitization."},
                {"title": "Avoid popping any acute blisters", "description": "Intact blister roofs act as sterile biological dressings preventing infection."}
            ],
            "dos": [
                {"title": "Wash off residual irritant immediately", "description": "Rinse area with copious lukewarm water and a soap-free gentle cleanser."},
                {"title": "Cold physiological saline compresses", "description": "Helps dry weeping acute lesions and provides rapid soothing relief."},
                {"title": "Barrier cream application", "description": "Apply dimethicone or petrolatum barrier formulations to protect affected skin."},
                {"title": "Consider non-sedating oral antihistamines", "description": "Helps relieve histamine-mediated itch and systemic urticarial wheals."}
            ]
        },
        "specialist_procedures": [
            {"name": "Comprehensive Patch Testing (40+ Allergens)", "description": "Gold standard 48-72h diagnostic panel to isolate exact chemical or fragrance culprits."},
            {"name": "ROAT (Repeated Open Application Test)", "description": "Clinical in-use challenge on the antecubital fossa with patient's personal cosmetic products."},
            {"name": "Photopatch Evaluation", "description": "Evaluates photoallergic reactions provoked when allergens are exposed to UVA light."}
        ]
    },
    "fungal_infections": {
        "display_name": "Fungal Infection (Tinea / Ringworm)",
        "risk_level": "Mild-Moderate",
        "description": "Superficial dermatophyte infection presenting with an annular, erythematous scaly plaque with central clearing.",
        "urgency": "Topical or systemic antifungals. Maintain dry, clean skin.",
        "red_flags": "Extensive maceration, lack of response to topicals, or involvement of scalp/nails.",
        "root_causes": [
            {"icon": "🦠", "title": "Dermatophyte Keratin Invasion", "description": "Superficial fungal infection (Trichophyton rubrum or Microsporum) digesting keratin."},
            {"icon": "🌡️", "title": "Monsoon Humidity & Sweat", "description": "Warm tropical climate creating moist macerated environments in groin or toe webs."},
            {"icon": "🐾", "title": "Animal or Soil Transmission", "description": "Direct transmission from infected domestic pets, street animals, or contaminated soil."},
            {"icon": "🥋", "title": "Fomite & Gym Transmission", "description": "Shared damp bath towels, gym benches, locker rooms, or unwashed damp clothing."}
        ],
        "care_matrix": {
            "donts": [
                {"title": "STRICTLY AVOID OTC STEROID CREAMS", "description": "Creams like Betnovate/Quadriderm suppress local immunity and cause severe Tinea Incognito."},
                {"title": "Do not share personal clothing or towels", "description": "Fungal spores survive on damp fabrics and rapidly spread to household members."},
                {"title": "Do not wear occlusive synthetic underwear", "description": "Traps perspiration and fosters rapid dermatophyte fungal mycelial proliferation."},
                {"title": "Do not stop treatment prematurely", "description": "Requires continuing antifungal application for 1-2 weeks after visual clearance."}
            ],
            "dos": [
                {"title": "Keep all skin folds bone-dry", "description": "Thoroughly pat dry groin, axillae, and toe webs with a separate dedicated towel."},
                {"title": "Apply topical allylamine/azole antifungal", "description": "Use prescription Terbinafine, Clotrimazole, or Luliconazole cream extending 2cm past active border."},
                {"title": "Hot-wash all linens and innerwear", "description": "Wash undergarments in hot water (>60°C) and iron them inside-out to eliminate spores."},
                {"title": "Wear loose breathable pure cotton", "description": "Prevents friction and allows sweat evaporation to starve fungi of moisture."}
            ]
        },
        "specialist_procedures": [
            {"name": "10-20% KOH Keratin Dissolution Scraping", "description": "Rapid microscopic identification of translucent branching septate fungal hyphae."},
            {"name": "Sabouraud Dextrose Agar (SDA) Culture", "description": "Isolates fungal species and guides targeted systemic oral antifungal selection."},
            {"name": "Wood's Lamp UV Examination", "description": "Differentiates dermatophyte ringworm from Corynebacterium erythrasma (coral-red)."}
        ]
    },
    "psoriasis": {
        "display_name": "Psoriasis / Lichen Planus",
        "risk_level": "Moderate",
        "description": "Immune-mediated dermatosis featuring well-demarcated salmon-colored plaques with micaceous, silvery scales.",
        "urgency": "Consult dermatologist for topical corticosteroids, vitamin D analogs, or biologic therapy.",
        "red_flags": "Erythrodermic spread (>90% body surface area), generalized pustules, severe joint pain.",
        "root_causes": [
            {"icon": "🧬", "title": "Autoimmune Hyper-Proliferation", "description": "IL-23/IL-17 immune pathway causing epidermal cell turnover in 4 days instead of 28 days."},
            {"icon": "💥", "title": "Koebner Phenomenon", "description": "Mechanical friction, cuts, burns, or scratching inducing fresh psoriatic plaques."},
            {"icon": "🧠", "title": "Emotional & Physical Stress", "description": "Neuroendocrine release of substance P triggering systemic immune flare-ups."},
            {"icon": "🦠", "title": "Infectious & Drug Triggers", "description": "Streptococcal pharyngitis (guttate psoriasis) or beta-blockers and NSAID medications."}
        ],
        "care_matrix": {
            "donts": [
                {"title": "Do not pick or peel silvery scales", "description": "Triggers pinpoint dermal capillary bleeding (Auspitz sign) and causes Koebnerization."},
                {"title": "Avoid sudden oral steroid tapers", "description": "Systemic corticosteroids can trigger dangerous generalized pustular psoriasis rebound."},
                {"title": "Avoid smoking and excess alcohol", "description": "Substantially impairs systemic treatment response and worsens plaque severity."},
                {"title": "Avoid aggressive scrubbing in showers", "description": "Irritates plaques and accelerates localized epidermal hyperplasia."}
            ],
            "dos": [
                {"title": "Apply keratolytic urea/salicylic acid creams", "description": "Softens thick hyperkeratotic scales to improve barrier comfort and penetration."},
                {"title": "Gentle calibrated sun exposure", "description": "Natural sunlight (10-15 mins morning UVB) exerts therapeutic immunosuppressive effects."},
                {"title": "Coconut oil / liquid paraffin scalp soaks", "description": "Effectively lifts stubborn adherent scalp scales without follicular trauma."},
                {"title": "Practice consistent stress management", "description": "Mindfulness, adequate sleep, and yoga help stabilize inflammatory cytokine levels."}
            ]
        },
        "specialist_procedures": [
            {"name": "PASI (Psoriasis Area Severity Index) Staging", "description": "Standardized clinical calculation of erythema, induration, and body surface area coverage."},
            {"name": "Punch Biopsy (Munro Microabscesses)", "description": "Histopathological confirmation showing regular acanthosis and intracorneal neutrophils."},
            {"name": "Rheumatological Psoriatic Arthritis Screening", "description": "Assessment for enthesitis, dactylitis ('sausage digits'), and axial joint involvement."}
        ]
    },
    "acne_rosacea": {
        "display_name": "Acne Vulgaris & Rosacea",
        "risk_level": "Mild",
        "description": "Follicular disorder causing comedones, inflammatory papules, pustules, and telangiectasias or facial flushing.",
        "urgency": "Topical retinoids, benzoyl peroxide, or gentle non-comedogenic skincare.",
        "red_flags": "Nodulocystic scarring, ocular pain or gritty sensation in eyes (ocular rosacea).",
        "root_causes": [
            {"icon": "🪞", "title": "Sebum Hyper-Production", "description": "Androgen-mediated sebaceous hyperplasia producing excess free fatty acids."},
            {"icon": "🦠", "title": "Microbial & Mite Colonization", "description": "Cutibacterium acnes follicular proliferation and Demodex folliculorum mite overgrowth."},
            {"icon": "🌶️", "title": "Vascular & Dietary Provocation", "description": "Facial flushing triggered by spicy foods, cinnamaldehyde, alcohol, and ambient thermal heat."},
            {"icon": "🧱", "title": "Follicular Hyperkeratinization", "description": "Retention of desquamated corneocytes forming microcomedone plugs in hair follicles."}
        ],
        "care_matrix": {
            "donts": [
                {"title": "Never squeeze, pick, or pop blemishes", "description": "Ruptures follicle into deep dermis, producing severe post-inflammatory hyperpigmentation (PIH) and scarring."},
                {"title": "Avoid heavy comedogenic oils & pomades", "description": "Coconut oil, pure butter, and mineral waxes block follicular ostia."},
                {"title": "Avoid alcohol-based harsh astringents", "description": "Stripping skin causes rebound sebum hypersecretion and severe rosacea flare."},
                {"title": "Avoid thermal triggers (saunas, spicy foods)", "description": "Triggers sudden facial erythema, flushing, and telangiectasia expansion."}
            ],
            "dos": [
                {"title": "Gentle foaming cleanser twice daily", "description": "Use a pH-balanced (5.5) gentle cleanser containing 2% salicylic acid or zinc."},
                {"title": "Targeted active topical application", "description": "Apply Benzoyl Peroxide (2.5%) for inflammatory acne or Azelaic Acid (10-15%) for rosacea."},
                {"title": "Oil-free non-comedogenic sunscreen", "description": "Broad-spectrum mineral SPF 50 protects fragile flushed vascular vessels from UV flares."},
                {"title": "Wash pillowcases regularly", "description": "Change pillow covers twice a week to minimize facial microbial transfer."}
            ]
        },
        "specialist_procedures": [
            {"name": "Demodex Mite Microscopic Surface Biopsy", "description": "Measures mite density (>5 mites/cm² confirms Demodex-induced papulopustular rosacea)."},
            {"name": "Wood's Lamp Porphyrin Fluorescence", "description": "Visualizes orange-red fluorescence emitted by Cutibacterium acnes porphyrins."},
            {"name": "Endocrine Hormonal Profile", "description": "Evaluates Free Testosterone, DHEA-S, and LH/FSH in adult females with cystic jawline acne."}
        ]
    },
    "viral_eruptions": {
        "display_name": "Viral Eruption (Herpes Zoster / Shingles)",
        "risk_level": "Moderate-High",
        "description": "Unilateral, dermatomal vesicular eruption associated with prodromal radicular pain, itching, or hyperesthesia.",
        "urgency": "Early oral antiviral therapy (within 72 hours of rash onset).",
        "red_flags": "Lesions near the tip of nose/eye (Hutchinson's sign - ophthalmic emergency risk), severe immunocompromised state.",
        "root_causes": [
            {"icon": "⚡", "title": "VZV Sensory Ganglion Reactivation", "description": "Reactivation of dormant Varicella Zoster Virus from dorsal root or cranial ganglia."},
            {"icon": "🛡️", "title": "Immune Senescence or Suppression", "description": "Temporary decline in cell-mediated immunity due to advanced age, stress, or illness."},
            {"icon": "🧬", "title": "HSV-1 / HSV-2 Direct Transmission", "description": "Viral replication in cutaneous sensory nerve endings causing grouped vesicles."},
            {"icon": "🌡️", "title": "Physical Fatigue or UV Exposure", "description": "Intense solar radiation or extreme fatigue triggering recurrent herpes labialis."}
        ],
        "care_matrix": {
            "donts": [
                {"title": "Do not scratch or rupture blisters", "description": "Vesicle fluid contains live infectious virions that can spread and cause scarring."},
                {"title": "Avoid contact with vulnerable individuals", "description": "Stay away from pregnant women, infants, and immunocompromised persons until crusted."},
                {"title": "Do not apply heat pads over painful areas", "description": "Increases local vascular congestion and worsens sharp dermatomal neuropathic pain."},
                {"title": "Do not delay antiviral medication", "description": "Oral antivirals are maximally effective when started within 72 hours of first lesion."}
            ],
            "dos": [
                {"title": "Seek early prescription oral antivirals", "description": "Oral Valacyclovir or Acyclovir dramatically reduces viral shedding and nerve pain."},
                {"title": "Calamine lotion on intact blisters", "description": "Soothes itching and helps dry moist vesicles cleanly into crusts."},
                {"title": "Loose non-adherent sterile dressing", "description": "Protects weeping dermatomal blisters from painful contact with clothing."},
                {"title": "Prescribed analgesics for neuropathic pain", "description": "Early neuropathic pain control prevents debilitating Post-Herpetic Neuralgia (PHN)."}
            ]
        },
        "specialist_procedures": [
            {"name": "Tzanck Smear Cytology", "description": "Rapid bedside scraping revealing pathognomonic multinucleated epithelial giant cells."},
            {"name": "Multiplex Viral PCR (HSV-1, HSV-2, VZV)", "description": "Gold standard molecular identification with >99% diagnostic sensitivity."},
            {"name": "Ophthalmological Slit-Lamp Exam", "description": "Urgent eye consultation if vesicles involve forehead or nose tip (Herpes Zoster Ophthalmicus)."}
        ]
    },
    "benign_nevi": {
        "display_name": "Benign Melanocytic Nevus (Mole)",
        "risk_level": "Low / Benign",
        "description": "Common circumscribed, pigmented benign proliferation of melanocytes with regular borders and uniform color.",
        "urgency": "Reassurance. Routine annual self-monitoring using the ABCDE rule.",
        "red_flags": "Any noticeable rapid change in symmetry, border regularity, color variation, or bleeding.",
        "root_causes": [
            {"icon": "🧬", "title": "Stable Melanocytic Proliferation", "description": "Controlled benign accumulation of normal nevomelanocytes in epidermal or dermal junction."},
            {"icon": "👶", "title": "Congenital & Developmental Factors", "description": "Natural melanocytic migration during embryogenesis producing stable birthmarks."},
            {"icon": "☀️", "title": "Physiological Solar Stimulation", "description": "Mild episodic sunlight exposure stimulating melanin production in stable nests."},
            {"icon": "⏳", "title": "Normal Hormonal Maturation", "description": "Gradual junctional to compound to intradermal maturation over decades of life."}
        ],
        "care_matrix": {
            "donts": [
                {"title": "Do not try home mole removal or acid burns", "description": "Causes severe chemical scars, keloids, and secondary bacterial infections."},
                {"title": "Avoid repetitive abrasive friction", "description": "Irritation from tight waistbands, bra straps, or shaving can cause bleeding."},
                {"title": "Do not ignore any sudden rapid changes", "description": "Any change in color, size, symmetry, or spontaneous bleeding requires prompt review."},
                {"title": "Avoid sunbed tanning without sunscreen", "description": "UV radiation can induce dysplastic mutation in previously stable benign nevi."}
            ],
            "dos": [
                {"title": "Annual clinical skin check", "description": "Have a certified dermatologist inspect moles annually with a dermatoscope."},
                {"title": "Monthly ABCDE self-examinations", "description": "Check for Asymmetry, Border, Color, Diameter >6mm, and Evolution using a mirror."},
                {"title": "Routine sun protection", "description": "Apply broad-spectrum sunscreen and wear protective hats during peak hours."},
                {"title": "Monitor for the 'Ugly Duckling' sign", "description": "Look for any single mole that looks distinctly different from all your other moles."}
            ]
        },
        "specialist_procedures": [
            {"name": "Baseline Digital Dermoscopy Mapping", "description": "High-resolution digital archive of nevus patterns for automated comparative surveillance."},
            {"name": "Total Body Photography (Mole Mapping)", "description": "Whole-body photographic record to instantly spot newly emerging lesions."},
            {"name": "Shave or Punch Removal (If Irritated)", "description": "Elective cosmetic or comfort removal with routine confirmatory benign histology."}
        ]
    },
    "melanoma_suspicious": {
        "display_name": "Suspicious Lesion / Melanoma",
        "risk_level": "High / Urgent Attention",
        "description": "Pigmented skin lesion displaying ABCDE warning signs (Asymmetry, Border irregularity, Color variegation, Diameter >6mm, Evolution).",
        "urgency": "Immediate in-person evaluation by a certified dermatologist for dermoscopy and excisional biopsy.",
        "red_flags": "Rapid enlargement, spontaneous bleeding, oozing, itching, or ulceration.",
        "root_causes": [
            {"icon": "☀️", "title": "Ultraviolet Radiation DNA Damage", "description": "Intermittent intense solar UV exposure producing pyrimidine dimers and oncogenic mutations."},
            {"icon": "🧬", "title": "Driver Oncogene Mutations (BRAF/NRAS)", "description": "Constitutive activation of MAPK signaling pathway driving uncontrolled melanocytic proliferation."},
            {"icon": "🔍", "title": "Dysplastic Nevus Transformation", "description": "Atypical malignant transformation of preexisting irregular melanocytic moles."},
            {"icon": "🛡️", "title": "Host Genetic Susceptibility", "description": "CDKN2A germline mutations, numerous atypical nevi, and fair Fitzpatrick skin phototypes."}
        ],
        "care_matrix": {
            "donts": [
                {"title": "DO NOT SCRATCH, CUT, OR SHAVE THE LESION", "description": "Mechanical trauma disrupts tumor architecture and hinders accurate histopathologic depth measurement."},
                {"title": "Do not attempt home bleaching or herbal pastes", "description": "Masks visual warning signs and delays life-saving definitive surgical intervention."},
                {"title": "Do not delay professional dermatologist evaluation", "description": "Early detection in thin stage (<0.8mm Breslow depth) yields >98% cure rates."},
                {"title": "Avoid artificial tanning beds & sunburns", "description": "Intense UVA/UVB exposure accelerates genomic instability in melanocytic lesions."}
            ],
            "dos": [
                {"title": "Immediate in-person dermoscopy & biopsy", "description": "Schedule expedited consultation with a surgical dermatologist or oncology specialist."},
                {"title": "Complete full-thickness excisional biopsy", "description": "Standard diagnostic procedure removing the entire lesion with 1-2mm clinical margin."},
                {"title": "Perform serial ABCDE photographic tracking", "description": "Document high-clarity photographs with a millimeter ruler to monitor rapid evolution."},
                {"title": "Rigorous daily broad-spectrum SPF 50+", "description": "Shield all exposed cutaneous sites from further solar ultraviolet mutagenesis."}
            ]
        },
        "specialist_procedures": [
            {"name": "Polarized Multispectral Dermoscopy", "description": "High-magnification analysis of atypical pigment networks, blue-white veils, and crystalline structures."},
            {"name": "Full-Thickness Excisional Biopsy", "description": "Definitive histopathology assessing Breslow micro-thickness, ulceration, and Clark level."},
            {"name": "BRAF V600E Mutation & Sentinel Node Staging", "description": "Molecular biomarker profiling and lymphatic drainage mapping for intermediate/thick lesions."}
        ]
    },
    # HAM10000 Gold-Standard Taxonomy Support
    "nv": {
        "display_name": "Melanocytic Nevus (Common Mole)",
        "risk_level": "Low / Benign",
        "description": "Biopsy-verified melanocytic nevus exhibiting stable, uniform architecture.",
        "urgency": "Benign finding. Routine annual monitoring with dermoscopy or self-examination.",
        "red_flags": "Rapid asymmetrical growth, irregular ragged borders, color variegation, bleeding.",
        "root_causes": [
            {"icon": "🧬", "title": "Stable Melanocytic Proliferation", "description": "Controlled benign accumulation of normal nevomelanocytes in epidermal or dermal junction."},
            {"icon": "👶", "title": "Congenital & Developmental Factors", "description": "Natural melanocytic migration during embryogenesis producing stable birthmarks."},
            {"icon": "☀️", "title": "Physiological Solar Stimulation", "description": "Mild episodic sunlight exposure stimulating melanin production in stable nests."},
            {"icon": "⏳", "title": "Normal Hormonal Maturation", "description": "Gradual junctional to compound to intradermal maturation over decades of life."}
        ],
        "care_matrix": {
            "donts": [
                {"title": "Do not try home mole removal or acid burns", "description": "Causes severe chemical scars, keloids, and secondary bacterial infections."},
                {"title": "Avoid repetitive abrasive friction", "description": "Irritation from tight waistbands, bra straps, or shaving can cause bleeding."},
                {"title": "Do not ignore any sudden rapid changes", "description": "Any change in color, size, symmetry, or spontaneous bleeding requires prompt review."},
                {"title": "Avoid sunbed tanning without sunscreen", "description": "UV radiation can induce dysplastic mutation in previously stable benign nevi."}
            ],
            "dos": [
                {"title": "Annual clinical skin check", "description": "Have a certified dermatologist inspect moles annually with a dermatoscope."},
                {"title": "Monthly ABCDE self-examinations", "description": "Check for Asymmetry, Border, Color, Diameter >6mm, and Evolution using a mirror."},
                {"title": "Routine sun protection", "description": "Apply broad-spectrum sunscreen and wear protective hats during peak hours."},
                {"title": "Monitor for the 'Ugly Duckling' sign", "description": "Look for any single mole that looks distinctly different from all your other moles."}
            ]
        },
        "specialist_procedures": [
            {"name": "Baseline Digital Dermoscopy Mapping", "description": "High-resolution digital archive of nevus patterns for automated comparative surveillance."},
            {"name": "Total Body Photography (Mole Mapping)", "description": "Whole-body photographic record to instantly spot newly emerging lesions."},
            {"name": "Shave or Punch Removal (If Irritated)", "description": "Elective cosmetic or comfort removal with routine confirmatory benign histology."}
        ]
    },
    "mel": {
        "display_name": "Melanoma (Malignant)",
        "risk_level": "High / Urgent Attention",
        "description": "Malignant melanocytic neoplasm requiring immediate dermatological excision and histopathology.",
        "urgency": "Emergency referral for urgent dermoscopy and complete wide local surgical excision.",
        "red_flags": "Rapid expansion, ulceration, spontaneous bleeding, elevated nodularity, satellite lesions.",
        "root_causes": [
            {"icon": "☀️", "title": "Ultraviolet Radiation DNA Damage", "description": "Intermittent intense solar UV exposure producing pyrimidine dimers and oncogenic mutations."},
            {"icon": "🧬", "title": "Driver Oncogene Mutations (BRAF/NRAS)", "description": "Constitutive activation of MAPK signaling pathway driving uncontrolled melanocytic proliferation."},
            {"icon": "🔍", "title": "Dysplastic Nevus Transformation", "description": "Atypical malignant transformation of preexisting irregular melanocytic moles."},
            {"icon": "🛡️", "title": "Host Genetic Susceptibility", "description": "CDKN2A germline mutations, numerous atypical nevi, and fair Fitzpatrick skin phototypes."}
        ],
        "care_matrix": {
            "donts": [
                {"title": "DO NOT SCRATCH, CUT, OR SHAVE THE LESION", "description": "Mechanical trauma disrupts tumor architecture and hinders accurate histopathologic depth measurement."},
                {"title": "Do not attempt home bleaching or herbal pastes", "description": "Masks visual warning signs and delays life-saving definitive surgical intervention."},
                {"title": "Do not delay professional dermatologist evaluation", "description": "Early detection in thin stage (<0.8mm Breslow depth) yields >98% cure rates."},
                {"title": "Avoid artificial tanning beds & sunburns", "description": "Intense UVA/UVB exposure accelerates genomic instability in melanocytic lesions."}
            ],
            "dos": [
                {"title": "Immediate in-person dermoscopy & biopsy", "description": "Schedule expedited consultation with a surgical dermatologist or oncology specialist."},
                {"title": "Complete full-thickness excisional biopsy", "description": "Standard diagnostic procedure removing the entire lesion with 1-2mm clinical margin."},
                {"title": "Perform serial ABCDE photographic tracking", "description": "Document high-clarity photographs with a millimeter ruler to monitor rapid evolution."},
                {"title": "Rigorous daily broad-spectrum SPF 50+", "description": "Shield all exposed cutaneous sites from further solar ultraviolet mutagenesis."}
            ]
        },
        "specialist_procedures": [
            {"name": "Polarized Multispectral Dermoscopy", "description": "High-magnification analysis of atypical pigment networks, blue-white veils, and crystalline structures."},
            {"name": "Full-Thickness Excisional Biopsy", "description": "Definitive histopathology assessing Breslow micro-thickness, ulceration, and Clark level."},
            {"name": "BRAF V600E Mutation & Sentinel Node Staging", "description": "Molecular biomarker profiling and lymphatic drainage mapping for intermediate/thick lesions."}
        ]
    },
    "bkl": {
        "display_name": "Benign Keratosis (Seborrheic / Solar Lentigo)",
        "risk_level": "Low / Benign",
        "description": "Common non-cancerous skin growth presenting with a 'stuck-on' warty or hyperkeratotic plaque.",
        "urgency": "Reassurance. Cryotherapy or curettage if mechanically irritated or cosmetically desired.",
        "red_flags": "Ulceration, rapid pigment change resembling melanoma.",
        "root_causes": [
            {"icon": "⏳", "title": "Keratinocyte Senescence", "description": "Clonal proliferation of mature epidermal keratinocytes with age."},
            {"icon": "🧬", "title": "FGFR3 & PIK3CA Somatic Mutations", "description": "Non-malignant driver mutations promoting benign acanthosis and hyperkeratosis."},
            {"icon": "☀️", "title": "Chronic Solar Cumulative Exposure", "description": "Solar lentigo transformation in sun-exposed anatomical areas."},
            {"icon": "🛡️", "title": "Familial Genetic Predisposition", "description": "Autosomal dominant tendency to develop multiple benign seborrheic keratoses."}
        ],
        "care_matrix": {
            "donts": [
                {"title": "Do not pick or scratch the warty crusts", "description": "Can induce localized bleeding, inflammation, and secondary bacterial crusting."},
                {"title": "Do not apply corrosive wart acids", "description": "OTC salicylic wart paints can cause severe chemical scarring on benign keratoses."},
                {"title": "Do not ignore sudden eruptive dozens of lesions", "description": "Sudden onset of hundreds of keratoses (Sign of Leser-Trélat) requires internal screening."},
                {"title": "Avoid friction from belts or collars", "description": "Mechanical rubbing can cause painful inflammation of pedunculated lesions."}
            ],
            "dos": [
                {"title": "Annual dermatologic inspection", "description": "Ensure accurate dermoscopic differentiation from nodular or pigmented melanoma."},
                {"title": "Elective cryosurgery (liquid nitrogen)", "description": "Quick outpatient freezing reliably clears cosmetically bothersome plaques."},
                {"title": "Gentle moisturizing body washes", "description": "Reduces dryness and roughness across mature hyperkeratotic surfaces."},
                {"title": "Routine broad-spectrum sun protection", "description": "Minimizes formation of adjacent reticulated solar lentigines."}
            ]
        },
        "specialist_procedures": [
            {"name": "Dermoscopic Comedo-like Openings & Milia Cysts", "description": "Confirms classic pathognomonic benign hallmark patterns under polarized light."},
            {"name": "Light Cryotherapy / Electrodesiccation", "description": "Minimally invasive destruction yielding smooth epidermal regeneration."},
            {"name": "Shave Biopsy for Pathologic Differentiation", "description": "Excludes pigmented basal cell carcinoma or verrucous melanoma."}
        ]
    },
    "bcc": {
        "display_name": "Basal Cell Carcinoma",
        "risk_level": "Moderate-High (Malignant Non-Melanoma)",
        "description": "Most common cutaneous malignancy, typically presenting with a translucent pearly papule with telangiectasias or rolled borders.",
        "urgency": "Dermatologic surgical consult for Mohs micrographic surgery or surgical excision.",
        "red_flags": "Non-healing ulcer that bleeds, central crusted erosion, perineural invasion signs.",
        "root_causes": [
            {"icon": "☀️", "title": "Cumulative Solar Ultraviolet Damage", "description": "Chronic sun exposure causing PTCH1 and TP53 tumor suppressor gene mutations."},
            {"icon": "🧬", "title": "Sonic Hedgehog Signaling Deregulation", "description": "Inappropriate activation of SMO receptor leading to basaloid cell proliferation."},
            {"icon": "🧑‍🦳", "title": "Fair Skin & Sunburn Vulnerability", "description": "Fitzpatrick phototypes I-II with reduced cutaneous melanin photoprotection."},
            {"icon": "🛡️", "title": "Prior Radiation or Immunosuppression", "description": "Therapeutic radiation history or long-term organ transplant immunosuppressive therapy."}
        ],
        "care_matrix": {
            "donts": [
                {"title": "DO NOT SQUEEZE OR PICK CRUSTED EDGES", "description": "Disrupts neoplastic margin demarcation and provokes friable capillary bleeding."},
                {"title": "Do not apply non-prescribed herbal ointments", "description": "Can mask underlying tissue invasion and delay curable early surgical clearance."},
                {"title": "Do not delay surgical appointment", "description": "Though rarely metastasizing, untreated BCC invades cartilage, bone, and nerves."},
                {"title": "Avoid unprotected sun exposure", "description": "UV radiation fuels adjacent secondary cutaneous field carcinogenesis."}
            ],
            "dos": [
                {"title": "Consult Mohs Micrographic Surgeon", "description": "Gold standard tissue-sparing surgery yielding >99% 5-year cure rate for facial lesions."},
                {"title": "Standard surgical excision with 4mm margin", "description": "Effective definitive treatment for low-risk trunk and extremity lesions."},
                {"title": "Strict daily mineral SPF 50 sunscreen", "description": "Crucial to prevent high-rate second primary basal cell carcinomas."},
                {"title": "Keep lesion covered with clean dressing", "description": "Protects ulcerated friable central craters from environmental contaminants."}
            ]
        },
        "specialist_procedures": [
            {"name": "Dermoscopy for Arborizing Vessels & Spoke-Wheel Areas", "description": "Identifies classical sharp branching telangiectasias and leaf-like pigmentation."},
            {"name": "Mohs Micrographic Surgery", "description": "Real-time 100% surgical margin microscopic examination with maximal healthy tissue sparing."},
            {"name": "Punch / Shave Biopsy Histopathology", "description": "Confirms histological subtype (nodular, superficial, morpheaform, or infiltrative)."}
        ]
    },
    "akiec": {
        "display_name": "Actinic Keratosis / Bowen's Disease",
        "risk_level": "Pre-Malignant / Moderate",
        "description": "Rough, scaly precancerous patch induced by chronic ultraviolet radiation with risk of malignant transformation into squamous cell carcinoma.",
        "urgency": "Field-directed or lesion-directed therapy (cryosurgery, 5-fluorouracil, imiquimod).",
        "red_flags": "Rapid induration, erythema, tenderness, or thickness indicating invasion.",
        "root_causes": [
            {"icon": "☀️", "title": "Chronic Lifetime UV Damage", "description": "Cumulative solar ultraviolet radiation producing UV-signature TP53 gene mutations."},
            {"icon": "🧑‍🦲", "title": "Photo-Exposed Field Cancerization", "description": "Widespread subclinical dysplastic keratinocytes across bald scalps, faces, and forearms."},
            {"icon": "⏳", "title": "Advanced Age & Photoaging", "description": "Decades of solar elastosis diminishing epidermal DNA repair capacity."},
            {"icon": "🛡️", "title": "Immune Defense Reduction", "description": "Suppressed cutaneous T-cell surveillance allowing atypical keratinocytic clonal expansion."}
        ],
        "care_matrix": {
            "donts": [
                {"title": "Do not violently scratch off rough gritty sandpaper scales", "description": "Trauma leads to painful erosions and does not remove the basal dysplastic cells."},
                {"title": "Do not ignore rapid thickening or induration", "description": "Tender firm nodules often herald malignant transformation into invasive SCC."},
                {"title": "Do not go outdoors without broad-brimmed hats", "description": "Bald scalps and ears receive intense perpendicular solar radiation."},
                {"title": "Avoid tanning lamps and harsh chemical peels", "description": "Exacerbates field carcinogenesis on fragile photo-damaged skin."}
            ],
            "dos": [
                {"title": "Prompt dermatological field therapy", "description": "Topical 5-Fluorouracil (5-FU) or Imiquimod creams destroy precancerous clones."},
                {"title": "Targeted liquid nitrogen cryosurgery", "description": "Freezes discrete hyperkeratotic lesions quickly in outpatient clinics."},
                {"title": "Daily broad-spectrum mineral SPF 50+", "description": "Allows spontaneous regression of early actinic lesions and stops new mutations."},
                {"title": "Self-monitor for tenderness or rapid elevation", "description": "Examine scalp, temples, and dorsal hands monthly for tender growing keratoses."}
            ]
        },
        "specialist_procedures": [
            {"name": "Polarized Dermoscopy for 'Strawberry Pattern'", "description": "Visualizes pseudonetwork of prominent follicular openings and wavy vascular lines."},
            {"name": "Field Cryosurgery / Photodynamic Therapy (PDT)", "description": "5-ALA photosensitizer application followed by blue/red light activation."},
            {"name": "Confirmatory Punch Biopsy", "description": "Verifies whether atypical keratinocytes breach the basement membrane."}
        ]
    },
    "vasc": {
        "display_name": "Vascular Lesion (Angioma / Pyogenic)",
        "risk_level": "Low / Benign",
        "description": "Benign proliferation of blood vessels including cherry angiomas and angiokeratomas.",
        "urgency": "Reassurance. Laser ablation or minor excision if prone to recurrent bleeding.",
        "red_flags": "Spontaneous recurrent bleeding, rapid pulsatile enlargement.",
        "root_causes": [
            {"icon": "🩸", "title": "Microvascular Endothelial Proliferation", "description": "Benign ectasia and budding of dermal post-capillary venules and capillaries."},
            {"icon": "🧬", "title": "Genetic & Angiogenic Factors", "description": "Elevated vascular endothelial growth factor (VEGF) driving localized angiomatous nests."},
            {"icon": "⏳", "title": "Age-Related Cutaneous Angiogenesis", "description": "Extremely common physiological cherry angioma formation starting in 3rd-4th decade."},
            {"icon": "💥", "title": "Minor Cutaneous Micro-Trauma", "description": "Scratching or small puncture wounds triggering rapid pyogenic granuloma lobular growth."}
        ],
        "care_matrix": {
            "donts": [
                {"title": "DO NOT PUNCTURE, SQUEEZE, OR PRICK THE LESION", "description": "Vascular lesions bleed profusely due to high intradermal capillary pressure."},
                {"title": "Do not apply caustic chemicals at home", "description": "Causes chemical burns without sealing the underlying feeding vascular pedicle."},
                {"title": "Avoid rough towels over raised lesions", "description": "Friction can avulse pyogenic granulomas, causing persistent hemorrhage."},
                {"title": "Do not panic if bleeding occurs", "description": "Benign vascular bleeds look alarming but respond well to continuous firm pressure."}
            ],
            "dos": [
                {"title": "Firm continuous pressure for bleeding", "description": "Apply clean gauze with firm uninterrupted finger pressure for 10-15 minutes."},
                {"title": "Pulsed dye laser (PDL) or electrocautery", "description": "Quick, scarless office coagulation of unwanted or irritated cherry angiomas."},
                {"title": "Keep the area clean with sterile dressing", "description": "Protects fragile endothelial walls from mechanical friction against clothing."},
                {"title": "Consult a doctor if rapid enlargement occurs", "description": "Rapidly growing bleeding vascular nodules (pyogenic granuloma) need definitive excision."}
            ]
        },
        "specialist_procedures": [
            {"name": "Dermoscopy for Red-Purple Lacunae & Lagoons", "description": "Pathognomonic well-demarcated round vascular lacunae confirming benign angioma."},
            {"name": "Pulsed Dye Laser (PDL) 595nm Photocoagulation", "description": "Selectively targets oxyhemoglobin without damaging overlying epidermis."},
            {"name": "Shave Excision with Base Cautery", "description": "Complete removal and histopathological verification for bleeding lesions."}
        ]
    },
    "df": {
        "display_name": "Dermatofibroma",
        "risk_level": "Low / Benign",
        "description": "Firm, benign fibrohistiocytic dermal nodule classically showing a positive dimple sign upon lateral compression.",
        "urgency": "Reassurance. No intervention required unless symptomatic.",
        "red_flags": "Rapid atypical enlargement, multiple eruptive lesions.",
        "root_causes": [
            {"icon": "🦟", "title": "Reactive Trauma / Arthropod Bite", "description": "Exuberant reactive dermal fibroblastic proliferation following an insect bite or puncture."},
            {"icon": "🧬", "title": "Benign Clonal Fibrohistiocytic Nodule", "description": "Proliferation of mature spindle cells, histiocytes, and thick collagen bundles."},
            {"icon": "🪒", "title": "Folliculitis or Shaving Nick", "description": "Micro-abrasions on lower legs triggering dense localized dermal scar-like reaction."},
            {"icon": "🛡️", "title": "Altered Local Tissue Remodeling", "description": "Overactive TGF-beta signaling producing firm keloid-like fibrous button."}
        ],
        "care_matrix": {
            "donts": [
                {"title": "Do not attempt to squeeze like a cyst", "description": "Dermatofibromas are solid fibrous tissue; squeezing causes severe local pain and bruising."},
                {"title": "Avoid accidental shaving cuts over the nodule", "description": "Shaving over raised nodules on legs can slice the overlying epidermis and bleed."},
                {"title": "Do not assume every pigmented bump is a mole", "description": "Dermatofibromas often induce overlying epidermal hyperpigmentation."},
                {"title": "Avoid aggressive excisions unless strictly needed", "description": "Deep excision often leaves a wider surgical scar than the small original nodule."}
            ],
            "dos": [
                {"title": "Perform the clinical 'Dimple Sign' test", "description": "Pinching the skin laterally causes the nodule to dimple downwards (pathognomonic sign)."},
                {"title": "Reassurance of benign nature", "description": "Completely harmless lesion with zero malignant transformation potential."},
                {"title": "Moisturize surrounding leg skin", "description": "Alleviates occasional mild pruritus without disturbing the stable nodule."},
                {"title": "Have an annual dermoscopy check", "description": "Confirms delicate peripheral pigment network with classic central white scar patch."}
            ]
        },
        "specialist_procedures": [
            {"name": "Dermoscopy: Central White Patch & Fine Pigment Ring", "description": "Classic dermatoscopic hallmark confirming dermatofibroma with high diagnostic confidence."},
            {"name": "Lateral Compression 'Dimple Sign' Clinical Exam", "description": "Immediate bedside manual verification distinguishing dermal from epidermal lesions."},
            {"name": "Cryosurgery / Punch Biopsy (If Symptomatic)", "description": "Light superficial freezing flattens raised nodules if catching painfully on clothes."}
        ]
    }
}

