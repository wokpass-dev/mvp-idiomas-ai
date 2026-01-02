import React, { useState, useRef, useEffect } from 'react';
import { sendMessage, sendAudio, getScenarios } from '../services/api';
import { supabase } from '../supabaseClient';
import { Send, User, Bot, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AudioRecorder from './AudioRecorder';

export default function ChatInterface({ session }) {
    const [messages, setMessages] = useState([
        { role: 'system', content: 'You are a helpful language tutor.' }, // Hidden in UI usually, but keeping for context
        { role: 'assistant', content: '¡Hola! ¿Cómo puedo ayudarte con tu español hoy?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [scenarios, setScenarios] = useState([]);
    const [selectedScenario, setSelectedScenario] = useState(null);
    const [completedScenarios, setCompletedScenarios] = useState(new Set()); // Set of scenario IDs
    const messagesEndRef = useRef(null);

    // Load Scenarios & Progress
    useEffect(() => {
        const loadData = async () => {
            const allScenarios = await getScenarios();
            setScenarios(allScenarios);
            if (allScenarios.length > 0) setSelectedScenario(allScenarios[0]);

            if (session?.user) {
                const { data, error } = await supabase
                    .from('student_progress')
                    .select('scenario_id')
                    .eq('user_id', session.user.id)
                    .eq('status', 'completed');

                if (data) {
                    setCompletedScenarios(new Set(data.map(item => item.scenario_id)));
                }
            }
        };
        loadData();
    }, [session]);

    const markAsComplete = async () => {
        if (!selectedScenario || !session?.user) return;

        const { error } = await supabase
            .from('student_progress')
            .upsert({
                user_id: session.user.id,
                scenario_id: selectedScenario.id,
                status: 'completed',
                completed_at: new Date()
            });

        if (!error) {
            setCompletedScenarios(prev => new Set(prev).add(selectedScenario.id));
            setMessages(prev => [...prev, { role: 'system', content: '🎉 ¡Felicitaciones! Has completado esta lección.' }]);
        } else {
            console.error("Error saving progress:", error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleAudioCapture = async (audioBlob) => {
        setLoading(true);
        try {
            const response = await sendAudio(audioBlob, selectedScenario?.id);

            // 1. Show User Text
            const userMsg = { role: 'user', content: response.userText };

            // 2. Show AI Text
            const aiMsg = { role: 'assistant', content: response.assistantText };

            setMessages(prev => [...prev, userMsg, aiMsg]);

            // 3. Play Audio
            if (response.audioBase64) {
                const audio = new Audio(`data:audio/mp3;base64,${response.audioBase64}`);
                audio.play().catch(e => console.error("Audio play failed:", e));
            }

        } catch (error) {
            console.error('Audio processing failed:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Error procesando audio.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', content: input };
        const newMessages = [...messages, userMsg];

        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            // Filter out system msg for UI if needed, but API needs it.
            // We send all messages to the API.
            const response = await sendMessage(newMessages, selectedScenario?.id);
            setMessages(prev => [...prev, response]);
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Error: No pude conectar con el servidor.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-900 text-slate-100 max-w-md mx-auto shadow-xl border-x border-slate-800">

            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                            Idiomas AI
                        </h1>
                        <p className="text-xs text-slate-400">Práctica Conversacional</p>
                    </div>

                    {scenarios.length > 0 && (
                        <select
                            value={selectedScenario?.id || ''}
                            onChange={(e) => {
                                const s = scenarios.find(sc => sc.id === e.target.value);
                                setSelectedScenario(s);
                                setMessages([{ role: 'system', content: s.system_prompt }]); // Reset chat on change?
                            }}
                            className="bg-slate-800 text-xs text-white p-2 rounded-lg outline-none border border-slate-700"
                        >
                            {scenarios.map(s => (
                                <option key={s.id} value={s.id}>
                                    {completedScenarios.has(s.id) ? '✅ ' : ''}{s.emoji} {s.title}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
                {selectedScenario && (
                    <div className="flex justify-between items-start mt-2">
                        <div className="p-2 bg-slate-800/50 rounded-lg text-xs text-slate-300 flex-1 mr-2">
                            {selectedScenario.description}
                        </div>
                        <button
                            onClick={markAsComplete}
                            title="Marcar como completada"
                            className={`p-2 rounded-lg transition-colors ${completedScenarios.has(selectedScenario.id) ? 'text-green-400 bg-green-900/20' : 'text-slate-400 hover:text-green-400'}`}
                        >
                            <CheckCircle size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.filter(m => m.role !== 'system').map((msg, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex items-end max-w-[85%] space-x-2 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>

                            <div className={`p-3 rounded-2xl ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-slate-800 text-slate-200 rounded-bl-none'
                                }`}>
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none flex items-center space-x-2">
                            <Loader2 className="animate-spin text-emerald-500" size={16} />
                            <span className="text-xs text-slate-400">Escribiendo...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-900 border-t border-slate-800">
                <div className="flex gap-2 items-center">
                    <AudioRecorder onRecordingComplete={handleAudioCapture} isProcessing={loading} />

                    <form onSubmit={handleSend} className="flex-1 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Escribe o habla..."
                            className="flex-1 bg-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
