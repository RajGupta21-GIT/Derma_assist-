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
  ChevronUp
} from 'lucide-react';

export default function ClinicalDossier({
  results,
  questionnaireData,
  originalImagePreview,
  onOpenChat,
  onOpenReportModal,
  onStartNewAssessment,
  onBackToCapture,
}) {
  const [viewMode, setViewMode] = useState('side_by_side'); // 'side_by_side' | 'overlay' | 'heatmap'
  const [isIntakeExpanded, setIsIntakeExpanded] = useState(false);

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
            onClick={onStartNewAssessment}
            className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
          >
            Start New Assessment
          </button>
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
    inference_time_ms,
    fusion_rationale,
    safety_override_triggered,
    red_flag_alerts,
  } = results;

  const isHighRisk = safety_override_triggered || overall_risk?.toLowerCase().includes('high');
  const isModerateRisk = overall_risk?.toLowerCase().includes('moderate');

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 animate-fade-in space-y-6">
      {/* Navigation & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToCapture}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            title="Back to Photo Capture"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/80">
                Clinical Referral Dossier
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Analysis time: {inference_time_ms} ms
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              {top_condition}
            </h1>
          </div>
        </div>

        {/* Primary Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenChat}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all"
          >
            <MessageSquare className="w-4 h-4 text-teal-600" />
            <span>Consult Doctor Co-Pilot</span>
          </button>
          <button
            onClick={onOpenReportModal}
            className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
          >
            <FileDown className="w-4 h-4" />
            <span>Download Referral PDF</span>
          </button>
        </div>
      </div>

      {/* Triage Urgency & Safety Override Banner */}
      {isHighRisk ? (
        <div className="p-4 bg-rose-50 border-l-4 border-rose-600 rounded-2xl text-xs space-y-1.5 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-rose-950 text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>High Risk Priority &bull; In-Person Dermatological Evaluation Recommended</span>
          </div>
          <p className="text-rose-800 pl-7 leading-relaxed text-[11px]">
            {safety_override_triggered
              ? `Critical safety criteria detected (${red_flag_alerts?.join(', ') || 'asymmetry / bleeding / rapid growth'}). The clinical triage protocol has elevated this finding for expedited specialist biopsy.`
              : 'The multimodal profile indicates features requiring definitive in-person dermoscopic inspection and potential histopathological evaluation.'}
          </p>
        </div>
      ) : isModerateRisk ? (
        <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-2xl text-xs space-y-1 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Moderate Priority &bull; Outpatient Clinical Follow-up Advised</span>
          </div>
          <p className="text-amber-800 pl-6 leading-relaxed text-[11px]">
            Symptom patterns and visual characteristics warrant a scheduled consultation with a healthcare professional to confirm diagnosis and prescribe targeted topical or systemic therapy.
          </p>
        </div>
      ) : (
        <div className="p-3.5 bg-emerald-50 border-l-4 border-emerald-500 rounded-2xl text-xs space-y-1 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-emerald-950">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Low Risk / Likely Benign Presentation &bull; Standard Monitoring</span>
          </div>
          <p className="text-emerald-800 pl-6 leading-relaxed text-[11px]">
            The current multimodal synthesis aligns with a benign or mild presentation. Continue routine self-checks and monitor for any future changes in color, size, or sensation.
          </p>
        </div>
      )}

      {/* Multimodal Bayesian Rationale Card */}
      {fusion_rationale && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3">
          <div className="p-2 rounded-xl bg-teal-50 text-teal-700 shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <h3 className="font-bold text-slate-900 mb-0.5">Clinical Multimodal Synthesis Rationale</h3>
            <p className="text-slate-600 leading-relaxed text-[11px]">{fusion_rationale}</p>
          </div>
        </div>
      )}

      {/* 2-Column Clinical Evidence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 Cols): High-Resolution Dermoscopy & Grad-CAM Heatmap */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
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
                className={`px-3 py-1 rounded-lg transition-all ${
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
                className={`px-3 py-1 rounded-lg transition-all ${
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
                className={`px-3 py-1 rounded-lg transition-all ${
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
          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 p-2.5">
            {viewMode === 'side_by_side' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="relative aspect-square bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                  <img
                    src={originalImagePreview}
                    alt="Patient Dermoscopic"
                    className="w-full h-full object-contain"
                  />
                  <span className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                    Original Dermoscopic
                  </span>
                </div>
                <div className="relative aspect-square bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                  <img
                    src={gradcam?.overlay_base64 || originalImagePreview}
                    alt="Grad-CAM Overlay"
                    className="w-full h-full object-contain"
                  />
                  <span className="absolute bottom-2 left-2 bg-teal-950/85 backdrop-blur-xs text-teal-200 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-teal-800/40">
                    Grad-CAM Attention
                  </span>
                </div>
              </div>
            )}

            {viewMode === 'overlay' && (
              <div className="relative aspect-[4/3] max-h-80 w-full flex items-center justify-center">
                <img
                  src={gradcam?.overlay_base64 || originalImagePreview}
                  alt="Grad-CAM Overlay"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            )}

            {viewMode === 'heatmap' && (
              <div className="relative aspect-[4/3] max-h-80 w-full flex items-center justify-center">
                <img
                  src={gradcam?.heatmap_base64 || originalImagePreview}
                  alt="Grad-CAM Heatmap"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            )}
          </div>

          {/* Color Key & Focal Explanation */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 rounded-full bg-gradient-to-r from-blue-600 via-emerald-400 via-yellow-400 to-rose-600" />
              <span>Diagnostic Focus Gradient (Blue &rarr; Red)</span>
            </div>
            <span className="font-semibold text-slate-700">
              Salient Lesion Area: {gradcam?.focus_area_percentage || '32'}%
            </span>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Grad-CAM (Gradient-weighted Class Activation Mapping) visualizes the spatial regions within the convolutional layers that exerted the highest numerical weight in identifying <strong>{top_condition}</strong>.
          </p>
        </div>

        {/* Right Column (5 Cols): Bayesian Multimodal Differential Probabilities */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
              Bayesian Differential Diagnosis
            </h2>
            <p className="text-[11px] text-slate-500">
              Joint probability: <em>P(Condition | Dermoscopy &times; Clinical History)</em>
            </p>
          </div>

          {/* Probability Breakdown */}
          <div className="space-y-3">
            {predictions?.map((pred, i) => (
              <div
                key={pred.class_name || i}
                className={`p-3.5 rounded-xl border transition-all ${
                  i === 0
                    ? 'bg-teal-50/50 border-teal-200'
                    : 'bg-slate-50 border-slate-200/70'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-mono">#{i + 1}</span>
                    <span>{pred.display_name}</span>
                  </span>
                  <span className="font-extrabold text-teal-800 text-sm font-mono">
                    {pred.confidence_percentage}
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-1.5">
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

                <p className="text-[11px] text-slate-600 leading-snug">
                  {pred.description}
                </p>
              </div>
            ))}
          </div>

          {/* Quick Doctor Co-Pilot Callout */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-teal-700" />
              <span>Questions About This Differential?</span>
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Our clinical co-pilot can explain common medication pathways, warning symptoms to monitor, and specific questions to ask your physician.
            </p>
            <button
              type="button"
              onClick={onOpenChat}
              className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
            >
              Open Consultation Assistant
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible Clinical Intake History Accordion */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setIsIntakeExpanded(!isIntakeExpanded)}
          className="w-full p-4.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-teal-700" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Recorded Clinical Intake Profile
              </h3>
              <p className="text-[11px] text-slate-500">
                Verified symptoms, lesion evolution, and patient-reported clinical markers
              </p>
            </div>
          </div>
          <div className="text-slate-400">
            {isIntakeExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {isIntakeExpanded && (
          <div className="p-5 pt-0 border-t border-slate-100 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Chief Complaint
                </span>
                <span className="font-semibold text-slate-800 capitalize">
                  {questionnaireData?.chief_complaint?.replace('_', ' ') || 'Pigmented lesion / Mole'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Anatomical Site
                </span>
                <span className="font-semibold text-slate-800 capitalize">
                  {questionnaireData?.location?.replace('_', ' ') || 'Trunk / Torso'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Duration &amp; Onset
                </span>
                <span className="font-semibold text-slate-800 capitalize">
                  {questionnaireData?.duration || 'Subacute'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Reported Sensations
                </span>
                <span className="font-semibold text-slate-800">
                  {questionnaireData?.sensations?.join(', ') || 'None reported'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Distribution Pattern
                </span>
                <span className="font-semibold text-slate-800 capitalize">
                  {questionnaireData?.distribution || 'Single solitary lesion'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
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

      {/* Final Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onStartNewAssessment}
          className="w-full sm:w-auto px-5 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Start New Patient Assessment</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onOpenChat}
            className="flex-1 sm:flex-initial px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all"
          >
            <MessageSquare className="w-4 h-4 text-teal-600" />
            <span>Consult Doctor Co-Pilot</span>
          </button>
          <button
            type="button"
            onClick={onOpenReportModal}
            className="flex-1 sm:flex-initial px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <FileDown className="w-4 h-4" />
            <span>Export Official Dossier (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
