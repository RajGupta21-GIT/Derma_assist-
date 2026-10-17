"""
Derma Assist - FastAPI Main Application Server (Multimodal Clinical Edition)
Exposes REST endpoints for sequential branching intake, deep vision classification,
Bayesian multimodal synthesis, Grad-CAM explainability, Gemini triage, and PDF dossiers.
"""

import io
import json
import base64
from typing import Optional, List, Dict, Any
from pathlib import Path
from PIL import Image

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from backend.config import (
    CORS_ORIGINS,
    CLASSES,
    CLASS_METADATA,
    BASE_DIR
)
from backend.models.classifier import classifier
from backend.services.fusion_service import compute_multimodal_synthesis
from backend.services.gemini_service import gemini_service
from backend.services.report_service import generate_pdf_report

app = FastAPI(
    title="Derma Assist Multimodal Clinical API",
    description="Authentic Dermatology Co-Pilot: Sequential Intake, HAM10000 Deep Vision, Bayesian Fusion & Gemini Triage",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class ChatRequest(BaseModel):
    message: Optional[str] = None
    messages: Optional[List[Dict[str, Any]]] = None
    history: Optional[List[Dict[str, str]]] = []
    vision_context: Optional[Dict[str, Any]] = None
    analysis_context: Optional[Dict[str, Any]] = None
    questionnaire_context: Optional[Dict[str, Any]] = None
    api_key: Optional[str] = None

class ApiKeyUpdate(BaseModel):
    api_key: str

class ReportRequest(BaseModel):
    patient_name: Optional[str] = "Anonymous Patient"
    patient_age: Optional[str] = "N/A"
    patient_gender: Optional[str] = "N/A"
    patient_info: Optional[Dict[str, Any]] = None
    questionnaire_data: Optional[Dict[str, Any]] = None
    classification_result: Optional[Dict[str, Any]] = None
    analysis_data: Optional[Dict[str, Any]] = None
    original_img_base64: Optional[str] = None
    original_image_b64: Optional[str] = None
    gradcam_image_b64: Optional[str] = None
    chat_summary: Optional[str] = None

class ClassifyJsonRequest(BaseModel):
    image_base64: Optional[str] = None
    image: Optional[str] = None

# Routes
@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "Derma Assist Multimodal Backend",
        "version": "2.5.0",
        "model_loaded": classifier.is_loaded,
        "classes_count": len(CLASSES),
        "class_count": len(CLASSES),
        "supported_classes": CLASSES,
        "gemini_configured": gemini_service.is_configured()
    }

@app.get("/api/classes")
def get_classes():
    return {
        "classes": CLASSES,
        "metadata": CLASS_METADATA
    }

_DEMO_SAMPLES_CACHE = None

def _parse_image_input(file_bytes: Optional[bytes] = None, b64_str: Optional[str] = None) -> Image.Image:
    """Fast unified parser for upload file bytes or base64 data."""
    if file_bytes:
        try:
            return Image.open(io.BytesIO(file_bytes)).convert("RGB")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid image file.")
    if b64_str:
        try:
            clean_b64 = b64_str.split(",")[-1].strip()
            return Image.open(io.BytesIO(base64.b64decode(clean_b64))).convert("RGB")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid base64 image data.")
    raise HTTPException(status_code=400, detail="No image provided.")

def _gatekeeper_rejection(error_msg: Optional[str] = None) -> JSONResponse:
    msg = error_msg or "No human skin tissue detected in the uploaded image. Please upload a clear clinical photograph of the affected skin area."
    return JSONResponse(status_code=400, content={"is_valid_skin": False, "error": msg, "detail": msg})

@app.get("/api/demo-samples")
def get_demo_samples(refresh: bool = False):
    """Returns curated demo samples for offline exhibition & triage testing (Cached in RAM with refresh support)."""
    global _DEMO_SAMPLES_CACHE
    if not refresh and _DEMO_SAMPLES_CACHE is not None and _DEMO_SAMPLES_CACHE.get("samples"):
        return _DEMO_SAMPLES_CACHE

    samples = []
    demo_dir = Path(__file__).resolve().parent / "demo_samples"
    sample_files = [
        ("sample_eczema.jpg", "eczema", "Eczema (Atopic Dermatitis)", "Moderate"),
        ("sample_fungal.jpg", "fungal_infections", "Fungal Infection (Tinea / Ringworm)", "Mild-Moderate"),
        ("sample_psoriasis.jpg", "psoriasis", "Psoriasis / Lichen Planus", "Moderate"),
        ("sample_acne.jpg", "acne_rosacea", "Acne Vulgaris & Rosacea", "Mild"),
        ("sample_melanoma.jpg", "melanoma_suspicious", "Suspicious Lesion / Melanoma", "High / Urgent Attention"),
    ]
    for fn, cid, title, risk in sample_files:
        fpath = demo_dir / fn
        if fpath.exists():
            with open(fpath, "rb") as f:
                b64 = base64.b64encode(f.read()).decode("utf-8")
            samples.append({
                "id": cid,
                "title": title,
                "risk_level": risk,
                "image_base64": f"data:image/jpeg;base64,{b64}"
            })
    if samples:
        _DEMO_SAMPLES_CACHE = {"samples": samples}
    return {"samples": samples}

@app.post("/api/classify")
async def classify_image(file: Optional[UploadFile] = File(None), image_base64: Optional[str] = Form(None)):
    """Pure deep vision classification + Grad-CAM heatmap."""
    file_bytes = await file.read() if file else None
    pil_img = _parse_image_input(file_bytes=file_bytes, b64_str=image_base64)

    try:
        results = classifier.predict(pil_img)
        if not results.get("is_valid_skin", True):
            return _gatekeeper_rejection(results.get("error"))

        if results.get("predictions"):
            results["top_probability"] = round(float(results["predictions"][0]["confidence"]) * 100, 1)
            results["differential_diagnoses"] = results["predictions"]
        if results.get("gradcam"):
            results["gradcam_base64"] = results["gradcam"].get("overlay_base64", "")
        return results
    except Exception as e:
        print(f"[Classify Error] {e}")
        raise HTTPException(status_code=500, detail=f"Diagnostic model inference failed: {str(e)}")

@app.post("/api/classify-json")
async def classify_image_json(req: ClassifyJsonRequest):
    """JSON wrapper for image classification."""
    b64_data = req.image_base64 or req.image
    if not b64_data:
        raise HTTPException(status_code=400, detail="No image_base64 provided.")
    try:
        pil_img = _parse_image_input(b64_str=b64_data)
        results = classifier.predict(pil_img)
        if not results.get("is_valid_skin", True):
            return _gatekeeper_rejection(results.get("error"))

        if results.get("predictions"):
            results["top_probability"] = round(float(results["predictions"][0]["confidence"]) * 100, 1)
            results["differential_diagnoses"] = results["predictions"]
        if results.get("gradcam"):
            results["gradcam_base64"] = results["gradcam"].get("overlay_base64", "")
        return results
    except Exception as e:
        print(f"[Classify-JSON Error] {e}")
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")

@app.post("/api/synthesize")
async def synthesize_multimodal(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    questionnaire_json: Optional[str] = Form(None)
):
    """
    Multimodal synthesis endpoint:
    Runs deep vision model & Grad-CAM, then computes Bayesian fusion with questionnaire answers.
    """
    file_bytes = await file.read() if file else None
    pil_img = _parse_image_input(file_bytes=file_bytes, b64_str=image_base64)

    questionnaire_dict = {}
    if questionnaire_json:
        try:
            questionnaire_dict = json.loads(questionnaire_json)
        except Exception as e:
            print(f"[Synthesize] Questionnaire parse error: {e}")

    try:
        vision_res = classifier.predict(pil_img)
        if not vision_res.get("is_valid_skin", True):
            return _gatekeeper_rejection(vision_res.get("error"))

        multimodal_res = compute_multimodal_synthesis(vision_res["predictions"], questionnaire_dict)
        multimodal_res["is_valid_skin"] = True
        multimodal_res["gradcam"] = vision_res["gradcam"]
        multimodal_res["inference_time_ms"] = vision_res["inference_time_ms"]
        multimodal_res["vision_predictions"] = vision_res["predictions"]
        multimodal_res["vision_engine"] = vision_res.get("vision_engine", "PyTorch Deep Convolutional Vision")
        multimodal_res["melanin_metrics"] = vision_res.get("melanin_metrics")

        return multimodal_res
    except Exception as e:
        print(f"[Synthesize Error] {e}")
        raise HTTPException(status_code=500, detail=f"Multimodal synthesis failed: {str(e)}")

@app.post("/api/chat")
async def chat_consult(req: ChatRequest):
    """
    Dermatological triage conversation powered by Gemini API or clinical fallback.
    Takes full multimodal context (vision + questionnaire).
    """
    if req.api_key:
        gemini_service.update_api_key(req.api_key)

    # Extract user message
    user_msg = req.message
    if not user_msg and req.messages:
        last_m = req.messages[-1]
        user_msg = last_m.get("content") or last_m.get("text") or ""
    user_msg = user_msg or "Hello, please provide clinical guidance on my skin presentation."

    # Extract history
    history = req.history or []
    if not history and req.messages and len(req.messages) > 1:
        for m in req.messages[:-1]:
            history.append({
                "role": m.get("role", "user"),
                "text": m.get("content") or m.get("text") or ""
            })

    # Context
    v_ctx = req.vision_context or req.analysis_context

    reply = gemini_service.chat_consult(
        message=user_msg,
        history=history,
        vision_context=v_ctx,
        questionnaire_context=req.questionnaire_context
    )

    # Emergency red flag check on user query or context
    lower_query = user_msg.lower()
    has_red_flags = any(rf in lower_query for rf in ["fever", "bleeding", "rapidly spreading", "rapidly spread", "angioedema", "facial swelling", "difficulty breathing", "severe pain"])
    red_flag_alert = (
        "URGENT CLINICAL WARNING: Reported symptoms (fever, bleeding, or rapid spread) indicate an emergency or high-risk presentation. Seek immediate medical care."
        if has_red_flags else None
    )

    return {
        "reply": reply,
        "has_red_flags": has_red_flags,
        "red_flag_alert": red_flag_alert,
        "is_configured": gemini_service.is_configured()
    }

@app.post("/api/update-api-key")
@app.post("/update-api-key")
async def update_key(req: ApiKeyUpdate):
    gemini_service.update_api_key(req.api_key)
    return {
        "status": "success",
        "configured": gemini_service.is_configured()
    }

@app.post("/api/report")
@app.post("/report")
async def generate_report(req: ReportRequest):
    """
    Generates and returns the downloadable PDF Medical Consultation Report with clinical history.
    """
    try:
        p_name = req.patient_name or "Anonymous Patient"
        p_age = req.patient_age
        p_gender = req.patient_gender
        if req.patient_info:
            p_age = req.patient_info.get("age", p_age) or p_age
            p_gender = req.patient_info.get("gender", p_gender) or p_gender

        class_res = req.classification_result or req.analysis_data or {}
        orig_img = req.original_img_base64 or req.original_image_b64
        cam_img = req.gradcam_image_b64

        pdf_bytes = generate_pdf_report(
            patient_name=p_name,
            patient_age=p_age or "N/A",
            patient_gender=p_gender or "N/A",
            questionnaire_data=req.questionnaire_data or {},
            classification_result=class_res,
            original_img_base64=orig_img,
            gradcam_img_base64=cam_img
        )
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=Derma_Assist_Multimodal_Report.pdf"}
        )
    except Exception as e:
        print(f"[Report Error] {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate clinical PDF: {str(e)}")

@app.get("/api/reports/individual-pdf")
async def download_individual_pdf():
    """Serves the 4-page individual capstone report for Raj Gupta."""
    pdf_path = BASE_DIR / "Raj_Gupta_Individual_Project_Report.pdf"
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="Individual report PDF not found.")
    return FileResponse(
        path=str(pdf_path),
        filename="Raj_Gupta_Individual_Project_Report.pdf",
        media_type="application/pdf"
    )

@app.get("/api/reports/optimization-pdf")
async def download_optimization_pdf():
    """Serves the technical optimization and architecture report."""
    pdf_path = BASE_DIR / "Derma_Assist_Optimization_Report.pdf"
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="Optimization report PDF not found.")
    return FileResponse(
        path=str(pdf_path),
        filename="Derma_Assist_Optimization_Report.pdf",
        media_type="application/pdf"
    )

# Production Static Serving of React Frontend
frontend_dist = BASE_DIR / "frontend" / "dist"
if frontend_dist.exists():
    if (frontend_dist / "assets").exists():
        app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")
    if (frontend_dist / "images").exists():
        app.mount("/images", StaticFiles(directory=str(frontend_dist / "images")), name="images")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            raise HTTPException(status_code=404, detail="API route not found")
        target_file = frontend_dist / full_path
        if target_file.exists() and target_file.is_file():
            return FileResponse(str(target_file))
        return FileResponse(str(frontend_dist / "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
