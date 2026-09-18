import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Check, AlertTriangle, Sparkles, ShieldCheck, Sun, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import InteractiveCompanion from './InteractiveCompanion';

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

const FITZPATRICK_TYPES = [
  {
    id: 'type_i_ii',
    title: 'Type I – II: Fair to Light Complexion',
    desc: 'Burns very easily, tans minimally; pale or fair baseline.',
    swatch: '#FDE4CE',
    border: '#E3C1A4',
    badge: 'Baseline Phototype',
  },
  {
    id: 'type_iii',
    title: 'Type III: Medium / Olive Tone',
    desc: 'Burns moderately, tans gradually to light olive.',
    swatch: '#E2B889',
    border: '#C89B66',
    badge: 'Baseline Phototype',
  },
  {
    id: 'type_iv',
    title: 'Type IV: Indian Wheatish / Light Brown',
    desc: 'Burns minimally, tans easily. Erythema presents with violaceous or brown undertones.',
    swatch: '#BA8754',
    border: '#9C6C38',
    badge: 'High Indian Incidence (Calibrated)',
  },
  {
    id: 'type_v',
    title: 'Type V: Indian Brown / Medium Dark',
    desc: 'Rarely burns, tans darkly. High melanin baseline; post-inflammatory hyperpigmentation common.',
    swatch: '#8C5427',
    border: '#6F3D18',
    badge: 'High Indian Incidence (Calibrated)',
  },
  {
    id: 'type_vi',
    title: 'Type VI: Deep Brown / Melanated Complexion',
    desc: 'Never burns, deeply pigmented skin. Inflammation manifests as dark violaceous or black patches.',
    swatch: '#4A2B14',
    border: '#341B0A',
    badge: 'High Indian Incidence (Calibrated)',
  },
];

const LOCATIONS = [
  { id: 'face', title: 'Face & Neck', desc: 'Cheeks, forehead, nose, or neck region' },
  { id: 'scalp', title: 'Scalp', desc: 'Hairline or scalp area' },
  { id: 'trunk', title: 'Trunk & Torso', desc: 'Chest, abdomen, upper back, or lower back' },
  { id: 'arms_hands', title: 'Arms & Hands', desc: 'Shoulders, outer elbows, forearms, or hands' },
  { id: 'legs_feet', title: 'Legs & Feet', desc: 'Thighs, knees, calves, or feet/toes' },
  { id: 'groin_folds', title: 'Groin & Flexural Creases', desc: 'Inner thighs, groin, armpits, or under-folds' },
];

const DURATIONS = [
  { id: 'acute', title: 'Acute (< 48 Hours)', desc: 'Suddenly appeared within the last 1–2 days' },
  { id: 'subacute', title: 'Subacute (1 to 4 Weeks)', desc: 'Present for several days up to a month' },
  { id: 'chronic', title: 'Chronic (> 1 Month)', desc: 'Long-standing lesion or recurring flare-up' },
];

const SENSATIONS = [
  { id: 'itch', label: 'Pruritus / Itching', desc: 'Persistent desire to scratch or scrape' },
  { id: 'burning', label: 'Burning or Stinging', desc: 'Hot, stinging sensation or irritation' },
  { id: 'pain', label: 'Sharp Pain or Tenderness', desc: 'Hurts when touched, pressed, or rubbed' },
  { id: 'bleeding', label: 'Bleeding or Oozing', desc: 'Spontaneous bleeding or fluid discharge' },
  { id: 'asymptomatic', label: 'Asymptomatic (No Sensation)', desc: 'No pain, itching, or physical irritation' },
];

export default function StepWizard({ onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;

  // Questionnaire States
  const [complaint, setComplaint] = useState('');
  const [fitzpatrick, setFitzpatrick] = useState('type_iv');
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
    tropical_humidity: false,
    otc_steroid_use: false,
  });
  const [priorTreatments, setPriorTreatments] = useState('');
  const [redFlags, setRedFlags] = useState([]);

  // Micro-interaction states
  const [animatingId, setAnimatingId] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Soft Audio Feedback synthesizer using Web Audio API (cached singleton context)
  const audioCtxRef = useRef(null);
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch (e) {
      // Audio context policy fallback
    }
  };

  // Keyboard shortcut navigation (Left Arrow / Escape to go back)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'Escape') {
        if (currentStep > 1) {
          setCurrentStep((prev) => prev - 1);
        } else if (onCancel) {
          onCancel();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, onCancel]);

  // 1-Click Auto-Advance Handler (250ms Active Highlight Transition)
  const handleAutoSelect = (setter, value, optionId) => {
    setter(value);
    setAnimatingId(optionId);
    playChime();

    setTimeout(() => {
      setAnimatingId(null);
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }, 250);
  };

  const toggleSensation = (id) => {
    playChime();
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
    playChime();
    setBranchData((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleRedFlag = (id) => {
    playChime();
    setRedFlags((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleFinalSubmit = () => {
    const payload = {
      chief_complaint: complaint || 'mole_spot',
      fitzpatrick_tone: fitzpatrick || 'type_iv',
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
      {/* Sticky Wizard Header with Prominent Back Navigation */}
      <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md pt-2 pb-4 mb-5 border-b border-slate-200/60">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2.5">
          <button
            onClick={() => {
              if (currentStep > 1) {
                setCurrentStep((prev) => prev - 1);
              } else if (onCancel) {
                onCancel();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 transition-all shadow-2xs group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
            <span>{currentStep === 1 ? 'Cancel Assessment' : `Back to Step ${currentStep - 1}`}</span>
            <kbd className="hidden sm:inline text-[9px] px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-400">
              Esc / &larr;
            </kbd>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-slate-600 font-bold">
              {currentStep <= totalSteps ? `Step ${currentStep} of ${totalSteps}` : 'Intake Complete'}
            </span>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
              title={soundEnabled ? 'Mute micro-interaction audio' : 'Enable audio feedback'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-teal-700" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Dynamic Animated Progress Bar */}
        <div className="w-full h-2 bg-slate-200/90 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-teal-700 to-emerald-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${currentStep > totalSteps ? 100 : progressPct}%` }}
          />
        </div>
      </div>

      {/* Pillar 2: Interactive Mascot / Medical Companion (Dr. Elena Vance) */}
      <InteractiveCompanion
        step={currentStep}
        complaint={complaint}
        fitzpatrick={fitzpatrick}
        location={location}
        duration={duration}
        sensations={sensations}
        branchData={branchData}
        priorTreatments={priorTreatments}
        redFlags={redFlags}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />

      {/* STEP 1: Chief Complaint (1-Click Auto-Advance) */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold uppercase tracking-wider mb-1">
              <span>Step 1: Clinical Presentation</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">What is your primary skin concern?</h2>
            <p className="text-xs text-slate-500 mt-1">Tap a card to auto-advance. We calibrate our vision pipeline to your symptoms.</p>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-1">
            {CHIEF_COMPLAINTS.map((item) => {
              const isSelected = complaint === item.id;
              const isAnimating = animatingId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleAutoSelect(setComplaint, item.id, item.id)}
                  className={`min-h-[72px] p-4 rounded-2xl border text-left flex items-center gap-4 transition-all duration-200 cursor-pointer ${
                    isAnimating || isSelected
                      ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-600/30 scale-[1.01] shadow-md'
                      : 'border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50/20 hover:shadow-xs'
                  }`}
                >
                  <span className="text-2xl p-2.5 bg-slate-50 rounded-xl shrink-0 border border-slate-100">{item.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{item.subtitle}</p>
                  </div>
                  {(isSelected || isAnimating) && (
                    <div className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center shrink-0 animate-scale-in">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: Fitzpatrick Indian Skin Phototype Calibration (1-Click Auto-Advance) */}
      {currentStep === 2 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Sun className="w-3 h-3 text-amber-500" />
              <span>Step 2: Indian Skin Calibration</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Select your natural skin phototype</h2>
            <p className="text-xs text-slate-500 mt-1">
              In darker Indian skin (Types IV–VI), erythema appears violaceous or dark brown rather than pink. Selecting your tone calibrates our Melanin Index normalizer.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5 pt-1">
            {FITZPATRICK_TYPES.map((type) => {
              const isSelected = fitzpatrick === type.id;
              const isAnimating = animatingId === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleAutoSelect(setFitzpatrick, type.id, type.id)}
                  className={`min-h-[64px] p-3.5 rounded-2xl border text-left flex items-center gap-3.5 transition-all duration-200 cursor-pointer ${
                    isAnimating || isSelected
                      ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-600/30 scale-[1.01] shadow-md'
                      : 'border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50/60'
                  }`}
                >
                  {/* Visual Indian Skin Tone Swatch */}
                  <div
                    className="w-9 h-9 rounded-xl shrink-0 shadow-xs border-2 flex items-center justify-center"
                    style={{ backgroundColor: type.swatch, borderColor: type.border }}
                  >
                    {(isSelected || isAnimating) && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-xs text-slate-900">{type.title}</h3>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full border ${
                        type.id.includes('iv') || type.id.includes('v') || type.id.includes('vi')
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {type.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{type.desc}</p>
                  </div>

                  {(isSelected || isAnimating) && (
                    <div className="w-5 h-5 rounded-full bg-teal-700 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: Anatomical Location & Spread */}
      {currentStep === 3 && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold uppercase tracking-wider mb-1">
              <span>Step 3: Anatomical Region</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Where is it located on your body?</h2>
            <p className="text-xs text-slate-500 mt-1">Select pattern and tap your anatomical region to auto-advance.</p>
          </div>

          <div className="space-y-4">
            {/* Distribution Pattern Selector (Positioned prominently above locations) */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
                <span>Distribution Pattern</span>
                <span className="text-[10px] text-slate-500 font-normal">Choose spot distribution</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    playChime();
                    setDistribution('single');
                  }}
                  className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                    distribution === 'single'
                      ? 'border-teal-700 bg-white text-teal-900 ring-2 ring-teal-700/20 shadow-xs'
                      : 'border-slate-200 bg-white/60 text-slate-700 hover:bg-white'
                  }`}
                >
                  Single Isolated Spot
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playChime();
                    setDistribution('multiple');
                  }}
                  className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                    distribution === 'multiple'
                      ? 'border-teal-700 bg-white text-teal-900 ring-2 ring-teal-700/20 shadow-xs'
                      : 'border-slate-200 bg-white/60 text-slate-700 hover:bg-white'
                  }`}
                >
                  Multiple / Scattered
                </button>
              </div>
            </div>

            {/* Anatomical Locations (1-Click Auto-Advance) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {LOCATIONS.map((loc) => {
                const isSelected = location === loc.id;
                const isAnimating = animatingId === loc.id;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => handleAutoSelect(setLocation, loc.id, loc.id)}
                    className={`min-h-[64px] p-3.5 rounded-xl border text-left flex items-center justify-between transition-all duration-200 cursor-pointer ${
                      isAnimating || isSelected
                        ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-600/30 scale-[1.01] shadow-sm'
                        : 'border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-xs text-slate-900">{loc.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{loc.desc}</p>
                    </div>
                    {(isSelected || isAnimating) && <Check className="w-4 h-4 text-teal-700" />}
                  </button>
                );
              })}
            </div>

            {/* Direct Advance if Location Already Selected */}
            {location && (
              <button
                type="button"
                onClick={() => {
                  playChime();
                  setCurrentStep(4);
                }}
                className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <span>Continue to Timeline ({LOCATIONS.find(l => l.id === location)?.title || 'Selected'}) &rarr;</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: Onset & Chronology (1-Click Auto-Advance) */}
      {currentStep === 4 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold uppercase tracking-wider mb-1">
              <span>Step 4: Timeline</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">How long have you noticed this?</h2>
            <p className="text-xs text-slate-500 mt-1">Timeline helps differentiate acute contact/viral reactions from chronic dermatoses.</p>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-1">
            {DURATIONS.map((dur) => {
              const isSelected = duration === dur.id;
              const isAnimating = animatingId === dur.id;
              return (
                <button
                  key={dur.id}
                  type="button"
                  onClick={() => handleAutoSelect(setDuration, dur.id, dur.id)}
                  className={`min-h-[64px] p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 cursor-pointer ${
                    isAnimating || isSelected
                      ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-600/30 scale-[1.01] shadow-md'
                      : 'border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{dur.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{dur.desc}</p>
                  </div>
                  {(isSelected || isAnimating) && (
                    <div className="w-5 h-5 rounded-full bg-teal-700 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 5: Sensation Profile (Multi-Select with Confirm) */}
      {currentStep === 5 && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold uppercase tracking-wider mb-1">
              <span>Step 5: Sensations</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">What sensations do you experience?</h2>
            <p className="text-xs text-slate-500 mt-1">Select all sensations that apply, then tap Confirm &amp; Continue.</p>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {SENSATIONS.map((sens) => {
              const isSelected = sensations.includes(sens.id);
              return (
                <button
                  key={sens.id}
                  type="button"
                  onClick={() => toggleSensation(sens.id)}
                  className={`min-h-[64px] p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-teal-700 bg-teal-50/50 ring-2 ring-teal-700/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
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
            type="button"
            onClick={() => {
              playChime();
              setCurrentStep(6);
            }}
            disabled={sensations.length === 0}
            className="w-full py-3.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Confirm &amp; Continue to Clinical Factors &rarr;</span>
          </button>
        </div>
      )}

      {/* STEP 6: Targeted Diagnostic & Tropical Realities Drill-Down */}
      {currentStep === 6 && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold uppercase tracking-wider mb-1">
              <span>Step 6: Clinical Factors</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Diagnostic Pathway &amp; Triggers</h2>
            <p className="text-xs text-slate-500 mt-1">
              Select specific hallmarks matching your presentation to hone the Bayesian diagnostic model.
            </p>
          </div>

          {/* Mole ABCDE Branch */}
          {complaint === 'mole_spot' && (
            <div className="space-y-2.5">
              {[
                { id: 'abcde_asymmetry', label: 'A — Asymmetry', desc: 'One half does not match the other in shape or contour.' },
                { id: 'abcde_border', label: 'B — Border Irregularity', desc: 'Edges are ragged, notched, scalloped, or poorly defined.' },
                { id: 'abcde_color', label: 'C — Color Variegation', desc: 'Multiple shades of brown, black, blue, red, or white in the same lesion.' },
                { id: 'abcde_diameter', label: 'D — Diameter > 6mm', desc: 'Larger than a pencil eraser (approx 6mm across).' },
                { id: 'abcde_evolution', label: 'E — Evolution / Rapid Change', desc: 'Noticeable enlargement, elevation, or bleeding recently.' },
              ].map((crit) => (
                <label
                  key={crit.id}
                  className={`min-h-[64px] p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer select-none transition-all ${
                    branchData[crit.id]
                      ? 'border-teal-700 bg-teal-50/50 ring-2 ring-teal-700/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={branchData[crit.id]}
                    onChange={() => toggleBranch(crit.id)}
                    className="mt-1 rounded text-teal-700 focus:ring-teal-700 w-4 h-4"
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
                { id: 'annular_ring', label: 'Annular Ring Pattern', desc: 'Circular lesion with raised scaly edge and central clearing (Tinea / Ringworm hallmark).' },
                { id: 'contact_allergen', label: 'Contact Trigger', desc: 'Started after contact with cosmetics, soaps, detergents, plants, or pets.' },
                { id: 'flexural_folds', label: 'Flexural Crease Localization', desc: 'Located primarily in skin creases (inner elbows, neck, groin, behind knees).' },
              ].map((crit) => (
                <label
                  key={crit.id}
                  className={`min-h-[64px] p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer select-none transition-all ${
                    branchData[crit.id]
                      ? 'border-teal-700 bg-teal-50/50 ring-2 ring-teal-700/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={branchData[crit.id]}
                    onChange={() => toggleBranch(crit.id)}
                    className="mt-1 rounded text-teal-700 focus:ring-teal-700 w-4 h-4"
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
                { id: 'extensor_elbow_knee', label: 'Extensor Surface Distribution', desc: 'Located over outer elbows, knees, or lower back (hallmark of Plaque Psoriasis).' },
                { id: 'flexural_folds', label: 'Flexural / Crease Involvement', desc: 'Found in skin folds, with moist cracked or lichenified patches.' },
              ].map((crit) => (
                <label
                  key={crit.id}
                  className={`min-h-[64px] p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer select-none transition-all ${
                    branchData[crit.id]
                      ? 'border-teal-700 bg-teal-50/50 ring-2 ring-teal-700/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={branchData[crit.id]}
                    onChange={() => toggleBranch(crit.id)}
                    className="mt-1 rounded text-teal-700 focus:ring-teal-700 w-4 h-4"
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
                { id: 'flushing_spicy_heat', label: 'Flushing Provoked by Heat/Spices/Sun', desc: 'Sudden facial erythema provoked by hot drinks, spices, sunlight, or alcohol (Rosacea).' },
                { id: 'comedones_blackheads', label: 'Comedones & Pustules', desc: 'Blocked pores (blackheads/whiteheads) with inflammatory papules (Acne Vulgaris).' },
              ].map((crit) => (
                <label
                  key={crit.id}
                  className={`min-h-[64px] p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer select-none transition-all ${
                    branchData[crit.id]
                      ? 'border-teal-700 bg-teal-50/50 ring-2 ring-teal-700/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={branchData[crit.id]}
                    onChange={() => toggleBranch(crit.id)}
                    className="mt-1 rounded text-teal-700 focus:ring-teal-700 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-900">{crit.label}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{crit.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Indian Dermatological Realities: Tropical Humidity & Steroid Misuse */}
          <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-amber-900">Tropical Climate &amp; Prior Creams</span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                Indian Clinical Priors
              </span>
            </div>

            <label className="flex items-start gap-3 cursor-pointer text-xs select-none">
              <input
                type="checkbox"
                checked={branchData.tropical_humidity}
                onChange={() => toggleBranch('tropical_humidity')}
                className="mt-0.5 rounded text-teal-700 focus:ring-teal-700 w-4 h-4"
              />
              <div>
                <span className="font-semibold text-slate-900">Tropical humidity / high sweat retention</span>
                <p className="text-[11px] text-slate-500">Living in a hot/humid climate or wearing tight occlusive synthetic clothing.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer text-xs select-none">
              <input
                type="checkbox"
                checked={branchData.otc_steroid_use}
                onChange={() => toggleBranch('otc_steroid_use')}
                className="mt-0.5 rounded text-teal-700 focus:ring-teal-700 w-4 h-4"
              />
              <div>
                <span className="font-semibold text-slate-900">Used OTC steroid creams (Betnovate, Quadriderm, Panderm)</span>
                <p className="text-[11px] text-slate-500">Steroid creams applied on fungal rashes suppress redness and trigger Tinea Incognito.</p>
              </div>
            </label>
          </div>

          <button
            type="button"
            onClick={() => {
              playChime();
              setCurrentStep(7);
            }}
            className="w-full py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Continue to Safety Screening &rarr;</span>
          </button>
        </div>
      )}

      {/* STEP 7: Prior Treatments & Emergency Red Flags */}
      {currentStep === 7 && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold uppercase tracking-wider mb-1">
              <span>Step 7: Safety Screening</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Prior Care &amp; Red-Flag Safety</h2>
            <p className="text-xs text-slate-500 mt-1">Screening for acute systemic symptoms and prior interventions.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Prior Creams or Home Remedies Used (Optional)
            </label>
            <input
              type="text"
              value={priorTreatments}
              onChange={(e) => setPriorTreatments(e.target.value)}
              placeholder="e.g. Betnovate-N, Quadriderm, Clotrimazole, moisturizer, turmeric..."
              className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-rose-700 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Emergency Warning Signs (Select if any apply)
            </label>
            <div className="space-y-2">
              {[
                { id: 'high_fever', label: 'High Fever (> 101°F / 38.5°C) with chills or lethargy' },
                { id: 'facial_swelling', label: 'Rapid facial/lip angioedema or difficulty breathing' },
                { id: 'rapid_purpura', label: 'Sudden dark purple/black bruises spreading rapidly' },
              ].map((flag) => {
                const isSelected = redFlags.includes(flag.id);
                return (
                  <button
                    key={flag.id}
                    type="button"
                    onClick={() => toggleRedFlag(flag.id)}
                    className={`w-full min-h-[52px] p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50 text-rose-900 font-semibold shadow-2xs'
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
            type="button"
            onClick={() => {
              playChime();
              setCurrentStep(8);
            }}
            className="w-full py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Review Assessment Summary &rarr;</span>
          </button>
        </div>
      )}

      {/* STEP 8: Clinical Intake Summary & Confirmation */}
      {currentStep === 8 && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold mb-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Clinical Intake Ready</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Review Your Clinical Profile</h2>
            <p className="text-xs text-slate-500 mt-1">Please confirm details before capturing your dermoscopic photograph.</p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs text-slate-700">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Chief Complaint</span>
              <span className="font-bold text-slate-900">
                {CHIEF_COMPLAINTS.find((c) => c.id === complaint)?.title || 'Pigmented Mole'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Skin Phototype</span>
              <span className="font-bold text-teal-800">
                {FITZPATRICK_TYPES.find((f) => f.id === fitzpatrick)?.title || 'Type IV (Wheatish)'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Anatomical Region</span>
              <span className="font-bold text-slate-900 capitalize">{location.replace('_', ' ') || 'Trunk'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Timeline</span>
              <span className="font-bold text-slate-900">
                {DURATIONS.find((d) => d.id === duration)?.title || 'Subacute'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Reported Sensations</span>
              <span className="font-bold text-slate-900">{sensations.join(', ') || 'Asymptomatic'}</span>
            </div>

            {branchData.otc_steroid_use && (
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 font-semibold text-[11px]">
                ⚠️ OTC Steroid Cream History Noted (Betnovate/Quadriderm) &bull; Tinea Incognito Flag Active
              </div>
            )}

            {redFlags.length > 0 && (
              <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 font-semibold text-[11px]">
                🚨 Critical warning signs noted: {redFlags.join(', ')}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
            >
              Edit Responses
            </button>
            <button
              type="button"
              onClick={handleFinalSubmit}
              className="flex-1 py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <span>Confirm &amp; Proceed to Photo Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
