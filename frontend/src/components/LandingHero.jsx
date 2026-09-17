import React from 'react';
import { Stethoscope, ArrowRight, ShieldCheck, Activity, Camera, FileText, CheckCircle2, MessageCircle } from 'lucide-react';

export default function LandingHero({ onStartAssessment }) {
  return (
    <div className="max-w-6xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 animate-fade-in space-y-16">
      {/* Hero Split Section: Doctor Greeting & Call-To-Action */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left Column (7 Cols): Headline, Speech Bubble & Primary CTA */}
        <div className="lg:col-span-7 space-y-6 text-left">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
            <span>Clinical Dermatology Assessment Protocol</span>
          </div>

          {/* Clean Medical Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
            Personalized <span className="text-teal-700">Dermatology</span> Decision Support
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl">
            A safe, clinical-grade triage assistant correlating patient symptoms and high-resolution dermoscopic photography with deep visual explainability.
          </p>

          {/* Doctor Interactive Speech Bubble Greeting */}
          <div className="relative p-4 sm:p-5 bg-white rounded-2xl border border-teal-100 shadow-sm max-w-lg">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                <MessageCircle className="w-5 h-5 text-teal-700" />
              </div>
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                <p className="font-semibold text-slate-900 mb-0.5">
                  &ldquo;Hello! I&apos;m Dr. Vance, your clinical co-pilot.&rdquo;
                </p>
                <p className="text-slate-600">
                  Ready to evaluate your skin condition together? I&apos;ll guide you through a brief 6-step intake, analyze your dermoscopic photo, and prepare a referral dossier for your physician.
                </p>
              </div>
            </div>
            {/* Speech bubble pointer indicator */}
            <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-t border-r border-teal-100 transform rotate-45" />
          </div>

          {/* Primary Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              onClick={onStartAssessment}
              className="w-full sm:w-auto px-8 py-4 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-teal-700/20 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5 cursor-pointer group"
            >
              <span>Begin Clinical Assessment</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <span className="text-xs text-slate-500 font-medium">
              Private, secure &bull; Under 2 minutes to complete
            </span>
          </div>
        </div>

        {/* Right Column (5 Cols): Clean Doctor Portrait Card */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 bg-white shadow-xl max-w-sm w-full aspect-[4/5] group">
            <img
              src="/images/doctor_hero.jpg"
              alt="Dr. Elena Vance, Dermatologist"
              className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
            />
            {/* Bottom Doctor Credential Badge */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/85 via-slate-900/50 to-transparent p-5 text-left text-white">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs font-bold tracking-wide">Dr. Elena Vance, M.D.</p>
              </div>
              <p className="text-[11px] text-slate-300">Board Certified Dermatologist &bull; Clinical Advisor</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Simple Minimal Steps Below */}
      <div className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Step 1 */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
              <Activity className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-mono font-bold text-teal-700 mb-1 uppercase tracking-wider">Step 01</div>
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">Clinical Intake</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Answer structured, one-by-one questions regarding timeline, itch, anatomical site, and lesion evolution.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
              <Camera className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-mono font-bold text-teal-700 mb-1 uppercase tracking-wider">Step 02</div>
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">Dermoscopic Photography</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Capture or upload high-resolution skin photos with live crosshairs to focus on lesion margins and pigmentation.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-mono font-bold text-teal-700 mb-1 uppercase tracking-wider">Step 03</div>
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">Diagnosis &amp; PDF Dossier</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Review Bayesian differential probabilities, Grad-CAM attention heatmaps, and export an official doctor referral report.
            </p>
          </div>
        </div>
      </div>

      {/* Safety & Compliance Assurance */}
      <div className="pt-4 border-t border-slate-200/60 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-teal-600" /> Evidence-Based Multimodal Triage
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-teal-600" /> Complete Patient Privacy
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-teal-600" /> Non-Prescriptive Guidance
        </span>
      </div>
    </div>
  );
}
