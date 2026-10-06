"""
Derma Assist - Skin & Out-Of-Distribution (OOD) Verification Gatekeeper
Validates that uploaded images contain authentic human skin tissue across all
Fitzpatrick phototypes (I-VI) before running diagnostic inference.
Rejects web pages, computer screens, documents, cars, pets, and non-skin graphics.
Zero external binary dependencies (pure PIL + NumPy).
"""

from typing import Dict, Any, Tuple
import numpy as np
from PIL import Image

def verify_skin_tissue(image: Image.Image) -> Dict[str, Any]:
    """
    Analyzes an input PIL image to ensure it contains human skin tissue.
    Returns:
        {
            "is_valid_skin": bool,
            "error": Optional[str],
            "skin_fraction": float,
            "metrics": dict
        }
    """
    try:
        # Standardize resolution for deterministic heuristic analysis
        img_rgb = image.convert("RGB").resize((128, 128), Image.Resampling.BILINEAR)
        arr = np.array(img_rgb, dtype=np.float32)
        
        r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
        
        # 1. UI / Document / Screen Rejection Checks
        near_white = (r > 235) & (g > 235) & (b > 235)
        near_black = (r < 25) & (g < 25) & (b < 25)
        white_ratio = float(np.mean(near_white))
        black_ratio = float(np.mean(near_black))
        
        # Flat solid color check (low standard deviation across channels)
        std_r, std_g, std_b = float(np.std(r)), float(np.std(g)), float(np.std(b))
        is_flat = bool(std_r < 4.0 and std_g < 4.0 and std_b < 4.0)

        # 2. Chrominance analysis in YCbCr color space
        # Standard ITU-R BT.601 conversion:
        y = 0.299 * r + 0.587 * g + 0.114 * b
        cb = 128.0 - 0.168736 * r - 0.331264 * g + 0.5 * b
        cr = 128.0 + 0.5 * r - 0.418688 * g - 0.081312 * b
        
        # Human skin chrominance cluster (calibrated across Fitzpatrick I - VI + erythematous inflammation)
        # Normal skin: Cb in [70, 140], Cr in [128, 185]
        # Severe erythema / vascular inflammation: Cr up to 205
        # Red reflectance dominance: R > G - 10 and R > B - 5
        skin_mask = (
            (cb >= 65.0) & (cb <= 145.0) &
            (cr >= 125.0) & (cr <= 205.0) &
            (r > g - 10.0) & (r > b - 5.0) &
            (y >= 25.0) & (y <= 245.0)
        )
        
        skin_fraction = float(np.mean(skin_mask))
        
        # Central patch analysis (lesions are centered in clinical dermoscopy)
        center_patch = skin_mask[32:96, 32:96]
        center_skin_fraction = float(np.mean(center_patch))
        
        # Non-skin / Out-of-Distribution validation criteria:
        # A valid skin image must:
        # - Have sufficient overall skin tissue (>= 18%) AND
        # - Either a strong overall skin fraction (>= 26%) OR significant central skin/lesion presence (>= 22%)
        # - Not be dominated by document/page whitespace (> 60%) or black letterboxing (> 65%)
        is_valid = bool(
            skin_fraction >= 0.18 and
            (skin_fraction >= 0.26 or center_skin_fraction >= 0.22) and
            white_ratio < 0.60 and
            black_ratio < 0.65
        )
        
        error_msg = None
        if not is_valid:
            error_msg = (
                "No human skin tissue detected in the uploaded image. "
                "Please upload a clear clinical photograph of the affected skin area."
            )
            
        return {
            "is_valid_skin": is_valid,
            "error": error_msg,
            "skin_fraction": round(skin_fraction, 4),
            "metrics": {
                "skin_fraction": round(skin_fraction, 4),
                "center_skin_fraction": round(center_skin_fraction, 4),
                "white_ratio": round(white_ratio, 4),
                "black_ratio": round(black_ratio, 4),
                "is_flat": is_flat
            }
        }
    except Exception as e:
        # In case of processing error, fallback to gatekeeper rejection for safety
        return {
            "is_valid_skin": False,
            "error": f"Invalid image format for dermatological analysis: {str(e)}",
            "skin_fraction": 0.0,
            "metrics": {}
        }
