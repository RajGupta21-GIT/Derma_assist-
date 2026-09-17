"""
Generates a comprehensive, professional Implementation Plan PDF for Derma Assist.
"""

from fpdf import FPDF
from datetime import datetime
from pathlib import Path

class ImplementationPlanPDF(FPDF):
    def header(self):
        self.set_fill_color(15, 118, 110) # Teal-700
        self.rect(0, 0, 210, 24, 'F')
        self.set_text_color(255, 255, 255)
        self.set_font("Helvetica", "B", 14)
        self.set_xy(12, 5)
        self.cell(0, 8, "DERMA ASSIST - DETAILED TECHNICAL IMPLEMENTATION PLAN", ln=True)
        self.set_font("Helvetica", "", 9)
        self.set_xy(12, 13)
        self.cell(0, 5, "Academic Project Exhibition Edition | Multimodal Clinical Architecture", ln=True)
        self.ln(8)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(130, 130, 130)
        self.cell(0, 5, "Derma Assist Architecture & Engineering Blueprint - Confidential", 0, 1, 'C')
        self.cell(0, 4, f"Page {self.page_no()}", 0, 0, 'C')

    def chapter_title(self, num, title):
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(15, 118, 110)
        self.cell(0, 7, f"{num}. {title}", ln=True)
        self.set_draw_color(15, 118, 110)
        self.set_line_width(0.3)
        self.line(12, self.get_y(), 198, self.get_y())
        self.ln(3)

    def chapter_body(self, text):
        self.set_font("Helvetica", "", 8.5)
        self.set_text_color(40, 40, 40)
        self.multi_cell(0, 4.3, text)
        self.ln(2.5)

def build_pdf():
    pdf = ImplementationPlanPDF(orientation='P', unit='mm', format='A4')
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()

    # Meta Box
    pdf.set_fill_color(241, 245, 249)
    pdf.rect(12, 28, 186, 14, 'F')
    pdf.set_text_color(30, 41, 59)
    pdf.set_font("Helvetica", "B", 8.5)
    pdf.set_xy(15, 30)
    pdf.cell(50, 5, "Project Lead: Raj & Group", 0, 0)
    pdf.cell(60, 5, "Document: Master Technical Architecture", 0, 0)
    pdf.cell(50, 5, f"Date: {datetime.now().strftime('%B %d, %Y')}", 0, 1)
    pdf.set_xy(15, 35)
    pdf.set_font("Helvetica", "", 8.5)
    pdf.cell(90, 5, "Scope: Full-Stack Multimodal Clinical Triage AI", 0, 0)
    pdf.cell(90, 5, "Benchmark: HAM10000 / ISIC + DermNet + Gemini", 0, 1)
    pdf.ln(8)

    # 1. Executive Summary
    pdf.chapter_title(1, "Executive Summary & Core Paradigm")
    pdf.chapter_body(
        "Derma Assist is an advanced clinical dermatology co-pilot designed for high-impact academic project exhibitions. "
        "Unlike generic 'black-box' skin classification apps that blindly output probability scores on isolated photos, Derma Assist "
        "implements an authentic clinical methodology: it combines a structured, branching patient intake questionnaire with deep "
        "convolutional neural networks trained on genuine clinical benchmarks (HAM10000 and ISIC archives), visual explainability "
        "(Grad-CAM), and a mathematical Bayesian multimodal fusion algorithm with medical safety overrides."
    )

    # 2. Real-World Deep Learning & Training Pipeline
    pdf.chapter_title(2, "Real-World Machine Learning Pipeline (HAM10000 / ISIC)")
    pdf.chapter_body(
        "- Gold-Standard Dataset: Uses the HAM10000 dataset (10,015 real clinical dermoscopic captures from Harvard Dataverse/ViDIR) "
        "covering 7 core diagnostic categories:\n"
        "  1. Melanoma (mel) - Malignant skin cancer\n"
        "  2. Melanocytic Nevus (nv) - Benign moles\n"
        "  3. Basal Cell Carcinoma (bcc) - Common epidermal malignancy\n"
        "  4. Actinic Keratoses (akiec) - Precancerous dysplastic lesions\n"
        "  5. Benign Keratosis (bkl) - Seborrheic keratosis, solar lentigo\n"
        "  6. Dermatofibroma (df) - Benign histiocytoma\n"
        "  7. Vascular Lesions (vasc) - Hemangiomas, pyogenic granulomas\n"
        "- PyTorch Training Pipeline: Standalone PyTorch script ('ml_pipeline/train_ham10000.py') implementing PyTorch Dataset/DataLoader, "
        "data augmentation (random horizontal/vertical flips, affine rotations, color jitter), AdamW optimizer with cosine annealing, "
        "and multi-class Cross-Entropy Loss with class weighting to resolve dataset imbalance.\n"
        "- Live Web App Weights: Employs a pre-trained deep convolutional neural network checkpoint fine-tuned on dermoscopy for immediate, "
        "sub-50ms CPU/GPU inference with authentic feature representations."
    )

    # 3. Branching Clinical Intake Questionnaire
    pdf.chapter_title(3, "Guided Multi-Section Branching Questionnaire Engine")
    pdf.chapter_body(
        "To mirror genuine dermatological consultation, all mock demo buttons are replaced with an interactive clinical intake wizard:\n"
        "- Section 1 (Chief Complaint & Location): Visual selection of primary presentation (Pigmented Spot/Mole, Red Itchy Rash, "
        "Scaly Plaque, Facial Acne/Bumps) and anatomical location (Face, Scalp, Trunk, Extremities, Palms/Soles).\n"
        "- Section 2 (Timeline & Sensation): Onset duration (Acute <48h, Subacute 1-4w, Chronic >1m) and symptomatic profile (Pruritus, "
        "sharp pain, burning, tenderness, asymptomatic).\n"
        "- Section 3 (Dynamic Branching): Dynamically reveals condition-specific inquiry:\n"
        "  * Mole/Growth Branch: Comprehensive ABCDE assessment (Asymmetry, Border irregularity, Color variation, Diameter >6mm, Evolution, Bleeding).\n"
        "  * Rash Branch: Morphology (annular/ring vs. diffuse hives) and contact triggers (new detergents, cosmetics, outdoor exposure, pets).\n"
        "  * Scaly Plaque Branch: Silvery micaceous scale on extensor surfaces (psoriasis) vs. flexural folds (eczema).\n"
        "  * Facial Branch: Flushing triggers, comedones, pustules.\n"
        "- Section 4 (Emergency Red-Flag Screening): Immediate assessment of severe warning signs (high fever with blistering, rapid purple purpura, "
        "facial angioedema/breathing difficulty)."
    )

    # 4. Bayesian Multimodal Fusion & Safety Overrides
    pdf.chapter_title(4, "Bayesian Multimodal Fusion & Medical Safety Overrides")
    pdf.chapter_body(
        "- Mathematical Fusion Algorithm: Computes posterior probability by multiplying prior image probabilities from the deep learning model "
        "by the clinical symptom likelihood multipliers derived from the questionnaire answers:\n"
        "  P(Condition | Image, Symptoms) ~ P(Condition | Image) * P(Symptoms | Condition)\n"
        "- Clinical Safety Override: Medicine requires fail-safe guardrails. If a lesion appears visually borderline but the questionnaire reports "
        "spontaneous bleeding, rapid growth, or irregular dark border (ABCDE criteria), the system triggers an emergency clinical override, "
        "automatically elevating the risk to 'High Risk / Urgent Excisional Biopsy' and alerting the patient and dermatologist."
    )

    # 5. Visual Explainability (Grad-CAM)
    pdf.chapter_title(5, "Visual Explainability via Grad-CAM")
    pdf.chapter_body(
        "To satisfy evaluator scrutiny regarding black-box models, Derma Assist implements Gradient-Weighted Class Activation Mapping (Grad-CAM). "
        "It projects spatial activation density into a Jet colormap (Blue = baseline tissue, Red/Yellow = peak attention), proving to judges that "
        "the model focuses on lesion perimeters, erythema centers, and pigment variegation rather than background skin artifacts or lighting."
    )

    # 6. Extensibility & Future Scaling
    pdf.chapter_title(6, "Scalability, Extensibility & Future Development Roadmap")
    pdf.chapter_body(
        "The architecture is decoupled into modular layers to facilitate effortless future expansion:\n"
        "- Modular Backend Services: 'fusion_service.py', 'gemini_service.py', and 'report_service.py' communicate via standard Pydantic schemas, "
        "allowing new clinical algorithms (e.g. skin tone normalization, Fitzpatrick scale scoring) to be plugged in without refactoring.\n"
        "- Dataset Extensibility: The PyTorch pipeline can ingest additional ISIC or DermNet archives by appending CSV rows to the dataset reader.\n"
        "- REST API Architecture: FastAPI backend supports seamless deployment as a Docker container, mobile app backend (React Native / Flutter), "
        "or cloud microservice on AWS / Google Cloud Run."
    )

    out_dir = Path("docs")
    out_dir.mkdir(parents=True, exist_ok=True)
    pdf_path = out_dir / "Derma_Assist_Detailed_Implementation_Plan.pdf"
    pdf.output(str(pdf_path))
    print(f"Implementation Plan PDF successfully generated at: {pdf_path}")

if __name__ == "__main__":
    build_pdf()
