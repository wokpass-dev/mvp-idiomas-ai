
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { CEFRLevel, Language, ChatMessage } from './types';
import { LANGUAGE_FLAGS } from './constants';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { gemini } from './services/geminiService';
import { playPcmAudio } from './services/audioService';
import { Send, Mic, Settings, X, AlertCircle } from 'lucide-react';

// --- localStorage persistence ---
const STORAGE_KEY = 'talkme_v2_session';

function loadSession(): { messages: ChatMessage[]; level: CEFRLevel; language: Language } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return {
        messages: data.messages || [],
        level: data.level || 'A1',
        language: data.language || 'English',
      };
    }
  } catch { /* ignore corrupt data */ }
  return { messages: [], level: 'A1', language: 'English' };
}

function saveSession(messages: ChatMessage[], level: CEFRLevel, language: Language) {
  try {
    // Keep only last 50 messages to avoid storage limits
    const trimmed = messages.slice(-50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages: trimmed, level, language }));
  } catch { /* storage full, ignore */ }
}

const App: React.FC = () => {
  const session = loadSession();
  const [level, setLevel] = useState<CEFRLevel>(session.level);
  const [language, setLanguage] = useState<Language>(session.language);
  const [messages, setMessages] = useState<ChatMessage[]>(session.messages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Persist to localStorage on every change
  useEffect(() => {
    saveSession(messages, level, language);
  }, [messages, level, language]);

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const showError = (msg: string) => {
    setErrorMsg(msg);
  };

  // --- Recording ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (blob.size < 1000) {
          showError("Recording too short. Hold the mic button longer.");
          return;
        }
        setIsLoading(true);
        try {
          const transcription = await gemini.transcribeAudio(blob);
          if (transcription.trim()) {
            sendMessage(transcription);
          } else {
            showError("Could not understand the audio. Try again.");
          }
        } catch (error) {
          showError("Voice recognition failed. Please try typing instead.");
        } finally {
          setIsLoading(false);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      showError("Microphone access denied. Please allow mic permissions in your browser.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  };

  // --- Chat ---
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.text }]
      }));

      const feedback = await gemini.generateResponse(text, level, language, history);

      const tutorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'tutor',
        text: feedback.response_text,
        feedback: feedback,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, tutorMessage]);

      // Auto-play TTS for immersion (don't block on failure)
      try {
        const audioData = await gemini.generateSpeech(feedback.response_text, language);
        await playPcmAudio(audioData);
      } catch {
        // TTS failure is non-critical, don't show error
        console.warn("TTS playback skipped");
      }

    } catch (error) {
      showError("Connection error. Please check your internet and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [messages, level, language]);

  const handlePlayVoice = async (text: string) => {
    try {
      const audioData = await gemini.generateSpeech(text, language);
      await playPcmAudio(audioData);
    } catch (e) {
      showError("Could not play audio. Try again.");
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50">
      {/* Error Toast */}
      {errorMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-red-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 max-w-[90vw]">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="ml-2 hover:opacity-70">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Mobile Toggle */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-50">
        <h1 className="text-xl font-bold text-indigo-600">TalkMe</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm">{LANGUAGE_FLAGS[language]} {level}</span>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Settings className="w-6 h-6 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block fixed md:relative inset-0 z-40 bg-white md:bg-transparent`}>
        <div className="h-full flex flex-col relative">
          <button
            className="md:hidden absolute top-4 right-4 text-slate-400 z-50"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} />
          </button>
          <Sidebar
            level={level}
            setLevel={(l) => { setLevel(l); setIsSidebarOpen(false); }}
            language={language}
            setLanguage={(lang) => { setLanguage(lang); setIsSidebarOpen(false); }}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white/50 backdrop-blur-sm border-b">
          <div className="flex items-center gap-4">
            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-bold">{LANGUAGE_FLAGS[language]} {language}</span>
            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold">{level}</span>
          </div>
          <div className="flex items-center gap-4">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors uppercase tracking-wider font-medium"
              >
                Clear Chat
              </button>
            )}
            <div className="text-xs text-slate-400 font-medium uppercase tracking-widest">Learning Session Active</div>
          </div>
        </header>

        <ChatWindow
          messages={messages}
          onPlayVoice={handlePlayVoice}
          isLoading={isLoading}
          language={language}
        />

        <div className="p-4 md:p-6 bg-gradient-to-t from-slate-50 to-transparent">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(inputValue); }}
            className="max-w-4xl mx-auto flex items-center gap-2 md:gap-4 glass p-2 rounded-2xl shadow-xl border border-white"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Say something in ${language}...`}
              disabled={isLoading}
              className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-3 outline-none text-slate-700"
            />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
                onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
                className={`p-3 rounded-xl transition-all ${isRecording
                  ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200'
                  : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                title="Hold to speak"
              >
                <Mic size={20} />
              </button>
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-3 rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Send size={20} />
                <span className="hidden md:inline font-medium text-sm">Send</span>
              </button>
            </div>
          </form>
          <div className="mt-2 text-center">
            <p className="text-[10px] text-slate-300 uppercase font-medium tracking-widest">
              {isRecording ? '🔴 Recording... Release to send' : 'Hold the mic to speak • Type to write'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
