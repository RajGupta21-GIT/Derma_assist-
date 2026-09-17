import React, { useState, useRef } from 'react';
import { UploadCloud, Camera, X, RefreshCw, AlertCircle } from 'lucide-react';

export default function ImageUploader({ onImageSelected, isAnalyzing, selectedImagePreview, questionnaireSubmitted }) {
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
      onImageSelected({ file, base64: b64, preview: b64 });
    };
    reader.readAsDataURL(file);
  };

  // Webcam Handlers
  const startCamera = async () => {
    setCameraError(null);
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Webcam access error:', err);
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

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const b64 = canvas.toDataURL('image/jpeg', 0.92);
    stopCamera();
    onImageSelected({ base64: b64, preview: b64 });
  };

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 transition-all ${
      !questionnaireSubmitted ? 'opacity-80' : ''
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">2. Dermoscopic Lesion Capture</h2>
          <p className="text-xs text-slate-500">
            {questionnaireSubmitted
              ? 'Upload a dermoscopic photo or capture live with your webcam for multimodal synthesis'
              : 'Please complete the clinical intake wizard above, then upload or capture your skin photo'}
          </p>
        </div>
        {selectedImagePreview && (
          <button
            onClick={() => onImageSelected(null)}
            className="text-xs font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Re-take Photo
          </button>
        )}
      </div>

      {/* Main Upload / Preview Box */}
      {selectedImagePreview ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900/5 aspect-[4/3] max-h-80 flex items-center justify-center">
          <img
            src={selectedImagePreview}
            alt="Selected skin capture"
            className="w-full h-full object-contain"
          />
          {isAnalyzing && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
              <div className="w-10 h-10 border-3 border-teal-400 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm font-semibold tracking-wide">Executing Multimodal Bayesian Synthesis...</p>
              <p className="text-xs text-teal-300">Cross-referencing HAM10000 vision & clinical intake data</p>
            </div>
          )}
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all ${
            dragActive
              ? 'border-teal-500 bg-teal-50/50 scale-[0.99]'
              : 'border-slate-300 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3 shadow-inner">
            <UploadCloud className="w-6 h-6" />
          </div>

          <p className="text-xs font-bold text-slate-800 mb-1">
            Drag & drop patient skin photo here, or{' '}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-teal-600 hover:text-teal-700 underline underline-offset-2"
            >
              browse files
            </button>
          </p>
          <p className="text-[11px] text-slate-500 max-w-xs mb-4">
            Supports high-resolution JPG, PNG, or WEBP dermoscopic captures
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={startCamera}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 transition-colors"
            >
              <Camera className="w-4 h-4 text-teal-600" />
              Live Webcam Capture
            </button>
          </div>
        </div>
      )}

      {/* Webcam Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-teal-600" />
                Live Dermoscopic Viewfinder
              </h3>
              <button
                onClick={stopCamera}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cameraError ? (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl mb-4">
                {cameraError}
              </div>
            ) : (
              <div className="relative aspect-[4/3] bg-black rounded-xl overflow-hidden mb-4 border border-slate-800">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-8 border border-dashed border-white/50 rounded-xl pointer-events-none flex items-center justify-center">
                  <span className="text-[10px] text-white/70 bg-black/40 px-2 py-0.5 rounded">
                    Position skin lesion inside box
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              {!cameraError && (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-md shadow-teal-600/20 flex items-center gap-1.5"
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
