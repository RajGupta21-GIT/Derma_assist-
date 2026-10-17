import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  PhoneOff, 
  Activity, 
  Sparkles, 
  Stethoscope, 
  Send, 
  User, 
  Bot 
} from 'lucide-react';
import { sendChatMessage } from '../services/api';

export default function VoiceConsultModal({
  isOpen,
  onClose,
  visionContext,
  questionnaireContext,
  apiKey,
}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [conversation, setConversation] = useState([]);
  const [textFallback, setTextFallback] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [micError, setMicError] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);

  const recognitionRef = useRef(null);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const transcriptEndRef = useRef(null);
  const isMountedRef = useRef(true);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Initialize Voices with clean detachment on unmount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const v = window.speechSynthesis.getVoices();
        if (v && v.length > 0) {
          setAvailableVoices(v);
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        if (window.speechSynthesis) {
          window.speechSynthesis.onvoiceschanged = null;
          window.speechSynthesis.cancel();
        }
      };
    }
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setMicError(null);
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');
        setUserTranscript(transcript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicError('Microphone permission was denied. Please allow microphone access in your browser site settings, or type your question below.');
        } else if (event.error === 'network') {
          setMicError('Network issue for speech service. You can type your symptoms below.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      setIsSpeaking(false);
      setIsListening(false);
    };
  }, []);

  // Initial greeting when opened
  useEffect(() => {
    if (isOpen) {
      const topCond = visionContext?.top_condition;
      const initialGreeting = topCond
        ? `Hello! I am Dr. Elena Vance. I am reviewing your case for ${topCond}. How can I assist you with your skin symptoms today?`
        : `Hello! I am Dr. Elena Vance, your dermatology clinical co-pilot. How can I help you today?`;

      setConversation([
        {
          id: 'call-greeting',
          sender: 'doctor',
          text: initialGreeting,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      if (!voiceMuted) {
        speakResponse(initialGreeting);
      }
    } else {
      isOpenRef.current = false;
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      setIsSpeaking(false);
      setIsListening(false);
    }
  }, [isOpen]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, isProcessing, userTranscript]);

  // Memoized preferred voice selection (avoids full array linear traversal on every spoken sentence)
  const preferredVoices = useMemo(() => {
    const voices = availableVoices.length > 0 
      ? availableVoices 
      : (typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : []);

    if (!voices || voices.length === 0) return { hindi: null, english: null };

    // Search for authentic Indian Hindi speech synthesis engines
    const hindiVoice = voices.find(
      (v) => (v.lang === 'hi-IN' || v.lang.startsWith('hi')) && (
        v.name.includes('Google') ||
        v.name.includes('Swara') ||
        v.name.includes('Hemant') ||
        v.name.includes('Madhur') ||
        v.name.includes('Kalpana')
      )
    ) || voices.find(
      (v) => v.lang === 'hi-IN' || v.lang.startsWith('hi') || v.name.includes('Hindi') || v.name.includes('हिन्दी')
    ) || voices.find(
      // High quality Indian English fallback if Hindi voice pack not installed on Windows
      (v) => v.lang === 'en-IN' || v.name.includes('India') || v.name.includes('Heera') || v.name.includes('Ravi')
    ) || null;

    const englishVoice = voices.find(
      (v) => v.name.includes('Samantha') || v.name.includes('Google UK English Female') || (v.lang === 'en-US' && v.name.includes('Female'))
    ) || voices.find((v) => v.lang.startsWith('en')) || null;

    return { hindi: hindiVoice, english: englishVoice };
  }, [availableVoices]);

  // Voice synthesis (TTS)
  const speakResponse = (text) => {
    if (!synthRef.current || voiceMuted || !isMountedRef.current || !isOpenRef.current) return;
    synthRef.current.cancel();

    // Clean markdown symbols for clearer audio
    const cleanText = text
      .replace(/[#*_`~\[\]\(\)]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.98;
    utterance.pitch = 1.0;

    // Detect if the response is in Hindi (Devanagari characters or common Hindi words)
    const hasDevanagari = /[\u0900-\u097F]/.test(cleanText);
    const hasHindiVocabulary = /\b(namaste|aap|kya|twacha|khujli|dawai|doctor|daag|jalan|ilaj|hai|hain|karein|chahiye|dekhiye|kripya|sujan)\b/i.test(cleanText);
    const isHindiResponse = hasDevanagari || hasHindiVocabulary;

    if (isHindiResponse) {
      utterance.lang = 'hi-IN';
      if (preferredVoices.hindi) {
        utterance.voice = preferredVoices.hindi;
      }
    } else {
      utterance.lang = 'en-US';
      if (preferredVoices.english) {
        utterance.voice = preferredVoices.english;
      }
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  // Toggle microphone
  const toggleListening = () => {
    if (!recognitionRef.current) return;
    setMicError(null);

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      if (synthRef.current) {
        synthRef.current.cancel();
        setIsSpeaking(false);
      }
      setUserTranscript('');
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Recognition start exception:', e);
      }
    }
  };

  // Send spoken or typed message to backend
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || userTranscript || textFallback).trim();
    if (!text || isProcessing) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const userEntry = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversation((prev) => [...prev, userEntry]);
    setUserTranscript('');
    setTextFallback('');
    setIsProcessing(true);

    try {
      const historyPayload = conversation.map((c) => ({
        role: c.sender === 'user' ? 'user' : 'model',
        text: c.text,
      }));

      const res = await sendChatMessage({
        message: text,
        history: historyPayload,
        visionContext,
        questionnaireContext,
        apiKey,
      });

      if (!isMountedRef.current || !isOpenRef.current) return;

      const reply = res.reply || 'Thank you for explaining your symptoms. Be sure to consult a licensed dermatologist for definitive diagnosis.';

      const docEntry = {
        id: `doc-${Date.now()}`,
        sender: 'doctor',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setConversation((prev) => [...prev, docEntry]);
      speakResponse(reply);
    } catch (err) {
      if (!isMountedRef.current || !isOpenRef.current) return;

      const errMsg = 'I understood your question, but our clinical connection experienced a momentary delay. Please ensure you keep the affected area clean and avoid scratching.';
      setConversation((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'doctor',
          text: errMsg,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      speakResponse(errMsg);
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-600/30 border border-teal-400/30 flex items-center justify-center shadow-inner">
              <Stethoscope className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight">Dr. Elena Vance</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Voice Call
                </span>
              </div>
              <p className="text-xs text-teal-200/80">
                AI Clinical Tele-Dermatology &bull; Web Speech Natural Audio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const nextState = !voiceMuted;
                setVoiceMuted(nextState);
                if (nextState && synthRef.current) {
                  synthRef.current.cancel();
                  setIsSpeaking(false);
                }
              }}
              className={`p-2.5 rounded-xl transition-all ${
                voiceMuted ? 'bg-rose-500/30 text-rose-300' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title={voiceMuted ? 'Unmute Doctor Voice' : 'Mute Doctor Voice'}
            >
              {voiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-slate-300 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Soundwave Visualizer Panel */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Ambient organic soundwave visualizer */}
          <div className="flex items-center justify-center gap-1.5 h-14 w-full max-w-xs">
            {[40, 75, 100, 60, 90, 110, 80, 50, 95, 120, 65, 85, 45].map((height, i) => {
              const active = isSpeaking || isListening || isProcessing;
              const scale = active ? 0.3 + (height / 100) * 0.7 : 0.2;
              return (
                <div
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-150 ${
                    isSpeaking
                      ? 'bg-gradient-to-t from-teal-500 to-emerald-400'
                      : isListening
                      ? 'bg-gradient-to-t from-amber-500 to-rose-400'
                      : isProcessing
                      ? 'bg-gradient-to-t from-teal-600 to-cyan-400 animate-pulse'
                      : 'bg-slate-800'
                  }`}
                  style={{
                    height: `${active ? Math.max(12, height * 0.45) : 8}px`,
                    transform: active ? `scaleY(${1 + (i % 3) * 0.2})` : 'scaleY(1)',
                    animation: active ? `pulse 0.8s ease-in-out infinite alternate ${i * 0.07}s` : 'none',
                  }}
                />
              );
            })}
          </div>

          <div className="text-center mt-2">
            <span className={`text-xs font-semibold tracking-wide ${
              isSpeaking
                ? 'text-teal-400 animate-pulse'
                : isListening
                ? 'text-amber-400'
                : isProcessing
                ? 'text-cyan-400'
                : 'text-slate-400'
            }`}>
              {isSpeaking
                ? '🩺 Dr. Vance is speaking...'
                : isListening
                ? '🎙️ Listening to you... (Click button or speak now)'
                : isProcessing
                ? '⚡ Formulating clinical triage response...'
                : 'Tap the microphone to speak'}
            </span>
          </div>

          {/* Current Live Transcription Bubble */}
          {userTranscript && (
            <div className="mt-3 px-4 py-1.5 bg-slate-900/90 border border-teal-500/40 rounded-full text-xs text-teal-200 max-w-md truncate animate-fade-in flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              <span>"{userTranscript}"</span>
              <button
                type="button"
                onClick={() => handleSendMessage(userTranscript)}
                className="ml-auto text-[11px] font-bold text-teal-400 hover:text-white underline pl-2"
              >
                Send &rarr;
              </button>
            </div>
          )}
        </div>

        {/* Live Conversation Transcript Display */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50 min-h-[220px]">
          {conversation.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs shadow-xs ${
                  msg.sender === 'user' ? 'bg-slate-800 text-white' : 'bg-teal-700 text-white'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                }`}
              >
                <div className="font-semibold text-[11px] mb-1 opacity-70">
                  {msg.sender === 'user' ? 'You' : 'Dr. Elena Vance'}
                </div>
                <div className="whitespace-pre-line">{msg.text}</div>
                <div className="text-[10px] text-slate-400 mt-1.5 text-right">{msg.time}</div>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-2 text-slate-400 text-xs pl-11">
              <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] text-slate-500">Dr. Vance is evaluating...</span>
            </div>
          )}

          <div ref={transcriptEndRef} />
        </div>

        {/* Audio Controls & Fallback Input */}
        <div className="p-4 bg-white border-t border-slate-200">
          {micError && (
            <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs flex items-center justify-between gap-2 animate-fade-in">
              <span>⚠️ {micError}</span>
              <button
                type="button"
                onClick={() => setMicError(null)}
                className="text-rose-700 hover:text-rose-900 font-bold px-1.5 py-0.5 rounded text-[11px]"
              >
                &times;
              </button>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 mb-3">
            {/* Primary Push-To-Talk Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`px-6 py-3.5 rounded-2xl font-bold text-xs flex items-center gap-2.5 transition-all shadow-md ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-200 animate-pulse'
                  : 'bg-teal-700 hover:bg-teal-800 text-white'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>Stop Listening</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Tap to Speak Symptoms</span>
                </>
              )}
            </button>

            {/* End Call Button */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-semibold text-xs rounded-2xl transition-all border border-slate-200 flex items-center gap-2"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Call</span>
            </button>
          </div>

          {/* Text Input Fallback if noisy or microphone unavailable */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={textFallback}
              onChange={(e) => setTextFallback(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              placeholder="Or type a question to speak with Dr. Vance..."
              className="flex-1 text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!textFallback.trim() || isProcessing}
              className="p-2.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white rounded-xl shadow-xs transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {!speechSupported && (
            <p className="text-[11px] text-amber-600 mt-2 text-center">
              ⚠️ Browser speech recognition not supported in this browser. You can still type questions and hear Dr. Vance's spoken clinical advice!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
