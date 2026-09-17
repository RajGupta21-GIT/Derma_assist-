import React, { useState } from 'react';
import { Eye, AlertTriangle, ShieldCheck, FileDown, Layers, Zap, Info } from 'lucide-react';

export default function AnalysisResults({ results, originalImagePreview, onOpenReportModal }) {
  const [viewMode, setViewMode] = useState('side_by_side'); // 'side_by_side', 'overlay', 'heatmap'

  if (!results) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200/80 flex flex-col items-center justify-center text-center min-h-[420px]">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
          <Eye className="w-7 h-7" />
        </div>
        <h3 className="text-sm font-bold text-slate-700 mb-1">Awaiting Multimodal Input</h3>
        <p className="text-xs text-slate-500 max-w-xs">
          Complete the clinical intake wizard and upload or capture a skin photo to trigger deep learning vision and Bayesian multimodal synthesis.
        </p>
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

  const getRiskBadge = (risk, isOverride) => {
    if (isOverride || risk?.includes('High')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
          <AlertTriangle className="w-4 h-4 text-rose-600" /> High Risk / Urgent Biopsy Triage
        </span>
      );
    }
    if (risk?.includes('Moderate')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
          Moderate / Outpatient Care
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
        <ShieldCheck className="w-4 h-4 text-emerald-600" /> Low / Likely Benign
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-5">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              Multimodal Differential Synthesis
            </span>
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" /> {inference_time_ms} ms
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">{top_condition}</h2>
        </div>
        <div>{getRiskBadge(overall_risk, safety_override_triggered)}</div>
      </div>

      {/* Safety Override Alert Banner */}
      {safety_override_triggered && (
        <div className="p-3.5 bg-rose-50 border-l-4 border-rose-600 rounded-xl text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Clinical Red-Flag Override Triggered</span>
          </div>
          <p className="text-[11px] text-rose-700 pl-5.5">
            {red_flag_alerts?.join(' ') ||
              'Patient reported rapid evolution, bleeding, or marked ABCDE asymmetry. The system automatically elevated the differential risk to urgent in-person biopsy.'}
          </p>
        </div>
      )}

      {/* Multimodal Rationale Box */}
      {fusion_rationale && (
        <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-xl text-xs flex items-start gap-2 text-teal-900">
          <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong>Clinical Synthesis Rationale:</strong> {fusion_rationale}
          </p>
        </div>
      )}

      {/* Visual Explainability (Grad-CAM) Section */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Grad-CAM Visual Attention Heatmap
            </h3>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setViewMode('side_by_side')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'side_by_side' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setViewMode('overlay')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'overlay' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overlay
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'heatmap' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Heatmap
            </button>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950 p-2">
          {viewMode === 'side_by_side' && (
            <div className="grid grid-cols-2 gap-2 aspect-[8/3] max-h-64">
              <div className="relative flex flex-col items-center justify-center bg-black rounded-lg overflow-hidden">
                <img src={originalImagePreview} alt="Original" className="w-full h-full object-contain" />
                <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded">
                  Original Dermoscopic
                </span>
              </div>
              <div className="relative flex flex-col items-center justify-center bg-black rounded-lg overflow-hidden">
                <img src={gradcam?.overlay_base64} alt="Grad-CAM Overlay" className="w-full h-full object-contain" />
                <span className="absolute bottom-1 left-1 bg-teal-900/80 text-teal-200 text-[9px] px-1.5 py-0.5 rounded">
                  Grad-CAM Spatial Focus
                </span>
              </div>
            </div>
          )}

          {viewMode === 'overlay' && (
            <div className="relative aspect-[4/3] max-h-64 w-full flex items-center justify-center">
              <img src={gradcam?.overlay_base64 || originalImagePreview} alt="Overlay" className="w-full h-full object-contain" />
            </div>
          )}

          {viewMode === 'heatmap' && (
            <div className="relative aspect-[4/3] max-h-64 w-full flex items-center justify-center">
              <img src={gradcam?.heatmap_base64} alt="Heatmap" className="w-full h-full object-contain" />
            </div>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 rounded-full bg-gradient-to-r from-blue-600 via-emerald-400 via-yellow-400 to-red-600" />
            <span>Blue (Tissue) &rarr; Red (Lesion Attention Peak)</span>
          </div>
          <span>Focus Area: {gradcam?.focus_area_percentage || '32'}%</span>
        </div>
      </div>

      {/* Differential Diagnosis Probabilities */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
          Bayesian Differential Probabilities
        </h3>
        <div className="space-y-2.5">
          {predictions?.map((pred, i) => (
            <div key={pred.class_name} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-800">
                  #{i + 1} {pred.display_name}
                </span>
                <span className="font-extrabold text-teal-700">{pred.confidence_percentage}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1.5">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    i === 0 ? 'bg-teal-600' : i === 1 ? 'bg-teal-400' : 'bg-slate-400'
                  }`}
                  style={{ width: `${Math.max(5, pred.confidence * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-600 line-clamp-2">{pred.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Export PDF Button */}
      <div className="pt-1">
        <button
          onClick={onOpenReportModal}
          className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <FileDown className="w-4 h-4 text-teal-400" />
          Export Official Consultation PDF Report (With Intake History)
        </button>
      </div>
    </div>
  );
}
