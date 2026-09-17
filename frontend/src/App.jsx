import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DisclaimerModal from './components/DisclaimerModal';
import LandingHero from './components/LandingHero';
import StepWizard from './components/StepWizard';
import CaptureStudio from './components/CaptureStudio';
import ClinicalDossier from './components/ClinicalDossier';
import ConsultationDrawer from './components/ConsultationDrawer';
import ReportModal from './components/ReportModal';
import { checkHealth, synthesizeMultimodal } from './services/api';

export default function App() {
  // Navigation & View State: 'landing' | 'wizard' | 'capture' | 'dossier'
  const [currentView, setCurrentView] = useState('landing');
  
  // Health & Model Configuration
  const [health, setHealth] = useState(null);
  const [apiKey, setApiKey] = useState('');

  // Assessment & Multimodal Data
  const [questionnaireData, setQuestionnaireData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);

  // Modals & Drawers
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    checkHealth().then((data) => setHealth(data));
  }, []);

  // Step 1 -> Step 2: User starts assessment from landing
  const handleStartAssessment = () => {
    setErrorMessage(null);
    setCurrentView('wizard');
  };

  // Step 2 -> Step 3: Intake questionnaire completed
  const handleWizardComplete = (data) => {
    setQuestionnaireData(data);
    setErrorMessage(null);
    setCurrentView('capture');
  };

  // Cancel wizard -> Return to landing
  const handleWizardCancel = () => {
    setCurrentView('landing');
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

      setAnalysisResults(results);
      setCurrentView('dossier');
    } catch (err) {
      console.error('Multimodal synthesis error:', err);
      setErrorMessage(err.message || 'Failed to complete multimodal analysis. Please verify your photo and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset entire flow back to landing for a new patient
  const handleResetAssessment = () => {
    setQuestionnaireData(null);
    setSelectedImage(null);
    setAnalysisResults(null);
    setIsDrawerOpen(false);
    setIsReportModalOpen(false);
    setErrorMessage(null);
    setCurrentView('landing');
  };

  return (
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

        {/* STAGE 2: Step-by-Step Clinical Intake Wizard */}
        {currentView === 'wizard' && (
          <StepWizard
            onComplete={handleWizardComplete}
            onCancel={handleWizardCancel}
          />
        )}

        {/* STAGE 3: Dermoscopic Photo Studio */}
        {currentView === 'capture' && (
          <CaptureStudio
            photoPreview={selectedImage?.preview}
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
            originalImagePreview={selectedImage?.preview}
            onOpenChat={() => setIsDrawerOpen(true)}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onStartNewAssessment={handleResetAssessment}
            onBackToCapture={() => setCurrentView('capture')}
          />
        )}
      </main>

      {/* Slide-over Consultation Chat Drawer */}
      <ConsultationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        visionContext={analysisResults}
        questionnaireContext={questionnaireData}
        apiKey={apiKey}
      />

      {/* Report PDF Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        classificationResult={analysisResults}
        questionnaireData={questionnaireData}
        originalImagePreview={selectedImage?.preview}
      />

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
  );
}
