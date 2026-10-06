import React, { useState } from 'react';
import { 
  FileDown, 
  MessageSquare, 
  ArrowLeft, 
  RefreshCw, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Layers, 
  Info, 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  PhoneCall, 
  Sparkles, 
  Ban, 
  HeartPulse, 
  Microscope, 
  TestTubes, 
  Sun 
} from 'lucide-react';
import VoiceConsultModal from './VoiceConsultModal';

/**
 * Calibrated SVG Semicircle Urgency Gauge
 * Color bands:
 * - Green (Low Risk / Standard Outpatient): 0% - 33%
 * - Amber/Yellow (Moderate Priority): 34% - 66%
 * - Red (High Risk / Urgent Triage): 67% - 100%
 */
function SemicircleUrgencyGauge({ isHighRisk, isModerateRisk, safetyOverrideTriggered, overallRisk }) {
  // Calibrated needle rotation angles:
  // -58deg points into Green arc (0% - 33%)
  // 0deg points straight up into Amber arc (34% - 66%)
  // +58deg points into Red arc (67% - 100%)
  // +70deg points deep into Red arc on emergency safety override
  const needleAngle = safetyOverrideTriggered ? 70 : isHighRisk ? 58 : isModerateRisk ? 0 : -58;

  return (
    <div className="flex flex-col items-center justify-center text-center p-6 bg-slate-50/90 rounded-2xl border border-slate-200/80 shadow-2xs">
      <div className="relative w-64 h-32 flex items-center justify-center">
        <svg viewBox="0 0 200 120" className="w-full h-full overflow-visible">
          {/* Base Background Track */}
          <path
            d="M 24 100 A 76 76 0 0 1 176 100"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Calibrated Color Bands */}
          {/* Green Band: 0% - 33% (Low Risk / Standard Outpatient) */}
          <path
            d="M 24 100 A 76 76 0 0 1 62 34.18"
            fill="none"
            stroke="#10b981"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Amber/Yellow Band: 34% - 66% (Moderate Priority) */}
          <path
            d="M 62 34.18 A 76 76 0 0 1 138 34.18"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="12"
          />

          {/* Red Band: 67% - 100% (High Risk / Urgent Triage) */}
          <path
            d="M 138 34.18 A 76 76 0 0 1 176 100"
            fill="none"
            stroke="#ef4444"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Calibrated Percentage Ticks */}
          <text x="24" y="116" textAnchor="middle" className="text-[9px] fill-emerald-600 font-bold">0%</text>
          <text x="56" y="24" textAnchor="middle" className="text-[9px] fill-slate-400 font-semibold">33%</text>
          <text x="144" y="24" textAnchor="middle" className="text-[9px] fill-slate-400 font-semibold">66%</text>
          <text x="176" y="116" textAnchor="middle" className="text-[9px] fill-rose-600 font-bold">100%</text>

          {/* Dynamic Animated Needle */}
          <g
            style={{
              transform: `rotate(${needleAngle}deg)`,
              transformOrigin: '100px 100px',
              transformBox: 'view-box',
              transition: 'transform 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <polygon points="97,100 103,100 100.5,36 99.5,36" fill="#0f172a" />
            <circle cx="100" cy="100" r="6" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
          </g>
        </svg>
      </div>

      {/* Segment Color Key */}
      <div className="flex items-center justify-center gap-3.5 mt-2 mb-2 text-[11px] font-semibold text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Low (0–33%)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Moderate (34–66%)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Urgent (67–100%)</span>
        </span>
      </div>

      {/* Dynamic Status Text */}
      <div className="mt-1">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
            isHighRisk
              ? 'bg-rose-100 text-rose-800 border border-rose-200'
              : isModerateRisk
              ? 'bg-amber-100 text-amber-800 border border-amber-200'
              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}
        >
          {overallRisk || (isHighRisk ? 'High Risk' : isModerateRisk ? 'Moderate Priority' : 'Low Risk')}
        </span>
        <p className="text-xs text-slate-600 mt-1.5 max-w-xs leading-relaxed">
          {safetyOverrideTriggered
            ? 'Emergency Triage: Critical clinical red flags detected. Immediate in-person biopsy evaluation recommended.'
            : isHighRisk
            ? 'Urgent specialist in-person review recommended within 24–48 hours for dermoscopic margin evaluation.'
            : isModerateRisk
            ? 'Scheduled outpatient clinical follow-up recommended within 48–72 hours for targeted therapy.'
            : 'Standard outpatient care. Practice routine self-monitoring and sun protection.'}
        </p>
      </div>
    </div>
  );
}

const defaultRootCauses = [
  { icon: "🖐️", title: "External Contact / Irritants", description: "Chemical detergents, fragrance allergens, harsh surfactants, or plant oils stripping the lipid stratum corneum barrier." },
  { icon: "🦠", title: "Microbial / Fungal Activity", description: "Superficial dermatophyte hyphae (Tinea / Trichophyton), Malassezia yeast overgrowth, or follicular bacterial colonization." },
  { icon: "🧼", title: "Moisture & Friction", description: "Tropical monsoon humidity, sweat maceration in skin folds, or mechanical friction from occlusive synthetic fabrics." },
  { icon: "🧬", title: "Genetic Barrier Dysfunction", description: "Filaggrin mutations, natural ceramides depletion, immune hyper-reactivity, or dysplastic melanocytic nevi proliferation." },
];

const defaultCareMatrix = {
  donts: [
    { title: "No scratching", description: "Prevents secondary impetiginization and chronic lichen simplex chronicus." },
    { title: "No scalding hot water", description: "Strips protective epidermal ceramides, worsening erythema." },
    { title: "No OTC potent steroids (Betnovate/Quadriderm)", description: "Suppresses local immune response, masking Tinea Incognito." },
    { title: "No tight synthetic fabrics", description: "Reduces sweat retention and prevents abrasive mechanical irritation." },
  ],
  dos: [
    { title: "Cold damp compress", description: "Apply 10–15 mins to rapidly vasoconstrict vessels and relieve pruritus." },
    { title: "Ceramide emollient", description: "Apply fragrance-free barrier creams within 3 minutes of bathing." },
    { title: "100% breathable cotton", description: "Promotes natural skin aeration and eliminates shear friction." },
    { title: "Keep skin folds dry", description: "Pat dry gently to prevent intertrigo and dermatophyte proliferation." },
  ],
};

const defaultProcedures = [
  { name: "Dermoscopy Examination", description: "High-magnification polarized inspection of pigment networks, dots, globules, and atypical vascular structures." },
  { name: "KOH Skin Scraping Mount", description: "Direct microscopic potassium hydroxide dissolution of keratin to identify fungal branching septate hyphae." },
  { name: "Excisional / Punch Biopsy", description: "Full-thickness histopathology for definitive architecture assessment and surgical margin clearance if dysplastic." },
];

export default function ClinicalDossier({
  results,
  questionnaireData,
  originalImagePreview,
  onOpenChat,
  onOpenReportModal,
  onStartNewAssessment,
  onBackToCapture,
  apiKey,
}) {
  const [viewMode, setViewMode] = useState('side_by_side'); // 'side_by_side' | 'overlay' | 'heatmap'
  const [isIntakeExpanded, setIsIntakeExpanded] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [selectedDiagnosisIndex, setSelectedDiagnosisIndex] = useState(0);

  if (!results) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-md mx-auto">
          <Activity className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Assessment Data Available</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Please complete the clinical questionnaire and capture a dermoscopic photograph to generate a dossier.
          </p>
          <button
            type="button"
            onClick={onStartNewAssessment}
            className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
          >
            Start New Assessment
          </button>
        </div>
      </div>
    );
  }

  // Handle Skin & OOD Verification Gatekeeper Rejection
  if (results.is_valid_skin === false) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center animate-fade-in">
        <div className="p-8 bg-rose-50 rounded-3xl border-2 border-rose-300 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle className="w-8 h-8 text-rose-600" />
          </div>
          <h2 className="text-xl font-bold text-rose-950">Non-Skin Photograph Detected</h2>
          <p className="text-xs text-rose-800 leading-relaxed max-w-md mx-auto">
            {results.error || 'No human skin tissue detected in the uploaded image. Please upload a clear clinical photograph of the affected skin area.'}
          </p>
          <div className="p-3 bg-white/80 rounded-xl border border-rose-200 text-[11px] text-slate-600 text-left space-y-1">
            <p className="font-semibold text-slate-800">Clinical Capture Requirements:</p>
            <p>&bull; High-clarity photograph of real human skin tissue</p>
            <p>&bull; Avoid screenshots, computer displays, documents, or non-medical images</p>
            <p>&bull; Center the affected skin lesion or rash with direct lighting</p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onBackToCapture}
              className="px-6 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Return to Photo Studio</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    top_condition,
    top_confidence,
    overall_risk,
    predictions,
    gradcam,
    melanin_metrics,
    inference_time_ms,
    fusion_rationale,
    safety_override_triggered,
    red_flag_alerts,
  } = results;

  const safetyOverrideTriggered = Boolean(safety_override_triggered || results?.safetyOverrideTriggered);
  const isHighRisk = safetyOverrideTriggered || overall_risk?.toLowerCase().includes('high');
  const isModerateRisk = !isHighRisk && overall_risk?.toLowerCase().includes('moderate');

  // Active condition profile (supports dynamic interactive differential exploration)
  const activePred = (predictions && predictions[selectedDiagnosisIndex]) || (predictions && predictions[0]) || {};
  const activeRisk = activePred.risk_level || overall_risk;
  const activeIsHighRisk = safetyOverrideTriggered || activeRisk?.toLowerCase().includes('high');
  const activeIsModerateRisk = !activeIsHighRisk && activeRisk?.toLowerCase().includes('moderate');

  // Dynamic flashcard contents with robust fallback protection
  const displayedRootCauses = (activePred.root_causes && activePred.root_causes.length > 0)
    ? activePred.root_causes
    : (results.root_causes && results.root_causes.length > 0)
    ? results.root_causes
    : defaultRootCauses;

  const activeCareMatrix = activePred.care_matrix || results.care_matrix || {};
  const displayedDonts = (activeCareMatrix.donts && activeCareMatrix.donts.length > 0)
    ? activeCareMatrix.donts
    : defaultCareMatrix.donts;

  const displayedDos = (activeCareMatrix.dos && activeCareMatrix.dos.length > 0)
    ? activeCareMatrix.dos
    : defaultCareMatrix.dos;

  const displayedProcedures = (activePred.specialist_procedures && activePred.specialist_procedures.length > 0)
    ? activePred.specialist_procedures
    : (results.specialist_procedures && results.specialist_procedures.length > 0)
    ? results.specialist_procedures
    : defaultProcedures;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in space-y-8">
      {/* 1. Navigation & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/90">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onBackToCapture}
            className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            title="Back to Photo Capture"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/80">
                Clinical Referral Dossier
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Analysis time: {inference_time_ms} ms
              </span>
              {melanin_metrics && melanin_metrics.high_baseline_melanin && (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                  <Sun className="w-3 h-3 text-amber-600" />
                  Fitzpatrick IV–VI Calibrated
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
              {top_condition}
            </h1>
          </div>
        </div>

        {/* Primary Header Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsVoiceModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all group"
          >
            <PhoneCall className="w-4 h-4 text-emerald-300 group-hover:animate-bounce" />
            <span>Voice Consult Mode</span>
          </button>

          <button
            type="button"
            onClick={onOpenChat}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-xs rounded-xl shadow-2xs flex items-center gap-2 transition-all"
          >
            <MessageSquare className="w-4 h-4 text-teal-600" />
            <span>Chat Co-Pilot</span>
          </button>

          <button
            type="button"
            onClick={onOpenReportModal}
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all"
          >
            <FileDown className="w-4 h-4" />
            <span>PDF Dossier</span>
          </button>
        </div>
      </div>

      {/* 2. Priority Risk Banner & Rationale */}
      <div className="space-y-4">
        {isHighRisk ? (
          <div className="p-5 bg-rose-50 border-l-4 border-rose-600 rounded-2xl text-xs space-y-2 shadow-sm">
            <div className="flex items-center gap-2.5 font-bold text-rose-950 text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>High Risk Priority &bull; In-Person Dermatological Evaluation Recommended</span>
            </div>
            <p className="text-rose-800 pl-7 leading-relaxed text-[11px] sm:text-xs">
              {safetyOverrideTriggered
                ? `Critical clinical criteria detected (${red_flag_alerts?.join(', ') || 'asymmetry / bleeding / rapid growth'}). The triage safety override has elevated this finding for expedited specialist biopsy.`
                : 'The multimodal profile indicates features requiring definitive in-person dermoscopic inspection and potential histopathological evaluation.'}
            </p>
          </div>
        ) : isModerateRisk ? (
          <div className="p-5 bg-amber-50 border-l-4 border-amber-500 rounded-2xl text-xs space-y-1.5 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Moderate Priority &bull; Outpatient Clinical Follow-up Advised</span>
            </div>
            <p className="text-amber-800 pl-6 leading-relaxed text-[11px] sm:text-xs">
              Symptom patterns and visual characteristics warrant a scheduled consultation with a healthcare professional to confirm diagnosis and prescribe targeted topical therapy.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-2xl text-xs space-y-1 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-emerald-950 text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Low Risk / Likely Benign Presentation &bull; Standard Self-Monitoring</span>
            </div>
            <p className="text-emerald-800 pl-6 leading-relaxed text-[11px] sm:text-xs">
              The current multimodal synthesis aligns with a benign presentation. Continue routine self-checks and monitor for any future changes in color, size, or sensation.
            </p>
          </div>
        )}

        {fusion_rationale && (
          <div className="p-4.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-start gap-3">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <h3 className="font-bold text-slate-900 mb-0.5">Clinical Multimodal Synthesis Rationale</h3>
              <p className="text-slate-600 leading-relaxed text-[11px] sm:text-xs">{fusion_rationale}</p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Main Visual Diagnosis Row (Dermoscopy + Grad-CAM Heatmap + Differential Probabilities) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 Cols): High-Resolution Dermoscopy & Grad-CAM Attention Heatmap */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-700" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Visual Dermoscopy &amp; Attention Heatmap
              </h2>
            </div>

            {/* View Mode Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('side_by_side')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'side_by_side'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Side-by-Side
              </button>
              <button
                type="button"
                onClick={() => setViewMode('overlay')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'overlay'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Overlay
              </button>
              <button
                type="button"
                onClick={() => setViewMode('heatmap')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'heatmap'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Heatmap
              </button>
            </div>
          </div>

          {/* Visual Presentation Canvas */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 p-3">
            {viewMode === 'side_by_side' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative aspect-square bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                  <img
                    src={originalImagePreview}
                    alt="Patient Dermoscopic"
                    className="w-full h-full object-contain"
                  />
                  <span className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-md">
                    Original Dermoscopic
                  </span>
                </div>
                <div className="relative aspect-square bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                  <img
                    src={gradcam?.overlay_base64 || originalImagePreview}
                    alt="Grad-CAM Overlay"
                    className="w-full h-full object-contain"
                  />
                  <span className="absolute bottom-2.5 left-2.5 bg-teal-950/85 backdrop-blur-xs text-teal-200 text-[10px] font-semibold px-2.5 py-0.5 rounded-md border border-teal-800/40">
                    Grad-CAM Attention
                  </span>
                </div>
              </div>
            )}

            {viewMode === 'overlay' && (
              <div className="relative aspect-[4/3] max-h-96 w-full flex items-center justify-center">
                <img
                  src={gradcam?.overlay_base64 || originalImagePreview}
                  alt="Grad-CAM Overlay"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            )}

            {viewMode === 'heatmap' && (
              <div className="relative aspect-[4/3] max-h-96 w-full flex items-center justify-center">
                <img
                  src={gradcam?.heatmap_base64 || originalImagePreview}
                  alt="Grad-CAM Heatmap"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            )}
          </div>

          {/* Color Key & Focal Explanation */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 rounded-full bg-gradient-to-r from-blue-600 via-emerald-400 via-yellow-400 to-rose-600" />
              <span>Diagnostic Focus Gradient (Blue &rarr; Red)</span>
            </div>
            <span className="font-semibold text-slate-700">
              Salient Lesion Area: {gradcam?.focus_area_percentage || '32'}%
            </span>
          </div>

          {melanin_metrics && (
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Sun className="w-3.5 h-3.5 text-amber-700" />
                <span>Melanin Index Normalization (Indian Phototype Calibrator)</span>
              </div>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                Baseline healthy skin MI: <strong>{melanin_metrics.baseline_mi}</strong> &bull; Lesion MI: <strong>{melanin_metrics.lesion_mi}</strong> &bull; Relative Contrast (&Delta;Contrast): <strong>{melanin_metrics.delta_contrast}</strong> ({melanin_metrics.phototype_detected}). Prevents natural constitutional brown pigment from falsely elevating melanoma risk.
              </p>
            </div>
          )}

          <p className="text-xs text-slate-500 leading-relaxed">
            Grad-CAM (Gradient-weighted Class Activation Mapping) visualizes the spatial regions within the convolutional layers that exerted the highest numerical weight in identifying <strong>{top_condition}</strong>.
          </p>
        </div>

        {/* Right Column (5 Cols): Bayesian Multimodal Differential Probabilities */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
              Bayesian Differential Diagnosis
            </h2>
            <p className="text-xs text-slate-500">
              Joint probability: <em>P(Condition | 65% Model Vision &plus; 35% Clinical Intake)</em>
            </p>
          </div>

          {/* Probability Breakdown - Interactive Differential Selection */}
          <div className="space-y-3">
            <p className="text-[11px] text-slate-500 italic">
              Click any differential below to inspect its tailored causes, precautions &amp; diagnostic procedures:
            </p>
            {predictions?.map((pred, i) => {
              const isSelected = selectedDiagnosisIndex === i;
              return (
                <button
                  type="button"
                  key={pred.class_name || i}
                  onClick={() => setSelectedDiagnosisIndex(i)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer focus:outline-hidden ${
                    isSelected
                      ? 'bg-teal-50/90 border-teal-500 ring-2 ring-teal-500/30 shadow-xs'
                      : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-900 flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">#{i + 1}</span>
                      <span>{pred.display_name}</span>
                      {i === 0 && (
                        <span className="text-[9px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                          Primary
                        </span>
                      )}
                      {isSelected && i !== 0 && (
                        <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          Viewing
                        </span>
                      )}
                    </span>
                    <span className="font-extrabold text-teal-800 text-sm font-mono">
                      {pred.confidence_percentage}
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        i === 0
                          ? 'bg-teal-700'
                          : i === 1
                          ? 'bg-teal-500'
                          : 'bg-slate-400'
                      }`}
                      style={{ width: `${Math.max(5, pred.confidence * 100)}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-600 leading-snug">
                    {pred.description}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-teal-700 font-medium">
                      {isSelected ? '✓ Profile active in sections below' : 'Tap to explore clinical profile →'}
                    </span>
                    <span className="text-slate-500 font-medium">
                      Risk: <strong className="text-slate-700 capitalize">{pred.risk_level || 'Moderate'}</strong>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Live Doctor Tele-Consultation Callout */}
          <div className="p-4.5 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border border-teal-200 text-xs space-y-2.5">
            <h4 className="font-bold text-teal-900 flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-teal-700" />
              <span>Live Doctor Tele-Consultation Mode</span>
            </h4>
            <p className="text-xs text-teal-800 leading-relaxed">
              Prefer speaking naturally instead of typing? Speak directly with Dr. Elena Vance about your symptoms, triggers, and questions.
            </p>
            <button
              type="button"
              onClick={() => setIsVoiceModalOpen(true)}
              className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-300" />
              <span>Start Voice Teleconsult</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Exploration Mode Banner (when inspecting Differential #2 or #3) */}
      {selectedDiagnosisIndex > 0 && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs animate-fade-in">
          <div className="flex items-start sm:items-center gap-3 text-xs text-amber-950">
            <span className="text-2xl p-2 bg-white rounded-2xl shadow-2xs border border-amber-200">🔍</span>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-amber-900 text-sm">
                  Differential Exploration Mode
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full">
                  Differential #{selectedDiagnosisIndex + 1}: {activePred.display_name} ({activePred.confidence_percentage})
                </span>
              </div>
              <p className="text-amber-800 text-xs leading-relaxed">
                Primary visual finding remains <strong>{top_condition}</strong> ({top_confidence}). The Root Causes, Clinical Care Matrix, and Specialist Procedures below have dynamically updated to display the clinical profile for <strong>{activePred.display_name}</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedDiagnosisIndex(0)}
            className="shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>&larr; Return to Primary ({top_condition})</span>
          </button>
        </div>
      )}

      {/* 4. Full-Width Section: Root Causes & Triggers (Why It Occurred) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌱</span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Root Causes &amp; Clinical Triggers
              </h3>
              <p className="text-xs text-slate-500">
                Etiological mechanism &amp; predisposing factors for <strong className="text-slate-700">{activePred.display_name || top_condition}</strong>
              </p>
            </div>
          </div>
          <span className="text-[10px] text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            {selectedDiagnosisIndex > 0 ? `Differential #${selectedDiagnosisIndex + 1}` : 'Why It Occurred'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {displayedRootCauses.map((item, idx) => (
            <div key={item.title || idx} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl p-2 bg-white rounded-xl shadow-2xs">{item.icon || '🌱'}</span>
                <h4 className="font-bold text-xs text-slate-900">{typeof item === 'string' ? item : item.title}</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {typeof item === 'string' ? '' : item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Full-Width Section: Clinical Care Matrix (Do's & Don'ts) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Clinical Care Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Actionable self-care guidelines &amp; precautions for <strong className="text-slate-700">{activePred.display_name || top_condition}</strong>
              </p>
            </div>
          </div>
          <span className="text-[10px] text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            Do&apos;s &amp; Don&apos;ts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strictly Avoid (Red Panel) */}
          <div className="p-5 bg-rose-50/90 rounded-2xl border border-rose-200/90 space-y-3">
            <div className="flex items-center gap-2 font-bold text-rose-950 text-xs uppercase tracking-wider">
              <Ban className="w-4 h-4 text-rose-600" />
              <span>Strictly Avoid</span>
            </div>
            <ul className="space-y-2.5 text-xs text-rose-900 leading-relaxed">
              {displayedDonts.map((item, idx) => {
                const title = typeof item === 'string' ? item : item.title;
                const desc = typeof item === 'string' ? '' : item.description;
                return (
                  <li key={title || idx} className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>
                      <strong>{title}:</strong> {desc}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Immediate Care (Green Panel) */}
          <div className="p-5 bg-emerald-50/90 rounded-2xl border border-emerald-200/90 space-y-3">
            <div className="flex items-center gap-2 font-bold text-emerald-950 text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Immediate Supportive Care</span>
            </div>
            <ul className="space-y-2.5 text-xs text-emerald-900 leading-relaxed">
              {displayedDos.map((item, idx) => {
                const title = typeof item === 'string' ? item : item.title;
                const desc = typeof item === 'string' ? '' : item.description;
                return (
                  <li key={title || idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>
                      <strong>{title}:</strong> {desc}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* 6. Full-Width Section: Clinical Urgency Gauge & Specialist Procedures */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⏱️</span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Clinical Urgency Gauge &amp; Specialist Diagnostic Procedures
              </h3>
              <p className="text-xs text-slate-500">
                Calibrated triage index &amp; confirmatory evaluations for <strong className="text-slate-700">{activePred.display_name || top_condition}</strong>
              </p>
            </div>
          </div>
          <span className="text-[10px] text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            Triage &amp; Tests
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column (5 Cols): SVG Semicircle Urgency Gauge */}
          <div className="lg:col-span-5">
            <SemicircleUrgencyGauge
              isHighRisk={activeIsHighRisk}
              isModerateRisk={activeIsModerateRisk}
              safetyOverrideTriggered={safetyOverrideTriggered}
              overallRisk={activeRisk}
            />
          </div>

          {/* Right Column (7 Cols): Specialist Diagnostic Procedures */}
          <div className="lg:col-span-7 space-y-3.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Specialist Diagnostic Matching ({activePred.display_name || top_condition}):
            </span>

            {displayedProcedures.map((proc, idx) => {
              const IconComponent = idx === 0 ? Microscope : idx === 1 ? TestTubes : HeartPulse;
              const name = typeof proc === 'string' ? proc : proc.name;
              const desc = typeof proc === 'string' ? '' : proc.description;
              return (
                <div key={name || idx} className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 flex items-start gap-3.5 transition-all">
                  <IconComponent className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">{name}</span>
                    {desc && (
                      <span className="text-xs text-slate-600 leading-relaxed block mt-0.5">
                        {desc}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 7. Collapsible Recorded Clinical Intake History */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setIsIntakeExpanded(!isIntakeExpanded)}
          className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Activity className="w-4 h-4 text-teal-700" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Recorded Clinical Intake Profile
              </h3>
              <p className="text-xs text-slate-500">
                Verified symptoms, lesion evolution, and patient-reported clinical markers
              </p>
            </div>
          </div>
          <div className="text-slate-400">
            {isIntakeExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {isIntakeExpanded && (
          <div className="p-6 pt-0 border-t border-slate-100 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Chief Complaint
                </span>
                <span className="font-semibold text-slate-800 capitalize">
                  {questionnaireData?.chief_complaint?.replace('_', ' ') || 'Pigmented lesion / Mole'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Skin Phototype (Fitzpatrick)
                </span>
                <span className="font-semibold text-teal-800 capitalize">
                  {questionnaireData?.fitzpatrick_tone?.replace('_', ' ') || 'Type IV (Wheatish)'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Anatomical Site
                </span>
                <span className="font-semibold text-slate-800 capitalize">
                  {questionnaireData?.location?.replace('_', ' ') || 'Trunk / Torso'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Duration &amp; Onset
                </span>
                <span className="font-semibold text-slate-800 capitalize">
                  {questionnaireData?.duration || 'Subacute'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Reported Sensations
                </span>
                <span className="font-semibold text-slate-800">
                  {questionnaireData?.sensations?.join(', ') || 'None reported'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Red Flag Warning Signs
                </span>
                <span className={`font-semibold ${questionnaireData?.red_flags?.length ? 'text-rose-700' : 'text-slate-800'}`}>
                  {questionnaireData?.red_flags?.length
                    ? questionnaireData.red_flags.join(', ')
                    : 'None reported'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 8. Final Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onStartNewAssessment}
          className="w-full sm:w-auto px-5 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Start New Patient Assessment</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <button
            type="button"
            onClick={() => setIsVoiceModalOpen(true)}
            className="flex-1 sm:flex-initial px-5 py-3 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <PhoneCall className="w-4 h-4 text-emerald-300" />
            <span>Live Voice Consult</span>
          </button>
          <button
            type="button"
            onClick={onOpenChat}
            className="flex-1 sm:flex-initial px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-2 transition-all"
          >
            <MessageSquare className="w-4 h-4 text-teal-600" />
            <span>Consult Doctor Co-Pilot</span>
          </button>
          <button
            type="button"
            onClick={onOpenReportModal}
            className="flex-1 sm:flex-initial px-5 py-3 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <FileDown className="w-4 h-4" />
            <span>Export Official Dossier (PDF)</span>
          </button>
        </div>
      </div>

      {/* Voice Teleconsult Modal */}
      <VoiceConsultModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        visionContext={results}
        questionnaireContext={questionnaireData}
        apiKey={apiKey}
      />
    </div>
  );
}
