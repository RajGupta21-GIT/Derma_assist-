import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Stethoscope, AlertTriangle, ShieldCheck, CornerDownLeft } from 'lucide-react';
import { sendChatMessage } from '../services/api';

const QUICK_CLINICAL_QUESTIONS = [
  'What key questions should I ask my dermatologist?',
  'How urgent is this evaluation based on my symptoms?',
  'What initial tests or biopsy procedures might be needed?',
  'Are there safe topical measures or things I should strictly avoid?',
  'What are the primary warning signs that would require emergency care?'
];

export default function ConsultationDrawer({
  isOpen,
  onClose,
  visionContext,
  questionnaireContext,
  apiKey,
}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize or update conversation greeting when opened or when visionContext changes
  useEffect(() => {
    if (visionContext && visionContext.top_condition) {
      const topName = visionContext.top_condition;
      const conf = visionContext.top_confidence || '';
      const rationale = visionContext.fusion_rationale || '';

      let initialGreeting = `Hello, I am your Dermatology Clinical Co-Pilot. I have reviewed your clinical intake history and the dermoscopic image.\n\nOur multimodal Bayesian synthesis points toward **${topName}** (${conf} combined probability).\n\n${rationale ? `*Clinical note: ${rationale}*\n\n` : ''}What specific questions or concerns can I clarify for you before you consult your physician?`;

      if (visionContext.safety_override_triggered) {
        initialGreeting = `⚠️ **URGENT CLINICAL TRIAGE NOTICE:**\nBased on your reported symptoms (e.g., bleeding, rapid growth, or ABCDE asymmetry), our clinical guardrails flagged this lesion as **High Risk for immediate in-person dermatological evaluation & biopsy**.\n\nPlease do not delay scheduling an in-person clinical exam. How can I assist you with questions right now?`;
      }

      setMessages([
        {
          id: 'init-msg',
          role: 'assistant',
          text: initialGreeting,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } else if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-msg',
          role: 'assistant',
          text: `Welcome! I am your Clinical Decision Support Co-Pilot.\n\nPlease complete your clinical intake questionnaire and photo capture to generate tailored clinical advice.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [visionContext]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (customText) => {
    const text = (customText || inputText).trim();
    if (!text || isTyping) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsTyping(true);

    try {
      const historyPayload = newMessages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await sendChatMessage({
        message: text,
        history: historyPayload,
        visionContext,
        questionnaireContext,
        apiKey,
      });

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: res.reply || 'Thank you for your question. Please ensure you discuss this directly with a dermatologist.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: `⚠️ **Clinical Advisory:** While our cloud connection is re-establishing, remember to avoid picking or scratching the lesion, keep the area clean and dry, and seek prompt care if you develop spreading erythema, fever, or bleeding.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Header */}
          <div className="p-4.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-sm">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Dermatology Consultation Co-Pilot
                </h3>
                <p className="text-[11px] text-slate-500">
                  Case-Aware Clinical Guidance &bull; Gemini Protocol
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Case Header Pill */}
          {visionContext?.top_condition && (
            <div className="px-4 py-2 bg-teal-50/60 border-b border-teal-100 flex items-center justify-between text-xs">
              <span className="text-teal-900 font-semibold truncate">
                Case: <strong>{visionContext.top_condition}</strong>
              </span>
              <span className="text-teal-700 font-mono font-bold shrink-0 ml-2">
                {visionContext.top_confidence}
              </span>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0 text-xs ${
                    m.role === 'user' ? 'bg-slate-800' : 'bg-teal-700 shadow-xs'
                  }`}
                >
                  {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-slate-900 text-white rounded-tr-xs'
                      : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-2xs'
                  }`}
                >
                  <div className="whitespace-pre-line font-normal">{m.text}</div>
                  <div
                    className={`text-[9px] mt-1.5 font-medium ${
                      m.role === 'user' ? 'text-slate-400 text-right' : 'text-slate-400'
                    }`}
                  >
                    {m.time}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs pl-9">
                <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-slate-500">
                  Synthesizing clinical response...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Suggestion Chips */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Suggested Clinical Inquiries:
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {QUICK_CLINICAL_QUESTIONS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleSendMessage(chip)}
                  className="whitespace-nowrap px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-teal-50 hover:border-teal-300 text-slate-700 hover:text-teal-800 rounded-lg border border-slate-200 shadow-2xs transition-all shrink-0"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="flex items-end gap-2">
              <textarea
                rows={2}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about symptoms, doctor questions, care precautions..."
                className="flex-1 text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent resize-none leading-relaxed"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isTyping}
                className="p-3 bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white rounded-xl shadow-md transition-all shrink-0"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              Clinical decision support co-pilot. For educational and triage assistance only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
