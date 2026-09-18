"""
Derma Assist - PDF Medical Consultation Report Service (Multimodal Edition)
Generates professional clinical triage summary reports with embedded
skin photos, Grad-CAM heatmaps, questionnaire clinical history,
Bayesian fusion rationale, differential diagnoses, and safety disclaimers.
"""

import os
import io
import base64
import tempfile
from datetime import datetime
from pathlib import Path
from fpdf import FPDF
from fpdf.enums import XPos, YPos
from PIL import Image

class ClinicalReportPDF(FPDF):
    def header(self):
        # Header banner
        self.set_fill_color(16, 118, 110) # Teal-700
        self.rect(0, 0, 210, 25, 'F')
        
        self.set_text_color(255, 255, 255)
        self.set_font("Helvetica", "B", 14)
        self.set_xy(12, 5)
        self.cell(0, 8, "DERMA ASSIST - MULTIMODAL CLINICAL CONSULTATION REPORT", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        
        self.set_font("Helvetica", "", 8.5)
        self.set_xy(12, 14)
        self.cell(0, 5, "Academic Exhibition Medical Technology Edition | Sequential History Intake & Deep Vision", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(8)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 7.5)
        self.set_text_color(120, 120, 120)
        self.cell(0, 4, "CONFIDENTIAL - For Academic Triage Demonstration. Not a definitive medical prescription or diagnosis.", align='C', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.cell(0, 4, f"Page {self.page_no()}", align='C', new_x=XPos.RIGHT, new_y=YPos.TOP)

def generate_pdf_report(
    patient_name: str = "Anonymous Patient",
    patient_age: str = "N/A",
    patient_gender: str = "N/A",
    questionnaire_data: dict = None,
    classification_result: dict = None,
    original_img_base64: str = None
) -> bytes:
    """
    Builds a structured multimodal PDF report and returns the raw bytes.
    """
    pdf = ClinicalReportPDF(orientation='P', unit='mm', format='A4')
    pdf.set_auto_page_break(auto=True, margin=16)
    pdf.add_page()

    now_str = datetime.now().strftime("%B %d, %Y - %H:%M:%S")
    report_id = f"DA-MM-{datetime.now().strftime('%Y%m%d')}-{abs(hash(now_str)) % 10000:04d}"

    # Patient Metadata Box
    pdf.set_fill_color(241, 245, 249) # Slate-100
    pdf.rect(12, 30, 186, 16, 'F')

    pdf.set_text_color(30, 41, 59)
    pdf.set_font("Helvetica", "B", 8.5)
    pdf.set_xy(16, 32)
    pdf.cell(50, 5, f"Report ID: {report_id}", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(55, 5, f"Patient: {patient_name}", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(45, 5, f"Age / Gender: {patient_age} / {patient_gender}", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.set_xy(16, 38)
    pdf.set_font("Helvetica", "", 8)
    pdf.cell(90, 5, f"Generated: {now_str}", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(90, 5, "Intake: Multi-Section Branching History + HAM10000 Vision", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.ln(7)

    # Section 1: Clinical History & Branching Questionnaire Intake
    pdf.set_font("Helvetica", "B", 10.5)
    pdf.set_text_color(15, 118, 110)
    pdf.cell(0, 6, "1. Patient History of Present Illness (Branching Questionnaire)", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_draw_color(15, 118, 110)
    pdf.set_line_width(0.3)
    pdf.line(12, pdf.get_y(), 198, pdf.get_y())
    pdf.ln(2.5)

    if questionnaire_data:
        complaint = questionnaire_data.get("chief_complaint", "N/A").replace("_", " ").title()
        location = questionnaire_data.get("location", "N/A").replace("_", " ").title()
        duration = questionnaire_data.get("duration", "N/A").replace("_", " ").title()
        sensations = ", ".join(questionnaire_data.get("sensations", [])) or "None specified"
        
        pdf.set_font("Helvetica", "", 8)
        pdf.set_text_color(40, 40, 40)
        pdf.cell(60, 4.5, f"Chief Complaint: {complaint}", new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(60, 4.5, f"Anatomical Location: {location}", new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(60, 4.5, f"Duration: {duration}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.cell(0, 4.5, f"Reported Sensations: {sensations}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        # Branch specific findings
        branch = questionnaire_data.get("branch_data", {})
        if branch:
            branch_items = [f"{k.replace('_', ' ').title()}: Yes" for k, v in branch.items() if v]
            if branch_items:
                pdf.set_font("Helvetica", "I", 7.5)
                pdf.multi_cell(0, 4, f"Targeted Diagnostic Criteria Identified: {'; '.join(branch_items)}")
    else:
        pdf.set_font("Helvetica", "", 8)
        pdf.cell(0, 4.5, "Standard dermoscopic scan without structured questionnaire metadata.", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.ln(4)

    # Section 2: Visual Dermatology Analysis & Grad-CAM Explainability
    pdf.set_font("Helvetica", "B", 10.5)
    pdf.set_text_color(15, 118, 110)
    pdf.cell(0, 6, "2. Dermoscopic Imaging & Grad-CAM Visual Explainability", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.line(12, pdf.get_y(), 198, pdf.get_y())
    pdf.ln(3)

    temp_dir = tempfile.mkdtemp()
    orig_path = os.path.join(temp_dir, "orig.png")
    cam_path = os.path.join(temp_dir, "cam.png")

    try:
        if original_img_base64:
            clean_b64 = original_img_base64.split(",")[-1]
            with open(orig_path, "wb") as f:
                f.write(base64.b64decode(clean_b64))
        else:
            Image.new("RGB", (200, 200), (220, 220, 220)).save(orig_path)

        if classification_result and "gradcam" in classification_result:
            cam_b64 = classification_result["gradcam"].get("overlay_base64", "").split(",")[-1]
            with open(cam_path, "wb") as f:
                f.write(base64.b64decode(cam_b64))
        else:
            Image.new("RGB", (200, 200), (220, 220, 220)).save(cam_path)

        img_y = pdf.get_y()
        pdf.image(orig_path, x=22, y=img_y, w=44, h=44)
        pdf.image(cam_path, x=74, y=img_y, w=44, h=44)

        # Beside images: top prediction summary box
        pdf.set_xy(126, img_y)
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_text_color(30, 41, 59)
        pdf.cell(68, 5, "Multimodal Clinical Indication:", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        top_cond = classification_result.get("top_condition", "Indeterminate") if classification_result else "N/A"
        top_conf = classification_result.get("top_confidence", "0%") if classification_result else "0%"
        risk = classification_result.get("overall_risk", "Moderate") if classification_result else "Moderate"

        pdf.set_x(126)
        pdf.set_font("Helvetica", "B", 10.5)
        pdf.set_text_color(16, 118, 110)
        pdf.multi_cell(68, 5, top_cond)

        pdf.set_x(126)
        pdf.set_font("Helvetica", "", 8.5)
        pdf.set_text_color(50, 50, 50)
        pdf.cell(68, 4.5, f"Combined Probability: {top_conf}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        pdf.set_x(126)
        pdf.cell(68, 4.5, f"Triage Risk Category: {risk}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        # Safety override alert if triggered
        if classification_result and classification_result.get("safety_override_triggered"):
            pdf.set_x(126)
            pdf.set_font("Helvetica", "B", 8)
            pdf.set_text_color(185, 28, 28)
            pdf.cell(68, 4.5, "SAFETY OVERRIDE ACTIVE", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        pdf.set_y(img_y + 46)
        pdf.set_font("Helvetica", "I", 7.5)
        pdf.set_text_color(100, 100, 100)
        pdf.cell(0, 4, "Figure: Left = Original Dermoscopic capture; Right = Grad-CAM activation heatmap highlighting spatial focus.", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.ln(2)

    except Exception as e:
        print(f"[ReportService] Image embed error: {e}")
        pdf.set_y(pdf.get_y() + 8)

    # Section 3: 3-Column Visual Infographic Clinical Care Dossier
    pdf.set_font("Helvetica", "B", 10.5)
    pdf.set_text_color(15, 118, 110)
    pdf.cell(0, 6, "3. Visual Care Dossier: Infographic Triage & Action Matrix", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.line(12, pdf.get_y(), 198, pdf.get_y())
    pdf.ln(2.5)

    info_y = pdf.get_y()
    col_w = 59
    col_h = 58

    # Col 1: Root Causes (x=12)
    pdf.set_fill_color(248, 250, 252) # Slate-50
    pdf.set_draw_color(203, 213, 225) # Slate-300
    pdf.rect(12, info_y, col_w, col_h, 'DF')
    pdf.set_fill_color(15, 118, 110)
    pdf.rect(12, info_y, col_w, 6, 'F')
    pdf.set_xy(14, info_y + 1)
    pdf.set_font("Helvetica", "B", 7.5)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(col_w - 4, 4, "COL 1: PRIMARY ROOT CAUSES", border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_xy(14, info_y + 8)
    pdf.set_font("Helvetica", "B", 7)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(col_w - 4, 3.5, "[Contact / Irritants]", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_font("Helvetica", "", 6.5)
    pdf.set_text_color(71, 85, 105)
    pdf.multi_cell(col_w - 4, 2.8, "Chemical detergents, fragrance allergens, or topical irritant exposures.")
    pdf.ln(1)

    pdf.set_x(14)
    pdf.set_font("Helvetica", "B", 7)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(col_w - 4, 3.5, "[Microbial / Fungal]", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_font("Helvetica", "", 6.5)
    pdf.set_text_color(71, 85, 105)
    pdf.multi_cell(col_w - 4, 2.8, "Dermatophyte colonization, Tinea species, or skin barrier dysbiosis.")
    pdf.ln(1)

    pdf.set_x(14)
    pdf.set_font("Helvetica", "B", 7)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(col_w - 4, 3.5, "[Moisture & Barrier]", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_font("Helvetica", "", 6.5)
    pdf.set_text_color(71, 85, 105)
    pdf.multi_cell(col_w - 4, 2.8, "Tropical sweat retention, synthetic friction, or filaggrin barrier defect.")

    # Col 2: Do's & Don'ts Graphic Matrix (x=75)
    pdf.set_fill_color(254, 242, 242) # Red-50 top
    pdf.set_draw_color(248, 113, 113)
    pdf.rect(75, info_y, col_w, 28, 'DF')
    pdf.set_fill_color(220, 38, 38) # Red-600
    pdf.rect(75, info_y, col_w, 5.5, 'F')
    pdf.set_xy(77, info_y + 1)
    pdf.set_font("Helvetica", "B", 7.5)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(col_w - 4, 4, "COL 2A: STRICTLY AVOID", border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_xy(77, info_y + 7)
    pdf.set_font("Helvetica", "", 6.5)
    pdf.set_text_color(153, 27, 27)
    pdf.cell(col_w - 4, 3, "- NO scratching / picking (prevents infection)", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_x(77)
    pdf.cell(col_w - 4, 3, "- NO hot scalding water or harsh soaps", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_x(77)
    pdf.cell(col_w - 4, 3, "- NO unsupervised OTC steroids (Betnovate)", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_x(77)
    pdf.cell(col_w - 4, 3, "- NO tight synthetic / non-breathable cloth", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    # Immediate Care (Green panel bottom of Col 2)
    care_y = info_y + 30
    pdf.set_fill_color(240, 253, 244) # Green-50
    pdf.set_draw_color(74, 222, 128)
    pdf.rect(75, care_y, col_w, 28, 'DF')
    pdf.set_fill_color(22, 163, 74) # Green-600
    pdf.rect(75, care_y, col_w, 5.5, 'F')
    pdf.set_xy(77, care_y + 1)
    pdf.set_font("Helvetica", "B", 7.5)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(col_w - 4, 4, "COL 2B: IMMEDIATE CARE", border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_xy(77, care_y + 7)
    pdf.set_font("Helvetica", "", 6.5)
    pdf.set_text_color(20, 83, 45)
    pdf.cell(col_w - 4, 3, "+ Cool damp compress to calm pruritus", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_x(77)
    pdf.cell(col_w - 4, 3, "+ Ceramide emollient within 3 min of bath", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_x(77)
    pdf.cell(col_w - 4, 3, "+ 100% loose breathable pure cotton", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_x(77)
    pdf.cell(col_w - 4, 3, "+ Keep area aerated and hygiene clean", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    # Col 3: Urgency Meter & Specialist Matching (x=138)
    pdf.set_fill_color(248, 250, 252)
    pdf.set_draw_color(203, 213, 225)
    pdf.rect(138, info_y, col_w, col_h, 'DF')
    pdf.set_fill_color(30, 41, 59) # Slate-800
    pdf.rect(138, info_y, col_w, 6, 'F')
    pdf.set_xy(140, info_y + 1)
    pdf.set_font("Helvetica", "B", 7.5)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(col_w - 4, 4, "COL 3: URGENCY & DIAGNOSTICS", border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    # Urgency Gauge meter representation
    risk_text = classification_result.get("overall_risk", "Moderate") if classification_result else "Moderate"
    is_urgent = "High" in risk_text or (classification_result and classification_result.get("safety_override_triggered"))
    
    gauge_y = info_y + 8
    pdf.set_xy(140, gauge_y)
    pdf.set_font("Helvetica", "B", 7.5)
    if is_urgent:
        pdf.set_text_color(185, 28, 28)
    else:
        pdf.set_text_color(15, 118, 110)
    pdf.cell(col_w - 4, 3.5, f"Triage Priority: {risk_text}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    # Mini Visual Speedometer representation: Green | Amber | Red
    pdf.set_xy(140, gauge_y + 4.5)
    pdf.set_fill_color(34, 197, 94) # Green
    pdf.rect(140, gauge_y + 4.5, 17, 3, 'F')
    pdf.set_fill_color(234, 179, 8) # Amber
    pdf.rect(158, gauge_y + 4.5, 17, 3, 'F')
    pdf.set_fill_color(239, 68, 68) # Red
    pdf.rect(176, gauge_y + 4.5, 17, 3, 'F')

    pdf.set_xy(140, gauge_y + 9)
    pdf.set_font("Helvetica", "B", 7)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(col_w - 4, 3.5, "Target Specialist Procedures:", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_font("Helvetica", "", 6.5)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(col_w - 4, 3, "- Dermoscopy / Epiluminescence exam", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_x(140)
    pdf.cell(col_w - 4, 3, "- KOH Direct Skin Scraping (fungal check)", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_x(140)
    pdf.cell(col_w - 4, 3, "- Histopathological Punch/Excisional Biopsy", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_x(140)
    pdf.cell(col_w - 4, 3, "- Epicutaneous Patch Testing (allergens)", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_y(info_y + col_h + 3)

    # Section 4: Bayesian Differential Diagnosis Breakdown
    pdf.set_font("Helvetica", "B", 10.5)
    pdf.set_text_color(15, 118, 110)
    pdf.cell(0, 6, "4. Bayesian Multimodal Differential Ranking", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.line(12, pdf.get_y(), 198, pdf.get_y())
    pdf.ln(2.5)

    if classification_result and "predictions" in classification_result:
        for idx, pred in enumerate(classification_result["predictions"][:3]):
            pdf.set_font("Helvetica", "B", 8.5)
            pdf.set_text_color(30, 41, 59)
            pdf.cell(85, 4.5, f"#{idx+1} {pred['display_name']}", new_x=XPos.RIGHT, new_y=YPos.TOP)
            pdf.cell(30, 4.5, f"Score: {pred['confidence_percentage']}", new_x=XPos.RIGHT, new_y=YPos.TOP)
            pdf.set_font("Helvetica", "I", 7.5)
            pdf.set_text_color(100, 100, 100)
            pdf.cell(0, 4.5, f"Risk: {pred['risk_level']}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

            pdf.set_font("Helvetica", "", 7.5)
            pdf.set_text_color(70, 70, 70)
            pdf.multi_cell(0, 3.8, f"Clinical context: {pred['description']}")
            pdf.ln(1)
    
    # Rationale note
    if classification_result and "fusion_rationale" in classification_result:
        pdf.set_font("Helvetica", "I", 7.5)
        pdf.set_text_color(15, 118, 110)
        pdf.multi_cell(0, 3.8, f"Multimodal Rationale: {classification_result['fusion_rationale']}")

    pdf.ln(3)

    # Section 5: Mandatory Legal / Clinical Guardrail
    pdf.set_fill_color(254, 242, 242) # Red-50
    pdf.set_draw_color(239, 68, 68)   # Red-500
    pdf.rect(12, pdf.get_y(), 186, 16, 'DF')
    pdf.set_xy(15, pdf.get_y() + 2)
    pdf.set_font("Helvetica", "B", 8)
    pdf.set_text_color(153, 27, 27)
    pdf.cell(0, 4, "MANDATORY CLINICAL & ETHICAL DISCLAIMER:", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_font("Helvetica", "", 7)
    pdf.set_text_color(127, 29, 29)
    pdf.multi_cell(180, 3.2, "Derma Assist is an academic computer science prototype designed for triage education. It does not provide medical diagnosis, pathology reports, or treatment orders. An in-person clinical exam with dermoscopy and biopsy by a licensed dermatologist is required for definitive diagnosis.")

    return bytes(pdf.output())
