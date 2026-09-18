import React, { useState, useEffect } from 'react';
import { Stethoscope, Sparkles, AlertTriangle, ShieldCheck, Volume2, VolumeX, X, MessageSquareHeart } from 'lucide-react';

export default function InteractiveCompanion({
  step = 1,
  complaint = '',
  fitzpatrick = '',
  location = '',
  duration = '',
  sensations = [],
  branchData = {},
  priorTreatments = '',
  redFlags = [],
  soundEnabled = true,
  onToggleSound,
}) {
  const [comment, setComment] = useState('Hello! I am Dr. Elena Vance, your clinical companion. I am analyzing your responses in real time.');
  const [mood, setMood] = useState('listening'); // 'listening' | 'insight' | 'alert' | 'reassurance'
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // 1. High-Priority Emergency & Clinical Alerts (take precedence on any step)
    if (redFlags && redFlags.length > 0) {
      setMood('alert');
      setComment('🚨 Emergency indicator selected! Systemic red flags prioritize urgent, same-day physician evaluation.');
      return;
    }

    if (sensations.includes('bleeding') || branchData?.bleeding) {
      setMood('alert');
      setComment('⚠️ Spontaneous bleeding is a critical clinical hallmark that activates our urgent oncology biopsy protocol.');
      return;
    }

    const treatmentsLower = (priorTreatments || '').toLowerCase();
    if (
      treatmentsLower.includes('betnovate') ||
      treatmentsLower.includes('quadriderm') ||
      treatmentsLower.includes('panderm') ||
      treatmentsLower.includes('clobetasol') ||
      treatmentsLower.includes('steroid') ||
      branchData?.otc_steroid_use
    ) {
      setMood('alert');
      setComment('⚠️ Noted OTC steroid cream history: Applying Betnovate/Quadriderm on ringworm suppresses inflammation and causes Tinea Incognito.');
      return;
    }

    // 2. Step-Specific Clinical Intelligence & Real-Time Commentary
    if (step === 1) {
      if (complaint === 'mole_spot') {
        setMood('insight');
        setComment('Evaluating pigmented lesion. We will screen carefully for ABCDE asymmetry, border irregularity, and color variegation.');
      } else if (complaint === 'red_rash') {
        setMood('insight');
        setComment('Assessing erythematous rash. I will analyze distribution, annular ring margins, and possible contact irritants.');
      } else if (complaint === 'scaly_plaque') {
        setMood('insight');
        setComment('Plaque presentation noted. Checking for silvery micaceous scales and extensor vs flexural surface involvement.');
      } else if (complaint === 'facial_flare') {
        setMood('insight');
        setComment('Facial presentation noted. Facial skin has higher vascularity and sebaceous density (acne vs rosacea pathways).');
      } else {
        setMood('listening');
        setComment('Hello! I am Dr. Elena Vance. Tap your skin concern above to start our 1-click calibrated triage.');
      }
      return;
    }

    if (step === 2) {
      setMood('insight');
      if (fitzpatrick === 'type_iv') {
        setComment('Type IV (Indian Wheatish) calibrated: In light-to-medium brown skin, erythema manifests with violaceous and brown undertones.');
      } else if (fitzpatrick === 'type_v') {
        setComment('Type V (Indian Brown) calibrated: High baseline melanin reduces erythema contrast; monitoring post-inflammatory hyperpigmentation.');
      } else if (fitzpatrick === 'type_vi') {
        setComment('Type VI (Deep Brown) calibrated: Inflammation presents as dark violaceous or black patches. Melanin index contrast normalizer active.');
      } else {
        setComment('Calibrating for skin phototype to prevent mistaking natural constitutional melanin for dysplastic malignancy.');
      }
      return;
    }

    if (step === 3) {
      setMood('insight');
      if (location === 'groin_folds') {
        setComment('Groin & flexural crease localization aligns with intertrigo, friction moisture, or fungal Tinea cruris.');
      } else if (location === 'face') {
        setComment('Facial region selected. Prioritizing acneiform lesions, contact dermatitis, and rosacea.');
      } else if (location === 'scalp') {
        setComment('Scalp presentation noted. Checking for follicular involvement, seborrheic dermatitis, or scalp psoriasis.');
      } else if (location === 'arms_hands' || location === 'legs_feet') {
        setComment('Extremity involvement noted. Monitoring extensor plaque distribution vs acral contact patterns.');
      } else {
        setComment('Select distribution and tap your anatomical region. Body site likelihoods sharpen our Bayesian priors.');
      }
      return;
    }

    if (step === 4) {
      setMood('insight');
      if (duration === 'acute') {
        setComment('Acute onset (< 48 hours) differentiates infectious eruptions and allergic contact reactions from chronic plaques.');
      } else if (duration === 'chronic') {
        setComment('Chronic persistence (> 1 month) prioritizes stable inflammatory plaques, psoriasis, or chronic eczematous lichenification.');
      } else if (duration === 'subacute') {
        setComment('Subacute timeline (1–4 weeks) is typical for advancing dermatophytosis (Tinea) and subacute contact dermatitis.');
      } else {
        setComment('Timeline helps separate acute reactive flares from long-standing chronic inflammatory disorders.');
      }
      return;
    }

    if (step === 5) {
      if (sensations.includes('itch') && sensations.includes('burning')) {
        setMood('insight');
        setComment('Coexisting pruritus and burning suggests acute allergic contact sensitization or epidermal barrier breakdown.');
      } else if (sensations.includes('itch')) {
        setMood('listening');
        setComment('Pruritus (itching) noted. Avoid scratching to preserve your stratum corneum and prevent secondary staph impetigo.');
      } else if (sensations.includes('pain')) {
        setMood('insight');
        setComment('Pain or tenderness noted. Inflammatory papules, furuncles, or herpes zoster often present with sharp focal pain.');
      } else if (sensations.includes('asymptomatic')) {
        setMood('listening');
        setComment('Asymptomatic presentation: absence of itching or pain is characteristic of benign nevi and early dysplastic lesions.');
      } else {
        setMood('listening');
        setComment('Select all sensations you experience, then tap Confirm & Continue.');
      }
      return;
    }

    if (step === 6) {
      setMood('insight');
      if (branchData?.annular_ring) {
        setComment('🔬 Annular ring with active raised scaly margin strongly correlates with superficial fungal dermatophytosis (Tinea / Ringworm).');
      } else if (branchData?.extensor_elbow_knee) {
        setComment('🩹 Extensor surface plaques over outer elbows or knees are a classic hallmark of Plaque Psoriasis.');
      } else if (branchData?.flexural_folds) {
        setComment('Got it. Flexural crease localization (inner elbows, behind knees, groin) aligns with Atopic Dermatitis and sweat friction.');
      } else if (branchData?.contact_allergen) {
        setComment('Noted potential contact trigger. Chemical detergents, fragrances, or plants are prime culprits in Contact Dermatitis.');
      } else if (branchData?.flushing_spicy_heat) {
        setComment('Flushing provoked by heat, spicy foods, or sun strongly supports erythematotelangiectatic Rosacea.');
      } else if (branchData?.tropical_humidity) {
        setComment('Tropical humidity and sweat retention significantly elevate fungal dermatophyte (Tinea) and miliaria priors.');
      } else {
        setComment('Select specific clinical hallmarks matching your presentation to hone the Bayesian diagnostic model.');
      }
      return;
    }

    if (step === 7) {
      setMood('listening');
      if (priorTreatments) {
        setComment('Noted prior treatments and home remedies. We adjust for steroid modification and barrier recovery.');
      } else {
        setComment('Safety screening: checking for systemic warning signs before generating your clinical profile.');
      }
      return;
    }

    if (step === 8) {
      setMood('insight');
      setComment('Intake complete! Please review your clinical summary below before capturing your dermoscopic photograph.');
      return;
    }

    // Default friendly state
    setMood('listening');
    setComment('I am actively correlating your symptoms with dermatological guidelines as you tap.');
  }, [step, complaint, fitzpatrick, location, duration, sensations, branchData, priorTreatments, redFlags]);

  if (isMinimized) {
    return (
      <button
        type="button"
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-5 right-5 z-40 p-3 bg-teal-800 text-white rounded-full shadow-xl hover:bg-teal-700 transition-all flex items-center gap-2 group animate-bounce-subtle"
        title="Open Dr. Elena Vance (Companion)"
      >
        <Stethoscope className="w-5 h-5 text-teal-300" />
        <span className="text-xs font-semibold pr-1 hidden group-hover:inline">Dr. Vance</span>
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-r from-teal-50/90 via-emerald-50/80 to-slate-50 p-3.5 rounded-2xl border border-teal-200/80 shadow-xs mb-6 relative transition-all duration-300">
      <div className="flex items-start gap-3">
        {/* Animated Companion Avatar */}
        <div className="relative shrink-0">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md transition-all ${
            mood === 'alert'
              ? 'bg-rose-600 ring-4 ring-rose-200 animate-pulse'
              : mood === 'insight'
              ? 'bg-amber-600 ring-4 ring-amber-100'
              : 'bg-teal-700 ring-4 ring-teal-100'
          }`}>
            {mood === 'alert' ? (
              <AlertTriangle className="w-5 h-5" />
            ) : mood === 'insight' ? (
              <Sparkles className="w-5 h-5" />
            ) : (
              <Stethoscope className="w-5 h-5" />
            )}
          </div>
          {/* Active listening breathing dot */}
          <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500" />
          </span>
        </div>

        {/* Dynamic Speech & Clinical Reaction */}
        <div className="flex-1 min-w-0 pr-8">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-bold text-xs text-slate-900 flex items-center gap-1">
              Dr. Elena Vance
              <span className="text-[10px] text-teal-700 font-semibold px-1.5 py-0.2 rounded-md bg-teal-100/70 border border-teal-200">
                DermaBot AI
              </span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Live Clinical Observation
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-normal transition-all duration-200">
            {comment}
          </p>
        </div>

        {/* Controls: Sound toggle & Minimize */}
        <div className="absolute top-3 right-3 flex items-center gap-1">
          {onToggleSound && (
            <button
              type="button"
              onClick={onToggleSound}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
              title={soundEnabled ? 'Mute micro-interaction audio' : 'Enable micro-interaction audio'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-teal-700" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
            title="Minimize companion"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
