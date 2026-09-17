import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, AlertTriangle, Sparkles, ShieldCheck } from 'lucide-react';

const CHIEF_COMPLAINTS = [
  {
    id: 'mole_spot',
    title: 'Pigmented Mole or Dark Spot',
    subtitle: 'New, dark, changing, or irregular skin lesion requiring ABCDE evaluation.',
    icon: '🔍',
  },
  {
    id: 'red_rash',
    title: 'Red Rash, Welts, or Erythema',
    subtitle: 'Itchy patches, allergic contact irritation, hives, or widespread redness.',
    icon: '🔴',
  },
  {
    id: 'scaly_plaque',
    title: 'Dry, Scaly, or Thick Plaque',
    subtitle: 'Rough flaking skin, silvery scales on extensor surfaces, or chronic plaques.',
    icon: '🩹',
  },
  {
    id: 'facial_flare',
    title: 'Facial Flare, Bumps, or Acne',
    subtitle: 'Facial redness, flushing, inflammatory pimples, pustules, or rosacea.',
    icon: '✨',
  },
];

const LOCATIONS = [
  { id: 'face', title: 'Face & Neck', desc: 'Cheeks, forehead, nose, or neck' },
  { id: 'scalp', title: 'Scalp', desc: 'Hairline or scalp areas' },
  { id: 'trunk', title: 'Trunk & Torso', desc: 'Chest, abdomen, or upper/lower back' },
  { id: 'arms_hands', title: 'Arms & Hands', desc: 'Shoulders, elbows, forearms, or hands' },
  { id: 'legs_feet', title: 'Legs & Feet', desc: 'Thighs, knees, calves, or feet' },
];

const DURATIONS = [
  { id: 'acute', title: 'Acute (< 48 Hours)', desc: 'Suddenly appeared within the last 1–2 days' },
  { id: 'subacute', title: 'Subacute (1 to 4 Weeks)', desc: 'Present for several days up to a month' },
  { id: 'chronic', title: 'Chronic (> 1 Month)', desc: 'Long-standing lesion or recurring flare-up' },
];

const SENSATIONS = [
  { id: 'itch', label: 'Pruritus / Itching', desc: 'Persistent desire to scratch' },
  { id: 'burning', label: 'Burning or Stinging', desc: 'Hot, stinging sensation' },
  { id: 'pain', label: 'Sharp Pain or Tenderness', desc: 'Hurts when touched or pressed' },
  { id: 'bleeding', label: 'Bleeding or Oozing', desc: 'Discharges fluid or spontaneous blood' },
  { id: 'asymptomatic', label: 'Asymptomatic', desc: 'No pain, itching, or physical sensation' },
];

export default function StepWizard({ onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // Questionnaire States
  const [complaint, setComplaint] = useState('');
  const [location, setLocation] = useState('');
  const [distribution, setDistribution] = useState('single');
  const [duration, setDuration] = useState('');
  const [sensations, setSensations] = useState([]);
  const [branchData, setBranchData] = useState({
    abcde_asymmetry: false,
    abcde_border: false,
    abcde_color: false,
    abcde_diameter: false,
    abcde_evolution: false,
    bleeding: false,
    annular_ring: false,
    contact_allergen: false,
    flexural_folds: false,
    extensor_elbow_knee: false,
    flushing_spicy_heat: false,
    comedones_blackheads: false,
  });
  const [priorTreatments, setPriorTreatments] = useState('');
  const [redFlags, setRedFlags] = useState([]);

  // Auto-advance helper with short delay
  const handleAutoSelect = (setter, value) => {
    setter(value);
    setTimeout(() => {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps + 1));
    }, 220);
  };

  const toggleSensation = (id) => {
    if (id === 'asymptomatic') {
      setSensations(['asymptomatic']);
      return;
    }
    setSensations((prev) => {
      const clean = prev.filter((x) => x !== 'asymptomatic');
      return clean.includes(id) ? clean.filter((x) => x !== id) : [...clean, id];
    });
  };

  const toggleBranch = (key) => {
    setBranchData((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleRedFlag = (id) => {
    setRedFlags((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleFinalSubmit = () => {
    const payload = {
      chief_complaint: complaint || 'mole_spot',
      location: location || 'trunk',
      distribution,
      duration: duration || 'subacute',
      sensations: sensations.length > 0 ? sensations : ['asymptomatic'],
      branch_data: branchData,
      prior_treatments: priorTreatments,
      red_flags: redFlags,
    };
    onComplete(payload);
  };

  const progressPct = Math.round((Math.min(currentStep, totalSteps) / totalSteps) * 100);

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 animate-fade-in">
      {/* Top Header & Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2.5">
          <button
            onClick={() => {
              if (currentStep > 1) {
                setCurrentStep((prev) => prev - 1);
              } else if (onCancel) {
                onCancel();
              }
            }}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors py-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentStep === 1 ? 'Cancel Assessment' : 'Previous Step'}</span>
          </button>
          <span>
            {currentStep <= totalSteps ? `Step ${currentStep} of ${totalSteps}` : 'Intake Summary'}
          </span>
        </div>

        {/* Minimalist Progress Track */}
        <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-700 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${currentStep > totalSteps ? 100 : progressPct}%` }}
          />
        </div>
      </div>

      {/* STEP 1: Chief Complaint */}
      {currentStep === 1 && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">What is your primary skin concern?</h2>
            <p className="text-xs text-slate-500 mt-1">Select the category that best describes what you are experiencing.</p>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-2">
            {CHIEF_COMPLAINTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleAutoSelect(setComplaint, item.id)}
                className={`p-4 rounded-2xl border text-left flex items-start gap-4 transition-all ${
                  complaint === item.id
                    ? 'border-teal-700 bg-teal-50/50 ring-2 ring-teal-700/20 shadow-sm'
                    : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <span className="text-2xl p-2 bg-slate-50 rounded-xl shrink-0">{item.icon}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{item.subtitle}</p>
                </div>
                {complaint === item.id && <Check className="w-5 h-5 text-teal-700 mt-1" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: Anatomical Location & Spread */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Where is it located on your body?</h2>
            <p className="text-xs text-slate-500 mt-1">Select the primary region and distribution pattern.</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {LOCATIONS.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setLocation(loc.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    location === loc.id
                      ? 'border-teal-700 bg-teal-50/50 ring-2 ring-teal-700/20 shadow-sm'
                      : 'border-slate-200/80 bg-white hover:border-slate-300'
                  }`}
                >
                  <p className="font-bold text-xs text-slate-900">{loc.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{loc.desc}</p>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Distribution Pattern</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setDistribution('single')}
                  className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                    distribution === 'single'
                      ? 'border-teal-700 bg-teal-50/50 text-teal-900 ring-2 ring-teal-700/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Single Isolated Spot
                </button>
                <button
                  type="button"
                  onClick={() => setDistribution('multiple')}
                  className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                    distribution === 'multiple'
                      ? 'border-teal-700 bg-teal-50/50 text-teal-900 ring-2 ring-teal-700/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Multiple / Scattered
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentStep(3)}
            disabled={!location}
            className="w-full py-3.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Continue to Timeline</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 3: Onset & Chronology */}
      {currentStep === 3 && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">How long have you noticed this?</h2>
            <p className="text-xs text-slate-500 mt-1">Timeline helps establish whether the condition is acute or chronic.</p>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-2">
            {DURATIONS.map((dur) => (
              <button
                key={dur.id}
                type="button"
                onClick={() => handleAutoSelect(setDuration, dur.id)}
                className={`p-4 rounded-2xl border text-left flex items-start justify-between transition-all ${
                  duration === dur.id
                    ? 'border-teal-700 bg-teal-50/50 ring-2 ring-teal-700/20 shadow-sm'
                    : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{dur.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{dur.desc}</p>
                </div>
                {duration === dur.id && <Check className="w-5 h-5 text-teal-700 mt-0.5" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: Sensation Profile */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">What sensations do you experience?</h2>
            <p className="text-xs text-slate-500 mt-1">Select all sensations that apply to the affected area.</p>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {SENSATIONS.map((sens) => {
              const isSelected = sensations.includes(sens.id);
              return (
                <button
                  key={sens.id}
                  type="button"
                  onClick={() => toggleSensation(sens.id)}
                  className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-teal-700 bg-teal-50/50 ring-2 ring-teal-700/20 shadow-sm'
                      : 'border-slate-200/80 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs text-slate-900">{sens.label}</span>
                    <p className="text-[11px] text-slate-500">{sens.desc}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                      isSelected ? 'bg-teal-700 border-teal-700 text-white' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentStep(5)}
            disabled={sensations.length === 0}
            className="w-full py-3.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Continue to Diagnostic Criteria</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 5: Dynamic Condition-Specific Drill-Down */}
      {currentStep === 5 && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold uppercase tracking-wider mb-2">
              <span>Targeted Diagnostic Pathway</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical Feature Drill-Down</h2>
            <p className="text-xs text-slate-500 mt-1">
              {complaint === 'mole_spot'
                ? 'Evaluate against the clinical ABCDE rule for pigmented lesions.'
                : 'Specific morphological characteristics and trigger exposure.'}
            </p>
          </div>

          {/* Mole ABCDE Branch */}
          {complaint === 'mole_spot' && (
            <div className="space-y-2.5">
              {[
                { id: 'abcde_asymmetry', label: 'A — Asymmetry', desc: 'One half does not match the other in shape or outline.' },
                { id: 'abcde_border', label: 'B — Border Irregularity', desc: 'Edges are ragged, notched, blurred, or poorly defined.' },
                { id: 'abcde_color', label: 'C — Color Variegation', desc: 'Multiple shades of brown, black, red, or white in the same spot.' },
                { id: 'abcde_diameter', label: 'D — Diameter > 6mm', desc: 'Larger than a pencil eraser (approx 6mm across).' },
                { id: 'abcde_evolution', label: 'E — Evolution', desc: 'Noticeable enlargement, elevation, or change in appearance recently.' },
                { id: 'bleeding', label: 'Bleeding / Oozing', desc: 'Spontaneous bleeding or crusting without physical injury.' },
              ].map((crit) => (
                <label
                  key={crit.id}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer select-none transition-all ${
                    branchData[crit.id]
                      ? 'border-teal-700 bg-teal-50/50 ring-2 ring-teal-700/20'
                      : 'border-slate-200/80 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={branchData[crit.id]}
                    onChange={() => toggleBranch(crit.id)}
                    className="mt-0.5 rounded text-teal-700 focus:ring-teal-700 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-900">{crit.label}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{crit.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Rash Branch */}
          {complaint === 'red_rash' && (
            <div className="space-y-2.5">
              {[
                { id: 'annular_ring', label: 'Annular Ring Pattern', desc: 'Circular shape with raised scaly edge and central clearing (Tinea / Ringworm).' },
                { id: 'contact_allergen', label: 'Contact Trigger', desc: 'Started after contact with new cosmetics, soaps, detergents, plants, or pets.' },
                { id: 'flexural_folds', label: 'Flexural Localization', desc: 'Located primarily in skin creases (inner elbows, neck, behind knees).' },
              ].map((crit) => (
                <label
                  key={crit.id}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer select-none transition-all ${
                    branchData[crit.id]
                      ? 'border-teal-700 bg-teal-50/50 ring-2 ring-teal-700/20'
                      : 'border-slate-200/80 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={branchData[crit.id]}
                    onChange={() => toggleBranch(crit.id)}
                    className="mt-0.5 rounded text-teal-700 focus:ring-teal-700 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-900">{crit.label}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{crit.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Scaly Plaque Branch */}
          {complaint === 'scaly_plaque' && (
            <div className="space-y-2.5">
              {[
                { id: 'extensor_elbow_knee', label: 'Extensor Surface Distribution', desc: 'Located over outer elbows, knees, or lower back (Psoriasis hallmark).' },
                { id: 'flexural_folds', label: 'Flexural / Crease Involvement', desc: 'Found within skin folds, causing cracked or lichenified patches.' },
              ].map((crit) => (
                <label
                  key={crit.id}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer select-none transition-all ${
                    branchData[crit.id]
                      ? 'border-teal-700 bg-teal-50/50 ring-2 ring-teal-700/20'
                      : 'border-slate-200/80 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={branchData[crit.id]}
                    onChange={() => toggleBranch(crit.id)}
                    className="mt-0.5 rounded text-teal-700 focus:ring-teal-700 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-900">{crit.label}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{crit.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Facial Flare Branch */}
          {complaint === 'facial_flare' && (
            <div className="space-y-2.5">
              {[
                { id: 'flushing_spicy_heat', label: 'Flushing Provoked by Heat/Sun', desc: 'Sudden facial erythema provoked by hot drinks, spices, alcohol, or sun (Rosacea).' },
                { id: 'comedones_blackheads', label: 'Comedones & Pustules', desc: 'Blocked pores (blackheads/whiteheads) with inflammatory papules (Acne).' },
              ].map((crit) => (
                <label
                  key={crit.id}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer select-none transition-all ${
                    branchData[crit.id]
                      ? 'border-teal-700 bg-teal-50/50 ring-2 ring-teal-700/20'
                      : 'border-slate-200/80 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={branchData[crit.id]}
                    onChange={() => toggleBranch(crit.id)}
                    className="mt-0.5 rounded text-teal-700 focus:ring-teal-700 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-900">{crit.label}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{crit.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          <button
            onClick={() => setCurrentStep(6)}
            className="w-full py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Continue to Red-Flag Check</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 6: Prior Treatments & Red Flags */}
      {currentStep === 6 && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Prior Care &amp; Safety Screening</h2>
            <p className="text-xs text-slate-500 mt-1">Screening for acute systemic symptoms and prior interventions.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Prior Treatments or Creams (Optional)
            </label>
            <input
              type="text"
              value={priorTreatments}
              onChange={(e) => setPriorTreatments(e.target.value)}
              placeholder="e.g. Hydrocortisone 1%, moisturizer, over-the-counter antifungal..."
              className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-rose-700 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Emergency Warning Signs (Select if any apply)
            </label>
            <div className="space-y-2">
              {[
                { id: 'high_fever', label: 'High Fever (> 101°F / 38.5°C) with chills' },
                { id: 'facial_swelling', label: 'Rapid facial/lip angioedema or difficulty breathing' },
                { id: 'rapid_purpura', label: 'Sudden dark purple/black bruises spreading rapidly' },
              ].map((flag) => {
                const isSelected = redFlags.includes(flag.id);
                return (
                  <button
                    key={flag.id}
                    type="button"
                    onClick={() => toggleRedFlag(flag.id)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50 text-rose-900 font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{flag.label}</span>
                    <span className="font-bold">{isSelected ? '⚠️ Selected' : '+'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setCurrentStep(7)}
            className="w-full py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Review Assessment Summary</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 7: Intake Summary & Confirmation */}
      {currentStep === 7 && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold mb-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Clinical Intake Ready</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Review Your Clinical Profile</h2>
            <p className="text-xs text-slate-500 mt-1">Please confirm the details before proceeding to photography.</p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-3.5 text-xs text-slate-700">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Chief Complaint</span>
              <span className="font-bold text-slate-900">
                {CHIEF_COMPLAINTS.find((c) => c.id === complaint)?.title}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Anatomical Region</span>
              <span className="font-bold text-slate-900 capitalize">{location.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Timeline</span>
              <span className="font-bold text-slate-900">{DURATIONS.find((d) => d.id === duration)?.title}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Symptomatic Sensations</span>
              <span className="font-bold text-slate-900">{sensations.join(', ')}</span>
            </div>

            {redFlags.length > 0 && (
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 font-semibold text-[11px]">
                ⚠️ Critical warning signs noted: {redFlags.join(', ')}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
            >
              Edit Responses
            </button>
            <button
              onClick={handleFinalSubmit}
              className="flex-1 py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <span>Confirm &amp; Proceed to Photography</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
