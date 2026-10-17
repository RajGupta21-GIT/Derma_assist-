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


def test_pdf_report_robust_predictions_and_aliases():
    """Verify that /report and /api/report accept predictions without display_name, handle alias paths, and include gradcam."""
    img_bytes = create_test_image_bytes()
    b64_str = f"data:image/jpeg;base64,{base64.b64encode(img_bytes).decode('utf-8')}"

    payload = {
        "patient_name": "Rajiv Sharma",
        "patient_age": "45",
        "patient_gender": "Male",
        "classification_result": {
            "top_condition": "Eczema (Atopic Dermatitis)",
            "top_confidence": "85.0%",
            "overall_risk": "Moderate",
            "predictions": [
                {
                    "condition": "Eczema",
                    "class_name": "eczema",
                    "confidence": 0.85,
                    "probability": 85.0,
                    "risk_level": "Moderate"
                },
                {
                    "condition": "Contact Dermatitis",
                    "class_name": "contact_dermatitis",
                    "confidence": 0.10,
                    "probability": 10.0,
                    "risk_level": "Moderate"
                }
            ]
        },
        "original_img_base64": b64_str,
        "gradcam_image_b64": b64_str,
        "chat_summary": "Triage consultation completed successfully."
    }

    # Test both /api/report and the alias /report
    for route in ["/api/report", "/report"]:
        resp = client.post(route, json=payload)
        assert resp.status_code == 200
        assert resp.headers["content-type"] == "application/pdf"
        assert resp.content.startswith(b"%PDF")
        assert len(resp.content) > 1000


def test_synthesize_endpoint_with_questionnaire():
    import json
    img_bytes = create_test_image_bytes()
    b64_str = f"data:image/jpeg;base64,{base64.b64encode(img_bytes).decode('utf-8')}"
    
    questionnaire = {
        "chief_complaint": "red_rash",
        "fitzpatrick_tone": "type_iv",
        "location": "groin_folds",
        "duration": "subacute",
        "sensations": ["itch"],
        "branch_data": {
            "annular_ring": True,
            "tropical_humidity": True,
            "otc_steroid_use": True
        },
        "prior_treatments": "Betnovate-N cream used for 1 week"
    }

    response = client.post(
        "/api/synthesize",
        data={
            "image_base64": b64_str,
            "questionnaire_json": json.dumps(questionnaire)
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "top_condition" in data
    assert "predictions" in data
    assert "gradcam" in data
    assert "fusion_rationale" in data
    # Due to annular ring, groin folds, tropical humidity, and Betnovate, Tinea/Fungal should rank #1
    assert "Fungal" in data["top_condition"] or "Tinea" in data["top_condition"]
    # Check that Tinea Incognito / steroid alert was triggered
    assert any("steroid" in alert.lower() or "tinea incognito" in alert.lower() for alert in data.get("red_flag_alerts", []))


def test_non_skin_image_rejection_classify():
    # White document image (100% white pixels)
    white_img = Image.new("RGB", (128, 128), color=(255, 255, 255))
    buf = io.BytesIO()
    white_img.save(buf, format="JPEG")
    
    response = client.post(
        "/api/classify",
        files={"file": ("doc.jpg", buf.getvalue(), "image/jpeg")}
    )
    assert response.status_code == 400
    data = response.json()
    assert data["is_valid_skin"] is False
    assert "No human skin tissue detected" in data["error"]


def test_non_skin_image_rejection_synthesize():
    # Blue graphic image (0% skin chrominance)
    blue_img = Image.new("RGB", (128, 128), color=(0, 0, 255))
    buf = io.BytesIO()
    blue_img.save(buf, format="JPEG")
    b64_str = f"data:image/jpeg;base64,{base64.b64encode(buf.getvalue()).decode('utf-8')}"
    
    response = client.post(
        "/api/synthesize",
        data={"image_base64": b64_str, "questionnaire_json": "{}"}
    )
    assert response.status_code == 400
    data = response.json()
    assert data["is_valid_skin"] is False
    assert "No human skin tissue detected" in data["error"]


def test_monotonic_confidence_ordering():
    import json
    img_bytes = create_test_image_bytes()
    b64_str = f"data:image/jpeg;base64,{base64.b64encode(img_bytes).decode('utf-8')}"
    
    # Questionnaire triggering safety override
    q_data = {
        "chief_complaint": "mole_spot",
        "sensations": ["bleeding"],
        "branch_data": {"bleeding": True, "abcde_evolution": True},
        "red_flags": []
    }
    response = client.post(
        "/api/synthesize",
        data={"image_base64": b64_str, "questionnaire_json": json.dumps(q_data)}
    )
    assert response.status_code == 200
    data = response.json()
    preds = data["predictions"]
    assert len(preds) == 3
    # Enforce strictly monotonic confidence: Rank 1 > Rank 2 > Rank 3
    assert preds[0]["confidence"] > preds[1]["confidence"]
    assert preds[1]["confidence"] > preds[2]["confidence"]
    assert data["safety_override_triggered"] is True


def test_systemic_emergency_prioritization():
    import json
    img_bytes = create_test_image_bytes()
    b64_str = f"data:image/jpeg;base64,{base64.b64encode(img_bytes).decode('utf-8')}"
    
    # Systemic emergency: facial angioedema with high fever
    q_data = {
        "chief_complaint": "mole_spot",
        "red_flags": ["facial_swelling", "high_fever"]
    }
    response = client.post(
        "/api/synthesize",
        data={"image_base64": b64_str, "questionnaire_json": json.dumps(q_data)}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["safety_override_triggered"] is True
    # Rank 1 must be elevated emergency and not benign mole
    assert data["top_class"] != "benign_nevi"
    preds = data["predictions"]
    assert preds[0]["confidence"] > preds[1]["confidence"] > preds[2]["confidence"]


def test_flashcard_metadata_in_synthesis():
    import json
    img_bytes = create_test_image_bytes()
    b64_str = f"data:image/jpeg;base64,{base64.b64encode(img_bytes).decode('utf-8')}"
    
    q_data = {
        "chief_complaint": "itchy_rash",
        "location": "groin_folds",
        "branch_data": {"annular_ring": True, "sweat_moisture": True}
    }
    response = client.post(
        "/api/synthesize",
        data={"image_base64": b64_str, "questionnaire_json": json.dumps(q_data)}
    )
    assert response.status_code == 200
    data = response.json()
    
    # 1. Top-level metadata presence
    assert "root_causes" in data and len(data["root_causes"]) >= 2
    assert "care_matrix" in data
    assert "dos" in data["care_matrix"] and len(data["care_matrix"]["dos"]) >= 2
    assert "donts" in data["care_matrix"] and len(data["care_matrix"]["donts"]) >= 2
    assert "specialist_procedures" in data and len(data["specialist_procedures"]) >= 2

    # 2. Every prediction candidate has its own metadata for interactive exploration
    for pred in data["predictions"]:
        assert "root_causes" in pred and len(pred["root_causes"]) >= 2
        assert "care_matrix" in pred
        assert "dos" in pred["care_matrix"] and len(pred["care_matrix"]["dos"]) >= 2
        assert "donts" in pred["care_matrix"] and len(pred["care_matrix"]["donts"]) >= 2
        assert "specialist_procedures" in pred and len(pred["specialist_procedures"]) >= 2



