import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Bot, User, Sparkles } from 'lucide-react';
import { sendChatMessage } from '../services/api';

const QUICK_CHIPS = [
  'How urgent is this?',
  'What should I ask my dermatologist?',
  'Safe home remedies to avoid infection?',
  'Could this be contagious?',
  'What tests will the doctor perform?'
];

export default function TriageChat({ visionContext, questionnaireContext, apiKey }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (visionContext && visionContext.top_condition) {
      const topName = visionContext.top_condition;
      const conf = visionContext.top_confidence;
      const rationale = visionContext.fusion_rationale || '';

      let initialGreeting = `Hello! I have reviewed your clinical intake history and the dermoscopic image.\n\nOur multimodal Bayesian synthesis points toward **${topName}** (${conf} combined score).\n\n${rationale ? `*Clinical note: ${rationale}*\n\n` : ''}What specific questions or concerns can I clarify for you before you consult your dermatologist?`;

      if (visionContext.safety_override_triggered) {
        initialGreeting = `⚠️ **URGENT CLINICAL ADVICE:**\nBased on your reported symptoms (bleeding, rapid growth, or ABCDE asymmetry), our clinical guardrails have flagged this lesion as **High Risk for immediate in-person dermatological evaluation & biopsy**.\n\nPlease do not delay scheduling an in-person clinical exam. How can I assist you right now?`;
      }

      setMessages([
        {
          id: 'msg-init',
          role: 'assistant',
          text: initialGreeting,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } else if (messages.length === 0) {
      setMessages([
        {
          id: 'msg-welcome',
          role: 'assistant',
          text: `Welcome to **Derma Assist**! I am your AI clinical triage co-pilot.\n\nPlease complete the **Clinical Intake Wizard** on the left and upload your dermoscopic photo. Once completed, I will provide personalized care guidance and clinical answers.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [visionContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
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
        text: res.reply || 'Thank you. Please remember to consult a certified dermatologist.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: `⚠️ **Clinical Note:** While our online server connection is re-establishing, remember to avoid picking or scratching the lesion, keep the area clean, and visit an urgent care center if you notice rapid spreading, fever, or bleeding.`,
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

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col h-[580px]">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Clinical Consultation Chat</h3>
            <p className="text-[11px] text-slate-500">Multimodal Gemini AI Triage Dialogue</p>
          </div>
        </div>
        <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" /> Triage Co-Pilot
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 text-xs ${
                m.role === 'user' ? 'bg-slate-800' : 'bg-teal-600 shadow-sm'
              }`}
            >
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-none'
                  : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-none'
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
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]" />
            <span className="text-[11px] text-slate-500">Derma Assist is formulating clinical advice...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      <div className="py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => handleSendMessage(chip)}
            className="whitespace-nowrap px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 text-slate-600 rounded-full border border-slate-200 transition-all shrink-0"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
        <textarea
          rows={1}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a clinical question about your skin presentation..."
          className="flex-1 text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isTyping}
          className="p-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl shadow-md shadow-teal-600/20 transition-all shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
