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
    message: str
    history: Optional[List[Dict[str, str]]] = []
    vision_context: Optional[Dict[str, Any]] = None
    questionnaire_context: Optional[Dict[str, Any]] = None
    api_key: Optional[str] = None

class ApiKeyUpdate(BaseModel):
    api_key: str

class ReportRequest(BaseModel):
    patient_name: Optional[str] = "Anonymous Patient"
    patient_age: Optional[str] = "N/A"
    patient_gender: Optional[str] = "N/A"
    questionnaire_data: Optional[Dict[str, Any]] = None
    classification_result: Optional[Dict[str, Any]] = None
    original_img_base64: Optional[str] = None

# Routes
@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "Derma Assist Multimodal Backend",
        "version": "2.0.0",
        "model_loaded": classifier.is_loaded,
        "classes_count": len(CLASSES),
        "gemini_configured": gemini_service.is_configured()
    }

@app.get("/api/classes")
def get_classes():
    return {
        "classes": CLASSES,
        "metadata": CLASS_METADATA
    }

@app.post("/api/classify")
async def classify_image(file: Optional[UploadFile] = File(None), image_base64: Optional[str] = Form(None)):
    """Pure deep vision classification + Grad-CAM heatmap."""
    pil_img = None

    if file:
        contents = await file.read()
        try:
            pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid image file.")
    elif image_base64:
        try:
            clean_b64 = image_base64.split(",")[-1]
            raw_bytes = base64.b64decode(clean_b64)
            pil_img = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid base64 image data.")
    else:
        raise HTTPException(status_code=400, detail="No image provided.")

    try:
        results = classifier.predict(pil_img)
        return results
    except Exception as e:
        print(f"[Classify Error] {e}")
        raise HTTPException(status_code=500, detail=f"Diagnostic model inference failed: {str(e)}")

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
    pil_img = None
    if file:
        contents = await file.read()
        try:
            pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid image file.")
    elif image_base64:
        try:
            clean_b64 = image_base64.split(",")[-1]
            raw_bytes = base64.b64decode(clean_b64)
            pil_img = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid base64 image data.")
    else:
        raise HTTPException(status_code=400, detail="No image provided for multimodal evaluation.")

    # Parse questionnaire data
    questionnaire_dict = {}
    if questionnaire_json:
        try:
            questionnaire_dict = json.loads(questionnaire_json)
        except Exception as e:
            print(f"[Synthesize] Questionnaire parse error: {e}")

    try:
        # 1. Run Deep Vision model & Grad-CAM
        vision_res = classifier.predict(pil_img)

        # 2. Compute Bayesian Multimodal Fusion with safety overrides
        multimodal_res = compute_multimodal_synthesis(vision_res["predictions"], questionnaire_dict)

        # 3. Attach Grad-CAM visual explainability and execution metrics
        multimodal_res["gradcam"] = vision_res["gradcam"]
        multimodal_res["inference_time_ms"] = vision_res["inference_time_ms"]
        multimodal_res["vision_predictions"] = vision_res["predictions"]

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

    reply = gemini_service.chat_consult(
        message=req.message,
        history=req.history,
        vision_context=req.vision_context
    )

    return {
        "reply": reply,
        "is_configured": gemini_service.is_configured()
    }

@app.post("/api/update-api-key")
async def update_key(req: ApiKeyUpdate):
    gemini_service.update_api_key(req.api_key)
    return {
        "status": "success",
        "configured": gemini_service.is_configured()
    }

@app.post("/api/report")
async def generate_report(req: ReportRequest):
    """
    Generates and returns the downloadable PDF Medical Consultation Report with clinical history.
    """
    try:
        pdf_bytes = generate_pdf_report(
            patient_name=req.patient_name or "Anonymous Patient",
            patient_age=req.patient_age or "N/A",
            patient_gender=req.patient_gender or "N/A",
            questionnaire_data=req.questionnaire_data or {},
            classification_result=req.classification_result or {},
            original_img_base64=req.original_img_base64
        )
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=Derma_Assist_Multimodal_Report.pdf"}
        )
    except Exception as e:
        print(f"[Report Error] {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate clinical PDF: {str(e)}")

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
