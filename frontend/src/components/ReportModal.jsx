import React, { useState } from 'react';
import { FileText, Download, X, CheckCircle } from 'lucide-react';
import { downloadReport } from '../services/api';

export default function ReportModal({ isOpen, onClose, classificationResult, questionnaireData, originalImagePreview }) {
  const [patientName, setPatientName] = useState('Patient Case #2026');
  const [patientAge, setPatientAge] = useState('32');
  const [patientGender, setPatientGender] = useState('Female');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async (e) => {
    e.preventDefault();
    setIsDownloading(true);
    try {
      await downloadReport({
        patientName,
        patientAge,
        patientGender,
        questionnaireData,
        classificationResult,
        originalImgBase64: originalImagePreview,
      });
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      alert('Failed to generate PDF: ' + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Export Clinical PDF Dossier</h3>
              <p className="text-xs text-slate-500">Official Dermatologist Referral Report</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleDownload} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Patient Identifier</label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Age</label>
              <input
                type="text"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Biological Gender</label>
              <select
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other / Not specified</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
            <p className="font-bold text-slate-700">Dossier Inclusion Summary:</p>
            <p>&bull; Structured Branching Questionnaire Clinical History</p>
            <p>&bull; Side-by-side Dermoscopic Capture + Grad-CAM Heatmap</p>
            <p>&bull; Bayesian Multimodal Differential Probabilities & Rationale</p>
            <p>&bull; Medical Safety & Triage Disclaimer</p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDownloading}
              className="px-5 py-2.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md shadow-teal-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4" /> Downloaded!
                </>
              ) : isDownloading ? (
                'Generating PDF...'
              ) : (
                <>
                  <Download className="w-4 h-4" /> Download PDF Dossier
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
