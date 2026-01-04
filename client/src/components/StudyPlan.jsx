import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, Play, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const levels = [
    {
        id: 1,
        title: "Nivel 1: Conceptos Básicos",
        description: "Saludos, presentaciones y números.",
        locked: false,
        scenarios: [
            { id: 'coffee', name: 'Pidiendo un Café', duration: '5 min', completed: false },
            { id: 'intro', name: 'Presentándome', duration: '3 min', completed: false }
        ]
    },
    {
        id: 2,
        title: "Nivel 2: Supervivencia",
        description: "Transporte, comida y direcciones.",
        locked: true,
        scenarios: [
            { id: 'taxi', name: 'Tomando un Taxi', duration: '7 min', completed: false },
            { id: 'restaurant', name: 'En el Restaurante', duration: '10 min', completed: false }
        ]
    },
    {
        id: 3,
        title: "Nivel 3: Conversación Fluida",
        description: "Opiniones, trabajo y sentimientos.",
        locked: true,
        scenarios: [
            { id: 'interview', name: 'Entrevista de Trabajo', duration: '15 min', completed: false },
            { id: 'debate', name: 'Debate Amistoso', duration: '12 min', completed: false }
        ]
    }
];

const StudyPlan = () => {
    const navigate = useNavigate();
    const targetLanguage = localStorage.getItem('targetLanguage') || 'es';

    const handleStartScenario = (scenarioId) => {
        navigate('/dashboard', { state: { scenarioId } });
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6 pb-20">
            <div className="max-w-2xl mx-auto">
                <header className="mb-10 text-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-2">
                        Tu Ruta de Aprendizaje
                    </h1>
                    <p className="text-slate-400">
                        Idioma seleccionado: <span className="uppercase font-bold text-white">{targetLanguage}</span>
                    </p>
                </header>

                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
                    {levels.map((level, index) => (
                        <motion.div
                            key={level.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 }}
                            className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${level.locked ? 'opacity-70 grayscale' : ''}`}
                        >
                            {/* Icon Wrapper */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-slate-800 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                {level.locked ? <Lock className="w-4 h-4 text-slate-500" /> : <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                            </div>

                            {/* Card */}
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors shadow-lg">
                                <h3 className="text-lg font-bold text-white mb-1 flex items-center justify-between">
                                    {level.title}
                                    {level.locked && <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-400">Bloqueado</span>}
                                </h3>
                                <p className="text-sm text-slate-400 mb-4">{level.description}</p>

                                <div className="space-y-2">
                                    {level.scenarios.map(scenario => (
                                        <button
                                            key={scenario.id}
                                            onClick={() => !level.locked && handleStartScenario(scenario.id)}
                                            disabled={level.locked}
                                            className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-all ${level.locked ? 'bg-slate-700/30 cursor-not-allowed' : 'bg-slate-700/50 hover:bg-blue-600/20 hover:text-blue-300'}`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <Play className="w-3 h-3" /> {scenario.name}
                                            </span>
                                            <span className="text-xs text-slate-500">{scenario.duration}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudyPlan;
