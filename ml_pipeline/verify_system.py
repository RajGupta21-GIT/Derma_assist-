import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from PIL import Image
from backend.models.classifier import get_classifier

from backend.models.gradcam import generate_gradcam_base64

def test_all_samples():
    classifier = get_classifier()
    demo_dir = Path("backend/demo_samples")

    print(f"Model loaded: {classifier.is_trained_weights}")
    for sample in sorted(demo_dir.glob("*.jpg")):
        img = Image.open(sample)
        result = classifier.predict(img)
        gradcam = generate_gradcam_base64(classifier.model, img)
        top = result["top_condition"]
        prob = result["top_probability"]
        risk = result["risk_level"]
        print(f"Sample: {sample.name:22s} | Top: {top:32s} ({prob:4.1f}%) | Risk: {risk:14s} | Grad-CAM: {len(gradcam)} bytes")

if __name__ == "__main__":
    test_all_samples()
