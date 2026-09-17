"""
Derma Assist - ML Pipeline Dataset Builder
Sets up directory structure for 8 target dermatology conditions:
1. eczema (Atopic Dermatitis)
2. contact_dermatitis (Allergic Contact Dermatitis & Urticaria)
3. fungal_infections (Tinea / Ringworm)
4. psoriasis (Plaque Psoriasis & Lichen Planus)
5. acne_rosacea (Acne Vulgaris & Rosacea)
6. viral_eruptions (Herpes Zoster / Shingles / Cold Sores)
7. benign_nevi (Common Melanocytic Moles)
8. melanoma_suspicious (Malignant Melanoma & Dysplastic Lesions)
"""

import os
import random
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

CLASSES = [
    "eczema",
    "contact_dermatitis",
    "fungal_infections",
    "psoriasis",
    "acne_rosacea",
    "viral_eruptions",
    "benign_nevi",
    "melanoma_suspicious"
]

CLASS_DISPLAY_NAMES = {
    "eczema": "Eczema (Atopic Dermatitis)",
    "contact_dermatitis": "Contact Dermatitis / Urticaria",
    "fungal_infections": "Fungal Infection (Tinea / Ringworm)",
    "psoriasis": "Psoriasis / Lichen Planus",
    "acne_rosacea": "Acne & Rosacea",
    "viral_eruptions": "Viral Eruption (Herpes Zoster / Shingles)",
    "benign_nevi": "Benign Melanocytic Nevus (Mole)",
    "melanoma_suspicious": "Melanoma & Suspicious Lesions"
}

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
TRAIN_DIR = DATA_DIR / "train"
VAL_DIR = DATA_DIR / "val"
DEMO_DIR = DATA_DIR / "demo_samples"

def create_procedural_skin_sample(class_name: str, width: int = 256, height: int = 256) -> Image.Image:
    """
    Generates a realistic clinical visual pattern corresponding to dermatological features.
    Used for starter dataset and demo showcase stability.
    """
    # Base skin tone variation
    base_tones = [
        (240, 205, 180),
        (225, 185, 150),
        (205, 160, 125),
        (180, 130, 95),
        (140, 95, 65)
    ]
    base_r, base_g, base_b = random.choice(base_tones)
    img = Image.new("RGB", (width, height), (base_r, base_g, base_b))
    draw = ImageDraw.Draw(img)

    # Add subtle skin texture noise
    for _ in range(300):
        nx = random.randint(0, width - 1)
        ny = random.randint(0, height - 1)
        delta = random.randint(-12, 12)
        r = max(0, min(255, base_r + delta))
        g = max(0, min(255, base_g + delta))
        b = max(0, min(255, base_b + delta))
        draw.point((nx, ny), fill=(r, g, b))

    cx, cy = width // 2 + random.randint(-15, 15), height // 2 + random.randint(-15, 15)

    if class_name == "eczema":
        # Diffuse erythematous scaly patch with lichenification
        patch_r = min(255, base_r + 45)
        patch_g = max(0, base_g - 40)
        patch_b = max(0, base_b - 35)
        for radius in range(70, 10, -5):
            draw.ellipse(
                [cx - radius + random.randint(-8, 8), cy - radius + random.randint(-8, 8),
                 cx + radius + random.randint(-8, 8), cy + radius + random.randint(-8, 8)],
                fill=(patch_r, patch_g, patch_b)
            )
        # Scaly white scratch/flaking marks
        for _ in range(40):
            sx = cx + random.randint(-55, 55)
            sy = cy + random.randint(-55, 55)
            draw.line([sx, sy, sx + random.randint(-12, 12), sy + random.randint(-8, 8)],
                      fill=(245, 235, 230), width=random.choice([1, 2]))

    elif class_name == "contact_dermatitis":
        # Irregular allergic erythematous plaques and welts
        w_r = min(255, base_r + 60)
        w_g = max(0, base_g - 60)
        w_b = max(0, base_b - 50)
        for _ in range(6):
            ox = cx + random.randint(-40, 40)
            oy = cy + random.randint(-40, 40)
            rad_x = random.randint(25, 45)
            rad_y = random.randint(18, 35)
            draw.ellipse([ox - rad_x, oy - rad_y, ox + rad_x, oy + rad_y], fill=(w_r, w_g, w_b))

    elif class_name == "fungal_infections":
        # Tinea corporis: annular circular erythema with raised scaly active border and central clearing
        ring_r = min(255, base_r + 55)
        ring_g = max(0, base_g - 50)
        ring_b = max(0, base_b - 45)
        # Outer active border
        draw.ellipse([cx - 65, cy - 65, cx + 65, cy + 65], fill=(ring_r, ring_g, ring_b))
        # Central clearing
        clear_r = min(255, base_r + 15)
        clear_g = max(0, base_g - 10)
        clear_b = max(0, base_b - 10)
        draw.ellipse([cx - 45, cy - 45, cx + 45, cy + 45], fill=(clear_r, clear_g, clear_b))

    elif class_name == "psoriasis":
        # Well-demarcated salmon-pink plaque with thick silvery-white scales
        draw.ellipse([cx - 60, cy - 55, cx + 60, cy + 55], fill=(220, 90, 110))
        for _ in range(80):
            sx = cx + random.randint(-45, 45)
            sy = cy + random.randint(-40, 40)
            draw.ellipse([sx - 4, sy - 3, sx + 4, sy + 3], fill=(245, 245, 250))

    elif class_name == "acne_rosacea":
        # Inflammatory erythematous papules and yellow pustules
        draw.ellipse([cx - 60, cy - 60, cx + 60, cy + 60], fill=(min(255, base_r + 35), max(0, base_g - 35), max(0, base_b - 30)))
        for _ in range(12):
            px = cx + random.randint(-45, 45)
            py = cy + random.randint(-45, 45)
            draw.ellipse([px - 8, py - 8, px + 8, py + 8], fill=(210, 45, 45))
            if random.random() > 0.4:
                draw.ellipse([px - 3, py - 3, px + 3, py + 3], fill=(250, 245, 185))

    elif class_name == "viral_eruptions":
        # Clustered dermatomal vesicles
        draw.ellipse([cx - 55, cy - 55, cx + 55, cy + 55], fill=(215, 65, 75))
        for _ in range(18):
            vx = cx + random.randint(-40, 40)
            vy = cy + random.randint(-40, 40)
            draw.ellipse([vx - 6, vy - 6, vx + 6, vy + 6], fill=(235, 210, 210))
            draw.ellipse([vx - 3, vy - 3, vx + 1, vy + 1], fill=(255, 255, 255))

    elif class_name == "benign_nevi":
        # Symmetrical, well-circumscribed brown/tan round macule/papule
        mole_color = (85, 50, 30)
        draw.ellipse([cx - 32, cy - 30, cx + 32, cy + 30], fill=mole_color)

    elif class_name == "melanoma_suspicious":
        # Asymmetry, Irregular border, Color variation
        for _ in range(5):
            poly_points = [
                (cx - 45 + random.randint(-15, 15), cy - 40 + random.randint(-15, 15)),
                (cx + 10 + random.randint(-10, 15), cy - 50 + random.randint(-10, 10)),
                (cx + 50 + random.randint(-10, 15), cy - 10 + random.randint(-15, 15)),
                (cx + 35 + random.randint(-10, 15), cy + 45 + random.randint(-10, 15)),
                (cx - 20 + random.randint(-10, 15), cy + 50 + random.randint(-10, 10)),
                (cx - 50 + random.randint(-15, 15), cy + 10 + random.randint(-10, 15))
            ]
            draw.polygon(poly_points, fill=random.choice([(30, 25, 25), (65, 30, 20), (20, 20, 30), (140, 40, 40)]))

    # Apply Gaussian smoothing for clinical organic appearance
    img = img.filter(ImageFilter.GaussianBlur(radius=1.8))
    return img

def build_dataset(samples_per_class: int = 25):
    """Creates the dataset folders and populates starter & demo samples."""
    print("Initializing Derma Assist Dataset structure...")
    for c in CLASSES:
        (TRAIN_DIR / c).mkdir(parents=True, exist_ok=True)
        (VAL_DIR / c).mkdir(parents=True, exist_ok=True)
    DEMO_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Generating curated starter training/validation images ({len(CLASSES)} categories)...")
    for c in CLASSES:
        # Train images
        for i in range(samples_per_class):
            img = create_procedural_skin_sample(c)
            img.save(TRAIN_DIR / c / f"{c}_train_{i+1:03d}.jpg", quality=92)

        # Validation images
        for i in range(max(5, samples_per_class // 4)):
            img = create_procedural_skin_sample(c)
            img.save(VAL_DIR / c / f"{c}_val_{i+1:03d}.jpg", quality=92)

        # 1-Click Demo Showcase sample for booth testing
        demo_img = create_procedural_skin_sample(c)
        demo_img.save(DEMO_DIR / f"demo_{c}.jpg", quality=95)

    print("Dataset setup completed successfully!")
    print(f"Train directory: {TRAIN_DIR}")
    print(f"Val directory:   {VAL_DIR}")
    print(f"Demo directory:  {DEMO_DIR}")

if __name__ == "__main__":
    build_dataset(samples_per_class=30)
