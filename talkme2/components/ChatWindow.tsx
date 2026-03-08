
import React, { useRef, useEffect } from 'react';
import { ChatMessage, Language } from '../types';
import { LANGUAGE_FLAGS } from '../constants';
import { Volume2, CheckCircle2, Lightbulb, BookOpen, MessageCircle } from 'lucide-react';

interface ChatWindowProps {
  messages: ChatMessage[];
  onPlayVoice: (text: string) => void;
  isLoading: boolean;
  language: Language;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onPlayVoice, isLoading, language }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6" ref={scrollRef}>
      {/* Welcome Screen */}
      {messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-center px-4">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-indigo-200">
            <MessageCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to TalkMe!</h2>
          <p className="text-slate-500 mb-8 max-w-md">
            Start practicing {LANGUAGE_FLAGS[language]} {language} right now.
            Type a message or hold the microphone to speak.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl w-full">
            <div className="bg-white border rounded-xl p-4 text-left">
              <span className="text-2xl mb-2 block">💬</span>
              <p className="text-sm font-semibold text-slate-700">Chat Naturally</p>
              <p className="text-xs text-slate-400 mt-1">Have real conversations with your AI tutor</p>
            </div>
            <div className="bg-white border rounded-xl p-4 text-left">
              <span className="text-2xl mb-2 block">🎯</span>
              <p className="text-sm font-semibold text-slate-700">Get Corrections</p>
              <p className="text-xs text-slate-400 mt-1">Instant feedback on grammar and vocabulary</p>
            </div>
            <div className="bg-white border rounded-xl p-4 text-left">
              <span className="text-2xl mb-2 block">🎙️</span>
              <p className="text-sm font-semibold text-slate-700">Speak & Listen</p>
              <p className="text-xs text-slate-400 mt-1">Practice pronunciation with voice input</p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
        >
          <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl ${msg.role === 'user'
              ? 'bg-indigo-600 text-white rounded-tr-none'
              : 'bg-white border rounded-tl-none shadow-sm'
            }`}>
            <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
            {msg.role === 'tutor' && (
              <button
                onClick={() => onPlayVoice(msg.text)}
                className="mt-2 text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
              >
                <Volume2 size={16} />
                <span className="text-xs font-medium">Listen</span>
              </button>
            )}
          </div>

          {/* Feedback Cards */}
          {msg.feedback && (
            <div className="w-full max-w-[85%] md:max-w-[70%] mt-3 space-y-2">
              {/* Corrections */}
              {msg.feedback.corrections && msg.feedback.corrections.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-tight">Corrections</p>
                    <ul className="text-sm text-amber-900 list-disc pl-4">
                      {msg.feedback.corrections.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                </div>
              )}

              {/* Grammar Tip */}
              {msg.feedback.grammar_tip && (
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex gap-3">
                  <Lightbulb className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-tight">Language Tip</p>
                    <p className="text-sm text-emerald-900">{msg.feedback.grammar_tip}</p>
                  </div>
                </div>
              )}

              {/* Vocabulary Check */}
              {msg.feedback.vocabulary_check && (
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex gap-3">
                  <BookOpen className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-blue-800 uppercase tracking-tight">New Vocabulary</p>
                    <p className="text-sm text-blue-900 font-medium">{msg.feedback.vocabulary_check}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center gap-2 text-indigo-400">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
          </div>
          <span className="text-xs font-medium uppercase tracking-widest">Tutor Thinking</span>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
