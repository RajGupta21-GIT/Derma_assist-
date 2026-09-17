import React, { useState } from 'react';
import { Stethoscope, Info, ShieldCheck, RefreshCw } from 'lucide-react';

export default function Navbar({ health, currentView, onResetAssessment }) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div 
            onClick={onResetAssessment}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-xs group-hover:bg-teal-800 transition-colors">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-slate-900 tracking-tight">Derma Assist</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                  Clinical Protocol
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Multimodal Dermatology Decision Support</p>
            </div>
          </div>

          {/* Right Controls & Status */}
          <div className="flex items-center gap-3">
            {/* System Status Indicators */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs font-medium">
              <span className={`w-2 h-2 rounded-full ${health?.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="text-slate-600">Vision Engine: {health?.model_loaded ? 'Ready' : 'Standby'}</span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-teal-50/80 rounded-xl border border-teal-200/70 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
              <span className="text-teal-800 font-semibold">
                Clinical Co-Pilot: Active
              </span>
            </div>

            {/* New Patient Button if in active flow */}
            {currentView !== 'landing' && (
              <button
                onClick={onResetAssessment}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                title="Restart Assessment"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>New Patient</span>
              </button>
            )}

            <button
              onClick={() => setShowInfo(true)}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              title="Clinical Protocol Information"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Clinical Protocol Information Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Info className="w-5 h-5 text-teal-700" />
                Clinical Decision Support Architecture
              </h3>
              <button
                onClick={() => setShowInfo(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 max-h-[70vh] overflow-y-auto pr-2">
              <div className="bg-teal-50/70 p-3.5 rounded-2xl border border-teal-100">
                <h4 className="font-bold text-teal-950 mb-1">Platform: Derma Assist</h4>
                <p className="leading-relaxed">
                  A multimodal dermatology decision support system combining structured clinical history intake, convolutional neural network dermoscopic image analysis with Grad-CAM visual heatmaps, and Bayesian clinical synthesis.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1.5">Four-Stage Clinical Workflow:</h4>
                <ol className="list-decimal pl-4 space-y-1 leading-relaxed">
                  <li><strong>Clinical Intake Wizard:</strong> Step-by-step chief complaint, anatomical distribution, duration, sensations, and ABCDE criteria.</li>
                  <li><strong>Dermoscopic Studio:</strong> High-resolution macro photography with live crosshair alignment and upload capability.</li>
                  <li><strong>Multimodal Bayesian Fusion:</strong> Combines visual softmax probabilities with clinical symptom likelihoods ($P(\text{Condition} \mid \text{Image, History})$).</li>
                  <li><strong>Clinical Referral Dossier:</strong> Side-by-side Grad-CAM spatial explainability, differential ranking, and PDF export.</li>
                </ol>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1">Diagnostic Scope:</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Melanoma, Benign Nevus, Basal/Squamous Cell, Eczema/Atopic Dermatitis, Contact Dermatitis, Fungal Infections, Psoriasis, Acne & Rosacea, and Viral Dermatoses.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowInfo(false)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
