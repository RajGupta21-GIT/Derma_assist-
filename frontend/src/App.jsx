import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import DisclaimerModal from './components/DisclaimerModal';
import LandingHero from './components/LandingHero';
import StepWizard from './components/StepWizard';
import CaptureStudio from './components/CaptureStudio';
import ClinicalDossier from './components/ClinicalDossier';
const ConsultationDrawer = React.lazy(() => import('./components/ConsultationDrawer'));
const ReportModal = React.lazy(() => import('./components/ReportModal'));
import { checkHealth, synthesizeMultimodal } from './services/api';

const SESSION_STORAGE_KEY = 'derma_assist_session';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Derma Assist UI Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto text-2xl font-bold shadow-inner">
              ⚠️
            </div>
            <h2 className="text-xl font-bold text-slate-900">Clinical Display Recovered</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              A temporary display error was safely intercepted ({this.state.error?.message || 'Interface display'}). Click below to cleanly refresh your assessment.
            </p>
            <button
              onClick={this.handleReset}
              className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl transition-all shadow-md"
            >
              Start Clean Patient Assessment
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const getInitialSession = () => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    }
  } catch (err) {
    console.warn('Could not read session storage:', err);
  }
  return null;
};

export default function App() {
  const session = getInitialSession();

  // Navigation & View State: 'landing' | 'wizard' | 'capture' | 'dossier'
  const [currentView, setCurrentView] = useState(session?.currentView || 'landing');
  
  // Health & Model Configuration
  const [health, setHealth] = useState(null);
  const [apiKey, setApiKey] = useState('');

  // Assessment & Multimodal Data
  const [questionnaireData, setQuestionnaireData] = useState(session?.questionnaireData || null);
  const [wizardStep, setWizardStep] = useState(session?.wizardStep || 1);
  const [selectedImage, setSelectedImage] = useState(session?.selectedImage || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(session?.analysisResults || null);

  // Modals & Drawers
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    checkHealth().then((data) => setHealth(data));
  }, []);

  // Synchronize state changes to sessionStorage with 250ms debounce and beforeunload immediate flush
  useEffect(() => {
    const saveToSession = () => {
      try {
        if (typeof window === 'undefined' || !window.sessionStorage) return;

        const serializableImage = selectedImage ? {
          base64: selectedImage.base64,
          preview: selectedImage.preview || selectedImage.base64,
        } : null;

        const sessionPayload = {
          currentView,
          questionnaireData,
          wizardStep,
          selectedImage: serializableImage,
          analysisResults,
        };
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionPayload));
      } catch (err) {
        console.warn('Failed to persist session to sessionStorage:', err);
        try {
          if (typeof window !== 'undefined' && window.sessionStorage) {
            const fallbackPayload = {
              currentView,
              questionnaireData,
              wizardStep,
              selectedImage: null,
              analysisResults,
            };
            window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(fallbackPayload));
          }
        } catch (fallbackErr) {
          console.warn('Fallback sessionStorage persistence failed:', fallbackErr);
        }
      }
    };

    const timer = setTimeout(saveToSession, 250);
    window.addEventListener('beforeunload', saveToSession);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeunload', saveToSession);
    };
  }, [currentView, questionnaireData, wizardStep, selectedImage, analysisResults]);

  // Step 1 -> Step 2: User starts assessment from landing
  const handleStartAssessment = () => {
    setErrorMessage(null);
    setWizardStep(1);
    setCurrentView('wizard');
  };

  // Intermediate wizard step change with draft responses (memoized to prevent child re-renders)
  const handleWizardStepChange = useCallback((step, draftData) => {
    setWizardStep(step);
    if (draftData) {
      setQuestionnaireData(draftData);
    }
  }, []);

  // Step 2 -> Step 3: Intake questionnaire completed
  const handleWizardComplete = (data) => {
    setQuestionnaireData(data);
    setErrorMessage(null);
    setCurrentView('capture');
  };

  // Cancel wizard -> Return to landing
  const handleWizardCancel = () => {
    handleResetAssessment();
  };

  // Step 3: Photo captured / uploaded
  const handlePhotoCaptured = (imageData) => {
    setSelectedImage(imageData);
    setErrorMessage(null);
  };

  // Step 3 -> Step 4: Run multimodal synthesis
  const handleRunAnalysis = async () => {
    if (!selectedImage) {
      setErrorMessage('Please capture or upload a dermoscopic skin photo before running synthesis.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const results = await synthesizeMultimodal({
        file: selectedImage.file,
        base64: selectedImage.base64,
        questionnaire: questionnaireData,
      });

      if (results.is_valid_skin === false) {
        setErrorMessage(results.error || 'No human skin tissue detected in the uploaded image. Please upload a clear clinical photograph of the affected skin area.');
        return;
      }

      setAnalysisResults(results);
      setCurrentView('dossier');
    } catch (err) {
      console.error('Multimodal synthesis error:', err);
      setErrorMessage(err.message || 'Failed to complete multimodal analysis. Please verify your photo and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset entire flow back to landing for a new patient and clear persisted session
  const handleResetAssessment = () => {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear sessionStorage:', e);
    }
    setQuestionnaireData(null);
    setWizardStep(1);
    setSelectedImage(null);
    setAnalysisResults(null);
    setIsDrawerOpen(false);
    setIsReportModalOpen(false);
    setErrorMessage(null);
    setCurrentView('landing');
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
        <DisclaimerModal />

        <Navbar
          health={health}
          currentView={currentView}
          onResetAssessment={handleResetAssessment}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Error notification banner */}
          {errorMessage && (
            <div className="max-w-3xl mx-auto mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center justify-between shadow-xs">
              <span>{errorMessage}</span>
              <button
                onClick={() => setErrorMessage(null)}
                className="font-bold ml-4 text-rose-800 hover:text-rose-950 p-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* STAGE 1: Landing & Protocol Overview */}
          {currentView === 'landing' && (
            <LandingHero onStartAssessment={handleStartAssessment} />
          )}

          {/* STAGE 2: Step-by-Step Clinical Intake Wizard with Reload Persistence */}
          {currentView === 'wizard' && (
            <StepWizard
              initialStep={wizardStep}
              initialData={questionnaireData}
              onStepChange={handleWizardStepChange}
              onComplete={handleWizardComplete}
              onCancel={handleWizardCancel}
            />
          )}

          {/* STAGE 3: Dermoscopic Photo Studio */}
          {currentView === 'capture' && (
            <CaptureStudio
              photoPreview={selectedImage?.preview || selectedImage?.base64}
              onPhotoCaptured={handlePhotoCaptured}
              onAnalyze={handleRunAnalysis}
              onBack={() => setCurrentView('wizard')}
              isAnalyzing={isAnalyzing}
            />
          )}

          {/* STAGE 4: Full-Width Clinical Referral Dossier */}
          {currentView === 'dossier' && (
            <ClinicalDossier
              results={analysisResults}
              questionnaireData={questionnaireData}
              originalImagePreview={selectedImage?.preview || selectedImage?.base64}
              onOpenChat={() => setIsDrawerOpen(true)}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onStartNewAssessment={handleResetAssessment}
              onBackToCapture={() => setCurrentView('capture')}
              apiKey={apiKey}
            />
          )}
        </main>

        {/* Slide-over Consultation Chat Drawer & PDF Modal */}
        <React.Suspense fallback={null}>
          {isDrawerOpen && (
            <ConsultationDrawer
              isOpen={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
              visionContext={analysisResults}
              questionnaireContext={questionnaireData}
              apiKey={apiKey}
            />
          )}

          {isReportModalOpen && (
            <ReportModal
              isOpen={isReportModalOpen}
              onClose={() => setIsReportModalOpen(false)}
              classificationResult={analysisResults}
              questionnaireData={questionnaireData}
              originalImagePreview={selectedImage?.preview}
            />
          )}
        </React.Suspense>

        {/* Subtle Clinical Footer */}
        <footer className="mt-auto border-t border-slate-200 bg-white py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <p>
              &copy; 2026 <strong>Derma Assist</strong> &bull; Clinical Dermatology Decision Support Platform
            </p>
            <p className="text-[11px] text-slate-400">
              Sequential Clinical Intake &bull; Deep Vision &bull; Bayesian Multimodal Fusion &bull; Grad-CAM Saliency
            </p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
