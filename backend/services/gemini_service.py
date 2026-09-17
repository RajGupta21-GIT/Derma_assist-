"""
Derma Assist - Gemini Clinical Triage & Conversational Service
Integrates with Google Gemini API with dermatology system prompts,
medical safety guardrails, red-flag screening, and offline fallback.
"""

import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from backend.config import CLASS_METADATA, BASE_DIR

DERMA_SYSTEM_PROMPT = """You are "Derma Assist", an advanced clinical triage co-pilot designed for a dermatology decision-support platform.
Your role is to assist patients by discussing skin concerns (rashes, lesions, redness, itching, acne, moles, etc.) in an empathetic, rigorous, and clinically informed manner.

Strict Medical Guardrails & Protocol:
1. Non-Prescriptive Language: Never claim "You definitely have [Condition]". Instead use: "The preliminary computer vision features and symptoms are consistent with...", "Clinical findings point toward...", or "Differential possibilities include...".
2. Structured Inquiry: Ask relevant triage questions such as:
   - Duration: How long has this rash/lesion been present?
   - Symptoms: Is there pruritus (itching), burning, tenderness, or pain?
   - Evolution: Has it changed in size, color, or shape? Is it spreading?
   - Triggers: Any new soaps, cosmetics, outdoor exposure, medications, or allergies?
3. Red-Flag Emergency Screening: If symptoms indicate urgent risk:
   - Signs of anaphylaxis (facial/lip swelling, throat tightness, breathing difficulty)
   - Signs of high-risk malignancy (ABCDE criteria: Asymmetry, Border irregularity, Color variegation, rapid growth, spontaneous bleeding)
   - Signs of severe systemic/infectious involvement (high fever with blistering, rapid purple purpura)
   State clearly: "🚨 URGENT MEDICAL ADVICE: Please seek immediate emergency medical care or visit an urgent care clinic."
4. Actionable Home Care: Offer safe, non-medicinal supportive guidance (cool damp compresses, avoiding picking/scratching, hypoallergenic moisturizers, keeping the area dry).
5. Professional Referral: Always outline what type of specialist or examination (e.g., dermoscopy, skin scraping, patch testing, biopsy) a dermatologist would typically perform.
6. Mandatory Legal Disclaimer: Conclude with a brief reminder that Derma Assist is an educational triage assistant, not an in-person clinical diagnosis.
"""

def generate_offline_clinical_response(top_condition: str, user_message: str) -> str:
    """Provides a detailed, structured clinical response when offline or without an API key."""
    meta = CLASS_METADATA.get(top_condition, {
        "display_name": top_condition.replace("_", " ").title(),
        "risk_level": "Moderate",
        "description": "Dermatological presentation requiring clinical correlation.",
        "urgency": "Consult a healthcare provider.",
        "red_flags": "Spreading, fever, or severe pain."
    })

    response = f"""### 🩺 Clinical Triage Analysis

**Observed Presentation:** Preliminary multimodal analysis suggests characteristics consistent with **{meta['display_name']}** (Risk Profile: **{meta['risk_level']}**).

#### Key Clinical Considerations:
- **Condition Overview:** {meta['description']}
- **Recommended Triage Level:** {meta['urgency']}

#### 🔍 Diagnostic Follow-Up Questions:
1. How long has this skin change been present (days, weeks, months)?
2. Are you experiencing active itching, sharp pain, or burning sensation?
3. Have you noticed any spreading, blistering, or oozing?
4. Have you applied any over-the-counter creams or encountered new cosmetics/detergents?

#### 💡 Supportive Home Care:
- Keep the affected area clean and gently pat dry—avoid aggressive scrubbing.
- Use fragrance-free, hypoallergenic moisturizers or cool damp compresses if inflamed.
- Avoid scratching or picking to prevent secondary bacterial infection.

#### ⚠️ Warning Signs & Red Flags:
{meta['red_flags']}

---
*Disclaimer: Derma Assist is a clinical decision-support co-pilot. For definitive diagnosis and prescriptions, consult a licensed dermatologist.*
"""
    return response

class GeminiService:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")
        # Fallback to local credentials file if env not set
        if not self.api_key:
            cred_file = BASE_DIR / "config" / "credentials.json"
            if cred_file.exists():
                try:
                    import json
                    with open(cred_file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        self.api_key = data.get("api_key", "")
                except Exception:
                    pass

        self._client = None
        self._init_client()

    def _init_client(self):
        if not self.api_key:
            self._client = None
            return

        # Attempt modern google.genai SDK
        try:
            from google import genai
            self._client = genai.Client(api_key=self.api_key)
            self._use_modern_sdk = True
            print("[GeminiService] Initialized with Google GenAI SDK (gemini-2.5-flash).")
            return
        except Exception as e:
            print(f"[GeminiService] Note on google.genai: {e}. Trying fallback...")

        # Fallback to legacy google.generativeai SDK
        try:
            import google.generativeai as legacy_genai
            legacy_genai.configure(api_key=self.api_key)
            self._client = legacy_genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction=DERMA_SYSTEM_PROMPT
            )
            self._use_modern_sdk = False
            print("[GeminiService] Initialized with legacy GenerativeModel SDK.")
        except Exception as e:
            print(f"[GeminiService] Warning: Failed to initialize Gemini API client: {e}")
            self._client = None

    def update_api_key(self, new_key: str):
        self.api_key = new_key.strip()
        self._init_client()

    def is_configured(self) -> bool:
        return bool(self.api_key and self._client is not None)

    def chat_consult(self, message: str, history: List[Dict[str, str]] = None, vision_context: Optional[Dict[str, Any]] = None) -> str:
        """
        Executes clinical consultation chat using Gemini 2.5 Flash or intelligent offline fallback.
        """
        top_condition = "eczema"
        top_confidence = "N/A"
        if vision_context and "predictions" in vision_context and len(vision_context["predictions"]) > 0:
            top_pred = vision_context["predictions"][0]
            top_condition = top_pred.get("display_name", top_pred.get("class_name", "eczema"))
            top_confidence = str(top_pred.get("confidence_percentage", "N/A"))

        # Check if active Gemini client is ready
        if not self.is_configured():
            return generate_offline_clinical_response(top_condition, message)

        try:
            # Build contextual prompt with vision analysis and prior history
            context_text = f"[Clinical Presentation Context: Patient has uploaded skin photography. Computer vision & Bayesian synthesis top finding: {top_condition} ({top_confidence} probability).]\n\n"
            
            prompt_parts = [context_text]
            if history:
                for h in history[-6:]:  # Keep recent turns
                    role = h.get("role", "user")
                    text = h.get("text", "")
                    prompt_parts.append(f"{role.capitalize()}: {text}\n")
            
            prompt_parts.append(f"Patient: {message}\nDerma Assist:")
            full_prompt = "".join(prompt_parts)

            if getattr(self, "_use_modern_sdk", False):
                from google.genai import types
                response = self._client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=full_prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=DERMA_SYSTEM_PROMPT,
                        temperature=0.3
                    )
                )
                if response and response.text:
                    return response.text.strip()
            else:
                response = self._client.generate_content(full_prompt)
                if response and response.text:
                    return response.text.strip()

            return generate_offline_clinical_response(top_condition, message)
        except Exception as e:
            print(f"[GeminiService] Error during generation, using fallback: {e}")
            return generate_offline_clinical_response(top_condition, message)

# Singleton instance
gemini_service = GeminiService()
