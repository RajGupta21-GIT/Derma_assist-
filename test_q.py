from PIL import Image
from backend.models.classifier import classifier
from backend.services.fusion_service import compute_multimodal_synthesis

img = Image.open("scratch_lesion.png")
vision_res = classifier.predict(img)
print("Vision predictions:", [(p['class_name'], p['confidence']) for p in vision_res['predictions']])

# What if the user selected:
# chief_complaint: 'facial_flare' or 'red_rash'?
# In the screenshot text:
# "Patient chief complaint focuses on an erythematous rash. Flexural crease localization (inner elbows, behind knees) aligns with Atopic Dermatitis."
# Wait, why did the screenshot show Acne 69.0%, Eczema 22.8%, Contact Dermatitis 8.3%?
# Let's check what vision_res was when the user uploaded the image from their browser!
# In their browser, what image did they upload?
# Let's check if the user uploaded an image where pure vision returned something else, or if the multiplier wiped out melanoma:
for cc in ["red_rash", "facial_flare"]:
    for flex in [True, False]:
        q = {
            "chief_complaint": cc,
            "location": "face" if cc == "facial_flare" else "arms_hands",
            "branch_data": {"flexural_folds": flex},
            "red_flags": []
        }
        res = compute_multimodal_synthesis(vision_res["predictions"], q)
        print(f"\nCC={cc}, flex={flex}:")
        for p in res["predictions"]:
            print(f"  {p['display_name']}: {p['confidence_percentage']}")
