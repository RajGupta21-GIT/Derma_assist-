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
from PIL import Image

class ClinicalReportPDF(FPDF):
    def header(self):
        # Header banner
        self.set_fill_color(16, 118, 110) # Teal-700
        self.rect(0, 0, 210, 25, 'F')
        
        self.set_text_color(255, 255, 255)
        self.set_font("Helvetica", "B", 14)
        self.set_xy(12, 5)
        self.cell(0, 8, "DERMA ASSIST - MULTIMODAL CLINICAL CONSULTATION REPORT", ln=True)
        
        self.set_font("Helvetica", "", 8.5)
        self.set_xy(12, 14)
        self.cell(0, 5, "Academic Exhibition Medical Technology Edition | Sequential History Intake & Deep Vision", ln=True)
        self.ln(8)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 7.5)
        self.set_text_color(120, 120, 120)
        self.cell(0, 4, "CONFIDENTIAL - For Academic Triage Demonstration. Not a definitive medical prescription or diagnosis.", 0, 1, 'C')
        self.cell(0, 4, f"Page {self.page_no()}", 0, 0, 'C')

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
    pdf.cell(50, 5, f"Report ID: {report_id}", 0, 0)
    pdf.cell(55, 5, f"Patient: {patient_name}", 0, 0)
    pdf.cell(45, 5, f"Age / Gender: {patient_age} / {patient_gender}", 0, 0)
    pdf.set_xy(16, 38)
    pdf.set_font("Helvetica", "", 8)
    pdf.cell(90, 5, f"Generated: {now_str}", 0, 0)
    pdf.cell(90, 5, "Intake: Multi-Section Branching History + HAM10000 Vision", 0, 1)

    pdf.ln(7)

    # Section 1: Clinical History & Branching Questionnaire Intake
    pdf.set_font("Helvetica", "B", 10.5)
    pdf.set_text_color(15, 118, 110)
    pdf.cell(0, 6, "1. Patient History of Present Illness (Branching Questionnaire)", ln=True)
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
        pdf.cell(60, 4.5, f"Chief Complaint: {complaint}", 0, 0)
        pdf.cell(60, 4.5, f"Anatomical Location: {location}", 0, 0)
        pdf.cell(60, 4.5, f"Duration: {duration}", 0, 1)
        pdf.cell(0, 4.5, f"Reported Sensations: {sensations}", 0, 1)

        # Branch specific findings
        branch = questionnaire_data.get("branch_data", {})
        if branch:
            branch_items = [f"{k.replace('_', ' ').title()}: Yes" for k, v in branch.items() if v]
            if branch_items:
                pdf.set_font("Helvetica", "I", 7.5)
                pdf.multi_cell(0, 4, f"Targeted Diagnostic Criteria Identified: {'; '.join(branch_items)}")
    else:
        pdf.set_font("Helvetica", "", 8)
        pdf.cell(0, 4.5, "Standard dermoscopic scan without structured questionnaire metadata.", ln=True)

    pdf.ln(4)

    # Section 2: Visual Dermatology Analysis & Grad-CAM Explainability
    pdf.set_font("Helvetica", "B", 10.5)
    pdf.set_text_color(15, 118, 110)
    pdf.cell(0, 6, "2. Dermoscopic Imaging & Grad-CAM Visual Explainability", ln=True)
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
        pdf.cell(68, 5, "Multimodal Clinical Indication:", ln=True)

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
        pdf.cell(68, 4.5, f"Combined Probability: {top_conf}", ln=True)

        pdf.set_x(126)
        pdf.cell(68, 4.5, f"Triage Risk Category: {risk}", ln=True)

        # Safety override alert if triggered
        if classification_result and classification_result.get("safety_override_triggered"):
            pdf.set_x(126)
            pdf.set_font("Helvetica", "B", 8)
            pdf.set_text_color(185, 28, 28)
            pdf.cell(68, 4.5, "SAFETY OVERRIDE ACTIVE", ln=True)

        pdf.set_y(img_y + 46)
        pdf.set_font("Helvetica", "I", 7.5)
        pdf.set_text_color(100, 100, 100)
        pdf.cell(0, 4, "Figure: Left = Original Dermoscopic capture; Right = Grad-CAM activation heatmap highlighting spatial focus.", ln=True)
        pdf.ln(2)

    except Exception as e:
        print(f"[ReportService] Image embed error: {e}")
        pdf.set_y(pdf.get_y() + 8)

    # Section 3: Bayesian Differential Diagnosis Breakdown
    pdf.set_font("Helvetica", "B", 10.5)
    pdf.set_text_color(15, 118, 110)
    pdf.cell(0, 6, "3. Bayesian Multimodal Differential Ranking", ln=True)
    pdf.line(12, pdf.get_y(), 198, pdf.get_y())
    pdf.ln(2.5)

    if classification_result and "predictions" in classification_result:
        for idx, pred in enumerate(classification_result["predictions"][:3]):
            pdf.set_font("Helvetica", "B", 8.5)
            pdf.set_text_color(30, 41, 59)
            pdf.cell(85, 4.5, f"#{idx+1} {pred['display_name']}", 0, 0)
            pdf.cell(30, 4.5, f"Score: {pred['confidence_percentage']}", 0, 0)
            pdf.set_font("Helvetica", "I", 7.5)
            pdf.set_text_color(100, 100, 100)
            pdf.cell(0, 4.5, f"Risk: {pred['risk_level']}", ln=True)

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

    # Section 4: Mandatory Legal / Clinical Guardrail
    pdf.set_fill_color(254, 242, 242) # Red-50
    pdf.set_draw_color(239, 68, 68)   # Red-500
    pdf.rect(12, pdf.get_y(), 186, 16, 'DF')
    pdf.set_xy(15, pdf.get_y() + 2)
    pdf.set_font("Helvetica", "B", 8)
    pdf.set_text_color(153, 27, 27)
    pdf.cell(0, 4, "MANDATORY CLINICAL & ETHICAL DISCLAIMER:", ln=True)
    pdf.set_font("Helvetica", "", 7)
    pdf.set_text_color(127, 29, 29)
    pdf.multi_cell(180, 3.2, "Derma Assist is an academic computer science prototype designed for triage education. It does not provide medical diagnosis, pathology reports, or treatment orders. An in-person clinical exam with dermoscopy and biopsy by a licensed dermatologist is required for definitive diagnosis.")

    return bytes(pdf.output())
