from PIL import Image
from backend.models.classifier import classifier
from backend.services.fusion_service import compute_multimodal_synthesis

print("Classes:", classifier.classes)

# Load user uploaded screenshot
img_path = r"C:\Users\HP\.gemini\antigravity\brain\5c84e3c9-baf1-4a93-aeaa-e125ca5b2cdd\.user_uploaded\media_1789628863474.png"
full_img = Image.open(img_path)
print("Screenshot size:", full_img.size)

# In the screenshot, let's crop the actual lesion image from the left box:
# The screenshot is 1152 x 648 or similar
w, h = full_img.size
# Crop approximately the dermoscopic lesion area in the screenshot
# The box is roughly around x: 230 to 420, y: 380 to 600 in relative terms
lesion_crop = full_img.crop((int(w * 0.20), int(h * 0.38), int(w * 0.37), int(h * 0.61)))
lesion_crop.save("scratch_lesion.png")

# Run vision prediction
res = classifier.predict(lesion_crop)
print("\n--- PURE VISION PREDICTION ---")
print("Top condition:", res["top_condition"])
for p in res["predictions"]:
    print(f"  {p['display_name']}: {p['confidence_percentage']}")

# Now test with correct melanoma answers:
correct_q = {
    "chief_complaint": "mole_spot",
    "location": "trunk",
    "duration": "subacute",
    "sensations": ["itch"],
    "branch_data": {
        "abcde_asymmetry": True,
        "abcde_border": True,
        "abcde_color": True,
        "abcde_diameter": True,
        "abcde_evolution": True,
        "bleeding": False
    },
    "red_flags": []
}
syn_correct = compute_multimodal_synthesis(res["predictions"], correct_q)
print("\n--- MULTIMODAL SYNTHESIS (WITH PROPER MELANOMA ANSWERS) ---")
print("Top condition:", syn_correct["top_condition"])
for p in syn_correct["predictions"]:
    print(f"  {p['display_name']}: {p['confidence_percentage']}")

# Now test with user's random answers from their screenshot:
# Notice in screenshot: "Patient chief complaint focuses on an erythematous rash. Flexural crease localization (inner elbows, behind knees) aligns with Atopic Dermatitis."
wrong_q = {
    "chief_complaint": "red_rash",
    "location": "arms_hands",
    "distribution": "single",
    "duration": "subacute",
    "sensations": ["itch"],
    "branch_data": {
        "flexural_folds": True,
        "flushing_spicy_heat": True
    },
    "red_flags": []
}
syn_wrong = compute_multimodal_synthesis(res["predictions"], wrong_q)
print("\n--- MULTIMODAL SYNTHESIS (WITH RASH / ACNE RANDOM ANSWERS) ---")
print("Top condition:", syn_wrong["top_condition"])
for p in syn_wrong["predictions"]:
    print(f"  {p['display_name']}: {p['confidence_percentage']}")
