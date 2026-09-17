import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function DisclaimerModal({ onAccept }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('derma_disclaimer_accepted');
    if (!accepted) {
      setIsOpen(true);
    }
  }, []);

  const handleAgree = () => {
    localStorage.setItem('derma_disclaimer_accepted', 'true');
    setIsOpen(false);
    if (onAccept) onAccept();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center gap-3 text-amber-600 mb-4">
          <div className="p-3 bg-amber-50 rounded-xl">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Medical Safety & Ethics Disclaimer</h2>
            <p className="text-xs text-slate-500">Project Exhibition & Clinical Triage Prototype</p>
          </div>
        </div>

        <div className="text-sm text-slate-600 space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 mb-6">
          <p>
            <strong className="text-slate-800">Derma Assist</strong> is an academic machine learning research project developed for group exhibition and triage demonstration.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li>It does <strong>NOT</strong> substitute for professional medical advice, clinical diagnosis, or treatment.</li>
            <li>Computer vision confidence scores and Grad-CAM heatmaps are probabilistic decision-support aids.</li>
            <li>In the event of bleeding, rapid growth, intense pain, or fever, immediately consult a certified dermatologist or emergency care center.</li>
          </ul>
        </div>

        <button
          onClick={handleAgree}
          className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold rounded-xl shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          I Understand & Agree to Proceed
        </button>
      </div>
    </div>
  );
}
