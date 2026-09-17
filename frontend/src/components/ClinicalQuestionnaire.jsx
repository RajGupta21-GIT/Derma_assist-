import React, { useState } from 'react';
import { ClipboardList, AlertTriangle, ShieldCheck, ChevronDown, ChevronUp, Check, ArrowRight } from 'lucide-react';

const CHIEF_COMPLAINTS = [
  { id: 'mole_spot', title: 'Pigmented Mole or Dark Spot', subtitle: 'New, growing, dark or changing skin lesion', icon: '🔍' },
  { id: 'red_rash', title: 'Red Rash, Welts or Redness', subtitle: 'Itchy erythema, contact irritation, hives', icon: '🔴' },
  { id: 'scaly_plaque', title: 'Dry, Scaly or Thick Plaque', subtitle: 'Rough flaking patches, silver scales, psoriasis', icon: '🩹' },
  { id: 'facial_flare', title: 'Facial Flare or Acne', subtitle: 'Facial redness, pimples, pustules, rosacea', icon: '✨' },
];

const LOCATIONS = [
  { id: 'face', label: 'Face & Forehead' },
  { id: 'scalp_neck', label: 'Scalp or Neck' },
  { id: 'trunk', label: 'Chest, Abdomen or Back' },
  { id: 'arms_hands', label: 'Arms, Elbows or Hands' },
  { id: 'legs_feet', label: 'Legs, Knees or Feet' },
];

const DURATIONS = [
  { id: 'acute', label: 'Acute (< 48 hours)' },
  { id: 'subacute', label: 'Subacute (1 to 4 weeks)' },
  { id: 'chronic', label: 'Chronic (> 1 month)' },
];

export default function ClinicalQuestionnaire({ onComplete, isSubmitted }) {
  const [complaint, setComplaint] = useState('mole_spot');
  const [location, setLocation] = useState('trunk');
  const [duration, setDuration] = useState('subacute');
  const [sensations, setSensations] = useState(['itch']);
  
  // Branching specific states
  const [branchData, setBranchData] = useState({
    abcde_asymmetry: false,
    abcde_border: false,
    abcde_color: false,
    abcde_diameter: false,
    abcde_evolution: false,
    bleeding: false,
    annular_ring: false,
    contact_allergen: false,
    extensor_elbow_knee: false,
    flexural_folds: false,
    flushing_spicy_heat: false,
    comedones_blackheads: false,
  });

  const [redFlags, setRedFlags] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSensation = (item) => {
    setSensations((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const toggleBranch = (key) => {
    setBranchData((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleRedFlag = (item) => {
    setRedFlags((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const handleProceed = () => {
    const questionnairePayload = {
      chief_complaint: complaint,
      location,
      duration,
      sensations,
      branch_data: branchData,
      red_flags: redFlags,
    };
    onComplete(questionnairePayload);
    setIsCollapsed(true);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">1. Clinical Intake & History Wizard</h2>
            <p className="text-xs text-slate-500">Step-by-step branching questions establishing clinical history</p>
          </div>
        </div>

        {isSubmitted && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            {isCollapsed ? (
              <>
                <ChevronDown className="w-4 h-4" /> Expand Intake
              </>
            ) : (
              <>
                <ChevronUp className="w-4 h-4" /> Minimize
              </>
            )}
          </button>
        )}
      </div>

      {isCollapsed ? (
        <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-teal-800">
            <Check className="w-4 h-4 text-teal-600 font-bold" />
            <span>
              <strong>Intake Recorded:</strong> {CHIEF_COMPLAINTS.find((c) => c.id === complaint)?.title} &bull; {location} &bull; {duration}
            </span>
          </div>
          <button
            onClick={() => setIsCollapsed(false)}
            className="text-[11px] font-bold text-teal-700 underline underline-offset-2"
          >
            Edit Responses
          </button>
        </div>
      ) : (
        <div className="space-y-6 text-xs">
          {/* Section 1: Chief Complaint */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Step 1: Primary Presentation / Chief Complaint
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CHIEF_COMPLAINTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setComplaint(item.id)}
                  className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    complaint === item.id
                      ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-500/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <div>
                    <p className={`font-bold text-xs ${complaint === item.id ? 'text-teal-900' : 'text-slate-800'}`}>
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Anatomical Location & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Anatomical Location
              </label>
              <div className="flex flex-wrap gap-1.5">
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setLocation(loc.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      location === loc.id
                        ? 'border-teal-600 bg-teal-600 text-white'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Onset & Duration
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DURATIONS.map((dur) => (
                  <button
                    key={dur.id}
                    type="button"
                    onClick={() => setDuration(dur.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      duration === dur.id
                        ? 'border-teal-600 bg-teal-600 text-white'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {dur.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Sensations */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Reported Sensations
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'itch', label: 'Pruritus / Itching' },
                { id: 'pain', label: 'Sharp Pain / Tenderness' },
                { id: 'burning', label: 'Burning or Stinging' },
                { id: 'bleeding', label: 'Bleeding or Oozing' },
                { id: 'asymptomatic', label: 'Asymptomatic (No discomfort)' },
              ].map((sens) => (
                <button
                  key={sens.id}
                  type="button"
                  onClick={() => toggleSensation(sens.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    sensations.includes(sens.id)
                      ? 'border-teal-600 bg-teal-50 text-teal-800 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {sensations.includes(sens.id) ? '✓ ' : '+ '}
                  {sens.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Dynamic Branching Deep-Dive */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2.5">
              <span>🎯 Dynamic Branching Inquiry:</span>
              <span className="text-teal-700 font-semibold">
                {CHIEF_COMPLAINTS.find((c) => c.id === complaint)?.title}
              </span>
            </div>

            {complaint === 'mole_spot' && (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-500 mb-2">
                  Please evaluate the lesion against the standard clinical <strong>ABCDE</strong> criteria:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'abcde_asymmetry', label: 'A - Asymmetry (Halves do not match)' },
                    { id: 'abcde_border', label: 'B - Border (Irregular, notched or jagged)' },
                    { id: 'abcde_color', label: 'C - Color (Variegated brown, black, red)' },
                    { id: 'abcde_diameter', label: 'D - Diameter (Larger than 6mm / pencil eraser)' },
                    { id: 'abcde_evolution', label: 'E - Evolution (Recent rapid change in size or shape)' },
                    { id: 'bleeding', label: 'Spontaneous Bleeding or Ulceration' },
                  ].map((crit) => (
                    <label
                      key={crit.id}
                      className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 hover:border-teal-300 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={branchData[crit.id]}
                        onChange={() => toggleBranch(crit.id)}
                        className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                      />
                      <span className="text-[11px] text-slate-700">{crit.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {complaint === 'red_rash' && (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-500 mb-2">Targeted rash morphology & environmental exposure:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'annular_ring', label: 'Annular circular ring with raised border & clear center' },
                    { id: 'contact_allergen', label: 'Recent exposure to new detergent, plant or cosmetic' },
                    { id: 'flexural_folds', label: 'Localized to inner elbows, neck or behind knees' },
                  ].map((crit) => (
                    <label
                      key={crit.id}
                      className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 hover:border-teal-300 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={branchData[crit.id]}
                        onChange={() => toggleBranch(crit.id)}
                        className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                      />
                      <span className="text-[11px] text-slate-700">{crit.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {complaint === 'scaly_plaque' && (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-500 mb-2">Plaque characteristics & distribution:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'extensor_elbow_knee', label: 'Silvery scaly plaques on extensor elbows or knees' },
                    { id: 'flexural_folds', label: 'Lichenified dry patches in skin folds' },
                  ].map((crit) => (
                    <label
                      key={crit.id}
                      className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 hover:border-teal-300 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={branchData[crit.id]}
                        onChange={() => toggleBranch(crit.id)}
                        className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                      />
                      <span className="text-[11px] text-slate-700">{crit.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {complaint === 'facial_flare' && (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-500 mb-2">Facial symptom triggers & features:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'flushing_spicy_heat', label: 'Flushing provoked by heat, spicy foods, or sun' },
                    { id: 'comedones_blackheads', label: 'Presence of blackheads, whiteheads, or cystic bumps' },
                  ].map((crit) => (
                    <label
                      key={crit.id}
                      className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 hover:border-teal-300 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={branchData[crit.id]}
                        onChange={() => toggleBranch(crit.id)}
                        className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                      />
                      <span className="text-[11px] text-slate-700">{crit.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Red-Flag Screener */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-rose-700 mb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Emergency Red-Flag Screener
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'high_fever', label: 'High Fever (> 101°F / 38.5°C)' },
                { id: 'facial_swelling', label: 'Facial / Lip Angioedema or Breathing Tightness' },
                { id: 'rapid_purpura', label: 'Sudden Dark Purple Spreading Spots' },
              ].map((flag) => (
                <button
                  key={flag.id}
                  type="button"
                  onClick={() => toggleRedFlag(flag.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    redFlags.includes(flag.id)
                      ? 'border-rose-500 bg-rose-50 text-rose-800 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {redFlags.includes(flag.id) ? '⚠️ ' : '+ '}
                  {flag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleProceed}
              className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all"
            >
              Confirm Clinical Intake & Proceed to Photo Capture
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
