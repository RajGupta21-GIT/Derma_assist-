# 🩺 Derma Assist — Multimodal Clinical Dermatology AI

> **Group Project Exhibition Edition**  
> An end-to-end intelligent dermatology co-pilot marrying deep computer vision (lesion classification & Grad-CAM visual heatmaps) with a conversational clinical triage dialogue agent powered by Google Gemini AI.

---

## 🌟 Key Exhibition Highlights

1. **Multimodal Clinical Triage**:
   - Analyzes skin images across **8 distinct categories**: *Eczema, Contact Dermatitis/Urticaria, Fungal Infections (Ringworm), Psoriasis, Acne & Rosacea, Viral Eruptions (Shingles), Benign Nevi (Moles), and Suspicious Melanoma*.
2. **Visual Explainability (Grad-CAM)**:
   - Eliminates the AI 'black box' by highlighting exact inflammatory borders and pigment irregularities with a Jet colormap overlay.
3. **Conversational Clinical Co-Pilot (Gemini AI)**:
   - Evaluates symptoms, asks structured follow-up questions (duration, itchiness, pain, spreading), and screens for emergency red flags.
4. **1-Click Exhibition Demo Showcase**:
   - Pre-loaded clinical test cases for instant evaluator demonstrations.
5. **Live Webcam Capture & File Upload**:
   - Real-time viewfinder with HTML5 canvas snapshot capabilities alongside drag-and-drop file upload.
6. **Downloadable PDF Consultation Summary**:
   - Generates official clinical referral reports with embedded Grad-CAM overlays and differential diagnosis breakdowns.

---

## 🚀 Quick Start

### 1. Launch with Single-Click (Windows)
Simply double-click:
```bat
run_derma_assist.bat
```
or run via PowerShell:
```powershell
.\run_derma_assist.ps1
```
This automatically starts both the FastAPI backend and React frontend and opens `http://localhost:5173` in your browser.

---

### 2. Manual Startup

#### Backend:
```bash
# Optional: Set your Gemini API key (or configure it in the UI settings)
set GEMINI_API_KEY=your_key_here

python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

#### Frontend:
```bash
cd frontend
npm run dev
```

Visit **`http://localhost:5173`** to access the application.

---

## 📁 Project Architecture

```
Derma_assist/
├── backend/
│   ├── config.py             # App configuration, clinical metadata & risk profiles
│   ├── main.py               # FastAPI server exposing REST endpoints
│   ├── models/
│   │   ├── classifier.py     # Multi-class vision classifier engine
│   │   ├── gradcam.py        # Grad-CAM visual attention heatmap generator
│   │   └── derma_model.joblib # Serialized model weights
│   └── services/
│       ├── gemini_service.py # Gemini clinical prompt & triage dialogue engine
│       └── report_service.py # PDF medical consultation report generator (FPDF2)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Header, exhibition modal & API key settings
│   │   │   ├── DisclaimerModal.jsx  # Mandatory first-use medical disclaimer
│   │   │   ├── ImageUploader.jsx    # Drag-and-drop, webcam capture & demo cards
│   │   │   ├── AnalysisResults.jsx  # Grad-CAM side-by-side viewer & differential bars
│   │   │   ├── TriageChat.jsx       # Clinical interview chat with quick symptom chips
│   │   │   └── ReportModal.jsx      # PDF report download modal
│   │   ├── services/api.js          # REST client communicating with FastAPI
│   │   ├── App.jsx                  # Main dashboard layout
│   │   └── main.jsx
│   └── package.json
├── ml_pipeline/
│   ├── dataset_builder.py    # Sets up 8-class dataset and generates demo samples
│   └── train_model.py        # Model training script with confusion matrix plotting
├── docs/
│   ├── EXHIBITION_GUIDE.md   # Presentation pitch, viva questions & defense guide
│   ├── confusion_matrix.png  # Validation confusion matrix plot
│   └── training_curves.png   # Accuracy and loss convergence plot
├── run_derma_assist.bat      # 1-Click Windows batch launcher
├── run_derma_assist.ps1      # 1-Click PowerShell launcher
└── README.md
```

---

## 🔬 Model Retraining & Fine-Tuning

To regenerate or fine-tune the model weights on custom images:
```bash
python ml_pipeline/dataset_builder.py
python ml_pipeline/train_model.py
```
This updates `backend/models/derma_model.joblib` and refreshes the evaluation plots in `docs/`.

---

## ⚠️ Medical Safety & Ethical Disclaimer

Derma Assist is an academic project prototype built for group demonstration and triage assistance. It does **NOT** substitute for professional medical advice, clinical diagnosis, or prescriptions. Always consult a certified dermatologist or emergency care physician for persistent, expanding, or painful skin conditions.
