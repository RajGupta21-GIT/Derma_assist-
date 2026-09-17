import React, { useState } from 'react';
import { FileDown, FileText, CheckCircle, RefreshCw, UserCheck } from 'lucide-react';
import { exportReportPdf } from '../api';

export default function ReportExport({
  analysisData,
  originalImageB64,
  chatSummary
}) {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Unspecified');
  const [isExporting, setIsExporting] = useState(false);
  const [exportedSuccess, setExportedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const canExport = Boolean(analysisData && analysisData.top_condition);

  const handleExport = async () => {
    if (!canExport || isExporting) return;

    setIsExporting(true);
    setErrorMessage(null);
    setExportedSuccess(false);

    try {
      await exportReportPdf({
        analysisData: analysisData,
        originalImageB64: originalImageB64,
        gradcamImageB64: analysisData.gradcam_base64,
        chatSummary: chatSummary,
        patientInfo: {
          age: age.trim() || 'Unspecified',
          gender: gender
        }
      });
      setExportedSuccess(true);
      setTimeout(() => setExportedSuccess(false), 3500);
    } catch (err) {
      console.error("PDF export error:", err);
      setErrorMessage(err.message || 'Failed to generate PDF report.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-teal-600" />
        <h3 className="font-bold text-slate-900 text-sm">Download Clinical Triage Report</h3>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Compiles a comprehensive PDF document including macroscopic lesion images, Grad-CAM neural attention maps, differential diagnoses, and symptom triage transcript for patient records or referral review.
      </p>

      {/* Patient demographics (Optional) */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Patient Age (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g., 28 years"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            disabled={!canExport || isExporting}
            className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Gender (Optional)
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            disabled={!canExport || isExporting}
            className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="Unspecified">Unspecified</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Error display */}
      {errorMessage && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
          {errorMessage}
        </div>
      )}

      {/* Export Action Button */}
      <div className="pt-2">
        <button
          onClick={handleExport}
          disabled={!canExport || isExporting}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
            canExport
              ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isExporting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-teal-400" />
              <span>Generating PDF Report...</span>
            </>
          ) : exportedSuccess ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Downloaded Report!</span>
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4" />
              <span>Export Consultation PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
