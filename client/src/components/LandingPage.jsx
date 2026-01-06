import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Mic, Globe, ArrowRight, Star, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-cyan-100 selection:text-cyan-900">
            {/* Background Gradients (Subtle Light Theme) */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-200/50 rounded-full blur-[128px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-slate-200/50 rounded-full blur-[128px]" />
            </div>

            <div className="relative z-10">
                {/* Navigation */}
                <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {/* Logo Update - Bigger Size (3x) */}
                        <img src="/logo.jpg" alt="Puentes Globales" className="h-72 w-auto object-contain" />
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-8 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full transition-all text-sm font-semibold shadow-lg shadow-slate-900/10"
                    >
                        Iniciar Sesión
                    </button>
                </nav>

                {/* Hero Section */}
                <main className="container mx-auto px-6 pt-16 pb-32 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-700 text-sm font-bold mb-8 shadow-sm">
                            <Star size={14} fill="currentColor" />
                            <span>Nueva Tecnología AI de Voz</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight text-slate-900 uppercase">
                            HABLA EN INGLÉS <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-slate-600">
                                SIN MIEDO
                            </span>
                        </h1>

                        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
                            Entrena tu inglés con IA en situaciones reales.
                            Corrige errores al instante, gana seguridad
                            y empieza a expresarte con confianza.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button
                                onClick={() => navigate('/login')}
                                className="group relative px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full font-bold text-lg transition-all flex items-center gap-2 shadow-xl shadow-cyan-600/30 ring-4 ring-cyan-100"
                            >
                                Probar ahora
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="px-8 py-4 bg-white hover:bg-slate-50 border-2 border-slate-100 rounded-full font-bold text-lg transition-all text-slate-600 shadow-sm hover:shadow-md">
                                Ver Demo
                            </button>
                        </div>
                    </motion.div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-8 mt-32">
                        <FeatureCard
                            icon={<Mic className="text-cyan-600" />}
                            title="Conversación Natural"
                            desc="Habla como si fuera una persona real. Nuestra IA entiende acentos y contexto."
                        />
                        <FeatureCard
                            icon={<Shield className="text-slate-700" />}
                            title="Ambiente Seguro"
                            desc="Practica sin miedo a equivocarte. Un espacio libre de juicios para aprender."
                        />
                        <FeatureCard
                            icon={<Globe className="text-cyan-500" />}
                            title="Escenarios Reales"
                            desc="Prepárate para entrevistas, viajes o negocios con roles específicos."
                        />
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-slate-100 py-12 text-center text-slate-400 text-sm bg-slate-50">
                    <p>© 2024 Puentes Globales. Todos los derechos reservados.</p>
                </footer>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="p-8 rounded-3xl bg-white border border-slate-100 text-left hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 shadow-md shadow-slate-100"
    >
        <div className="w-14 h-14 rounded-2xl bg-cyan-50 flex items-center justify-center mb-6 text-2xl">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
        <p className="text-slate-500 leading-relaxed">
            {desc}
        </p>
    </motion.div>
);

export default LandingPage;
