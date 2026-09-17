import io
import base64
import pytest
from PIL import Image
from fastapi.testclient import TestClient
from backend.main import app
from backend.config import CLASS_NAMES

client = TestClient(app)


def create_test_image_bytes():
    img = Image.new("RGB", (128, 128), color=(220, 180, 160))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["class_count"] == 8
    assert len(data["supported_classes"]) == 8


def test_demo_samples_endpoint():
    response = client.get("/api/demo-samples")
    assert response.status_code == 200
    data = response.json()
    assert "samples" in data
    assert len(data["samples"]) >= 5
    first = data["samples"][0]
    assert "id" in first
    assert "title" in first
    assert "image_base64" in first
    assert first["image_base64"] is not None


def test_classify_endpoint():
    img_bytes = create_test_image_bytes()
    response = client.post(
        "/api/classify",
        files={"file": ("test.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert "top_condition" in data
    assert "top_probability" in data
    assert "differential_diagnoses" in data
    assert len(data["differential_diagnoses"]) == 3
    assert "gradcam_base64" in data
    assert data["gradcam_base64"].startswith("data:image/png;base64,")


def test_classify_json_endpoint():
    img_bytes = create_test_image_bytes()
    b64_str = f"data:image/jpeg;base64,{base64.b64encode(img_bytes).decode('utf-8')}"
    response = client.post(
        "/api/classify-json",
        json={"image_base64": b64_str}
    )
    assert response.status_code == 200
    data = response.json()
    assert "top_condition" in data
    assert "differential_diagnoses" in data


def test_clinical_chat_routine():
    payload = {
        "messages": [
            {"role": "user", "content": "I have had dry scaly skin on my elbows for 2 weeks. It is slightly itchy."}
        ],
        "analysis_context": {
            "top_condition": "Psoriasis & Lichen Planus",
            "top_probability": 68.5,
            "risk_level": "Moderate",
            "differential_diagnoses": [
                {"class_name": "Psoriasis & Lichen Planus", "probability": 68.5}
            ]
        }
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert len(data["reply"]) > 20
    assert data["has_red_flags"] is False


def test_clinical_chat_red_flag_alert():
    payload = {
        "messages": [
            {"role": "user", "content": "My lesion is rapidly spreading with severe fever and bleeding"}
        ],
        "analysis_context": {
            "top_condition": "Suspicious Lesions & Melanoma",
            "top_probability": 85.0,
            "risk_level": "High (Urgent)",
            "differential_diagnoses": [
                {"class_name": "Suspicious Lesions & Melanoma", "probability": 85.0}
            ]
        }
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert data["has_red_flags"] is True
    assert "URGENT" in data["red_flag_alert"]


def test_pdf_report_export():
    img_bytes = create_test_image_bytes()
    b64_str = f"data:image/jpeg;base64,{base64.b64encode(img_bytes).decode('utf-8')}"

    payload = {
        "analysis_data": {
            "top_condition": "Eczema / Atopic Dermatitis",
            "top_probability": 78.4,
            "risk_level": "Moderate",
            "is_urgent": False,
            "differential_diagnoses": [
                {
                    "rank": 1,
                    "class_name": "Eczema / Atopic Dermatitis",
                    "probability": 78.4,
                    "risk_level": "Moderate",
                    "urgency": "Routine care",
                    "presentation": "Dry, pruritic patches",
                    "first_aid": "Apply emollient"
                },
                {
                    "rank": 2,
                    "class_name": "Contact Dermatitis & Urticaria",
                    "probability": 14.2,
                    "risk_level": "Moderate",
                    "urgency": "Assess triggers",
                    "presentation": "Allergic redness",
                    "first_aid": "Cool compress"
                },
                {
                    "rank": 3,
                    "class_name": "Fungal Infections (Tinea/Ringworm)",
                    "probability": 7.4,
                    "risk_level": "Low",
                    "urgency": "Outpatient treatment",
                    "presentation": "Annular scaly ring",
                    "first_aid": "Keep dry"
                }
            ]
        },
        "original_image_b64": b64_str,
        "gradcam_image_b64": b64_str,
        "chat_summary": "PATIENT: Skin is dry and itchy.\n\nASSISTANT: Recommended emollient cream.",
        "patient_info": {
            "age": "24",
            "gender": "Female"
        }
    }

    response = client.post("/api/report", json=payload)
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    content = response.content
    assert content.startswith(b"%PDF")
    assert len(content) > 1000
