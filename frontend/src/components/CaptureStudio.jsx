import React, { useState, useRef } from 'react';
import { Camera, UploadCloud, ArrowLeft, ArrowRight, RefreshCw, X, ShieldCheck, Sun, Crosshair } from 'lucide-react';

export default function CaptureStudio({ onPhotoCaptured, onAnalyze, onBack, isAnalyzing, photoPreview }) {
  const [dragActive, setDragActive] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target.result;
      onPhotoCaptured({ file, base64: b64, preview: b64 });
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    setCameraError(null);
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Unable to access webcam. Please verify browser permissions or upload an image file.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setCameraError(null);
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const b64 = canvas.toDataURL('image/jpeg', 0.95);
    stopCamera();
    onPhotoCaptured({ base64: b64, preview: b64 });
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200/80">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Intake Questions</span>
        </button>
        <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Step 2: Photography Studio
        </span>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Capture Dermoscopic Lesion Photo</h2>
        <p className="text-xs text-slate-500 mt-1">
          High-clarity clinical photography allows our deep vision models to resolve fine diagnostic borders and pigment variegation.
        </p>
      </div>

      {/* Clinical Photography Tips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-600">
          <Sun className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <span>Bright indirect daylight or even room lighting. Avoid flash glare.</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-600">
          <Crosshair className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
          <span>Hold steady 4–6 inches away. Keep the lesion centered in frame.</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>Real human skin photo required. Screenshots, web pages, and documents will be rejected.</span>
        </div>
      </div>

      {/* Main Studio Viewport */}
      {photoPreview ? (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 aspect-[4/3] max-h-[420px] flex items-center justify-center shadow-inner">
            <img src={photoPreview} alt="Captured dermoscopic lesion" className="w-full h-full object-contain" />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                <div className="w-12 h-12 border-3 border-teal-400 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-sm font-semibold tracking-wide">Executing Multimodal Bayesian Synthesis...</p>
                <p className="text-xs text-teal-300">Cross-referencing HAM10000 vision &amp; clinical intake history</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => onPhotoCaptured(null)}
              disabled={isAnalyzing}
              className="px-4 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" /> Re-take Photo
            </button>

            <button
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="flex-1 py-3.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg shadow-teal-700/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>{isAnalyzing ? 'Analyzing...' : 'Run Multimodal Clinical Analysis'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-all min-h-[320px] ${
            dragActive
              ? 'border-teal-700 bg-teal-50/50 scale-[0.99]'
              : 'border-slate-300 bg-white hover:border-slate-400 shadow-sm'
          }`}
        >
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />

          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 shadow-inner">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-base font-bold text-slate-900 mb-1">Upload Dermoscopic Photograph</h3>
          <p className="text-xs text-slate-500 max-w-sm mb-6">
            Drag and drop your high-resolution skin photo here, or browse from your device.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
            >
              Browse Files
            </button>

            <button
              type="button"
              onClick={startCamera}
              className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-sm"
            >
              <Camera className="w-4 h-4" />
              Open Live Viewfinder
            </button>
          </div>
        </div>
      )}

      {/* Live Viewfinder Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-teal-700" />
                Live Dermoscopic Viewfinder
              </h3>
              <button onClick={stopCamera} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {cameraError ? (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl mb-4">
                {cameraError}
              </div>
            ) : (
              <div className="relative aspect-[4/3] bg-black rounded-2xl overflow-hidden mb-4 border border-slate-800">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-10 border border-dashed border-white/60 rounded-2xl pointer-events-none flex items-center justify-center">
                  <span className="text-[10px] text-white/80 bg-black/50 px-2 py-0.5 rounded font-medium">
                    Center skin lesion here
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              {!cameraError && (
                <button
                  type="button"
                  onClick={captureSnapshot}
                  className="px-5 py-2.5 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Camera className="w-4 h-4" /> Capture Photo
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
