import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Globe, MessageCircle, Calendar, Briefcase,
    CheckCircle, Mic, Star, Shield, TrendingUp, AlertCircle,
    Users, FileText, Brain, Bot, Zap, X, Menu, Search
} from 'lucide-react';

const NewHomePage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fadeInUp = {
        initial: { opacity: 0, y: 40 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.8, ease: "easeOut" }
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 overflow-x-hidden">

            {/* --- NAVIGATION --- */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-2xl border-b border-slate-100 py-3' : 'bg-transparent py-6'}`}>
                <div className="container mx-auto px-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-4">
                        <img src="logo.jpg" alt="Puentes Globales" className="h-20 w-auto object-contain rounded-xl" />
                        <span className="text-4xl font-black tracking-tighter uppercase text-slate-950">
                            Puentes<span className="text-blue-600">Globales</span>
                        </span>
                    </Link>

                    <a href="https://ats-career-client.vercel.app/" target="_blank" rel="noopener noreferrer" className="px-8 py-3 bg-slate-950 text-white rounded-full text-sm font-black hover:bg-blue-600 transition-all shadow-xl shadow-slate-950/20 active:scale-95 uppercase tracking-widest">
                        Realiza tu Diagnóstico
                    </a>

                    <button className="lg:hidden text-slate-900 p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <Menu size={28} />
                    </button>
                </div>
            </nav>

            {/* --- 1. HERO SECTION --- */}
            <section className="relative pt-48 pb-32 overflow-hidden bg-gradient-to-b from-blue-50/50 to-white">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        >
                            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-blue-600/5 border border-blue-600/10 text-blue-700 text-lg font-black uppercase tracking-[0.2em] mb-8">
                                <Zap size={20} className="fill-blue-600" /> Emigrar con Confianza
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black mb-10 leading-[0.9] text-slate-950 tracking-tighter">
                                No emigres <br />
                                <span className="text-blue-600 italic">a la suerte.</span>
                            </h1>
                            <p className="text-2xl text-slate-500 font-medium mb-12 leading-relaxed max-w-xl">
                                Preparamos tu perfil profesional para el mercado europeo antes de que compres el pasaje. Llegá con empleo real, no con esperanza.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6">
                                <a href="https://ats-career-client.vercel.app/" target="_blank" rel="noopener noreferrer" className="px-12 py-6 bg-slate-950 text-white rounded-[2rem] font-black text-xl hover:bg-blue-600 transition-all shadow-2xl shadow-slate-950/20 flex items-center justify-center gap-3 transform hover:-translate-y-1">
                                    Realiza tu Diagnóstico <ArrowRight size={24} />
                                </a>
                                <a href="https://ats-career-client.vercel.app/" target="_blank" rel="noopener noreferrer" className="px-12 py-6 bg-white border-2 border-slate-100 text-slate-900 rounded-[2rem] font-bold text-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-lg">
                                    Ver Ofertas Laborales
                                </a>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="relative group"
                        >
                            <div className="relative z-10 p-4 bg-white rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden">
                                <img
                                    src="img/landing/uploaded_image_1_1768144162832.jpg"
                                    alt="Carrera Global"
                                    className="rounded-[3.5rem] w-full h-[600px] object-cover shadow-2xl"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- 2. PROBLEM AWARENESS --- */}
            <section className="py-40">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <motion.div {...fadeInUp}>
                            <img
                                src="img/landing/uploaded_image_2_1768144345868.jpg"
                                alt="Frustración laboral"
                                className="w-full h-auto rounded-[4rem] shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
                            />
                        </motion.div>
                        <motion.div {...fadeInUp}>
                            <h2 className="text-[12px] font-black text-blue-600 uppercase tracking-[0.5em] mb-6">El Muro Invisible</h2>
                            <h3 className="text-5xl md:text-6xl font-black text-slate-950 mb-10 leading-tight">
                                ¿Por qué enviás CVs <br /> y nadie responde?
                            </h3>
                            <div className="space-y-8">
                                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all group text-balance">
                                    <div className="flex items-start gap-6">
                                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform flex-shrink-0">
                                            <AlertCircle className="text-red-500" size={28} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black mb-2">Algoritmos de Rechazo (ATS)</h4>
                                            <p className="text-slate-500 font-medium">El 75% de las postulaciones son eliminadas por software antes de que un humano las vea. No estás "fallando", estás siendo filtrado.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all group text-balance">
                                    <div className="flex items-start gap-6">
                                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform flex-shrink-0">
                                            <TrendingUp className="text-blue-500" size={28} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black mb-2">La Brecha Cultural</h4>
                                            <p className="text-slate-500 font-medium">Un CV para Latinoamérica no sirve en Europa. El tono, la estructura y lo que buscan los reclutadores es radicalmente opuesto.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-8 flex justify-center lg:justify-start">
                                    <h5 className="text-3xl md:text-4xl font-black text-blue-600 italic tracking-tighter uppercase">Migrar con Confianza</h5>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- 3. SOLUTION POSITIONING (The preparation system) --- */}
            <section id="metodo" className="py-40 bg-slate-950 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1/2 h-full bg-blue-600/5 blur-[150px]"></div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <motion.div {...fadeInUp}>
                            <h2 className="text-[12px] font-black text-blue-500 uppercase tracking-[0.6em] mb-8 text-center lg:text-left">Nuestra Solución</h2>
                            <h3 className="text-5xl md:text-7xl font-black mb-12 leading-tight tracking-tight text-balance text-center lg:text-left">
                                No es un curso. Es un <span className="text-blue-500">Sistema de Preparación.</span>
                            </h3>
                            <p className="text-2xl text-slate-400 font-medium mb-12 leading-relaxed text-center lg:text-left">
                                No te vendemos "el sueño europeo". Te damos las herramientas de ingeniería de carrera para que entres al mercado laboral por la puerta grande.
                            </p>
                            <div className="flex justify-center mt-12">
                                <Link to="/preparacion" className="px-12 py-6 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-black text-lg transition-all uppercase tracking-widest flex items-center gap-4 hover:scale-105 active:scale-95 shadow-2xl">
                                    Ver detalle del programa <ArrowRight size={24} />
                                </Link>
                            </div>
                        </motion.div>
                        <motion.div {...fadeInUp} className="bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10">
                            <ul className="space-y-10">
                                {[
                                    { t: "Estrategia de Búsqueda", d: "Te conectamos con vacantes que sí patrocinan visa.", i: <Search className="text-blue-400" /> },
                                    { t: "Optimización Crítica", d: "Tu perfil validado para pasar el filtro ATS.", i: <Zap className="text-yellow-400" /> },
                                    { t: "Mentalidad Ganadora", d: "Coaching para superar el miedo al gran salto.", i: <Brain className="text-purple-400" /> }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-6">
                                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                            {React.cloneElement(item.i, { size: 24 })}
                                        </div>
                                        <div>
                                            <h5 className="text-xl font-black mb-1">{item.t}</h5>
                                            <p className="text-slate-400 font-medium">{item.d}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- 4 TO 8. THE ARSENAL (The 6 Pillars) --- */}
            <section id="herramientas" className="py-40 bg-slate-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-32 max-w-3xl mx-auto">
                        <h2 className="text-[12px] font-black text-blue-600 uppercase tracking-[0.4em] mb-6">Tu Arsenal de Carrera</h2>
                        <h3 className="text-5xl font-black tracking-tight">Todo lo que necesitás para ser <span className="text-blue-600">irresistible</span> para una empresa.</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[
                            {
                                title: "Buscador de Ofertas Reales",
                                desc: "Acceso curado a vacantes en Europa que sí aceptan talento internacional.",
                                icon: <Search className="text-blue-500" />,
                                image: "img/landing/uploaded_image_1_1768152607150.jpg"
                            },
                            {
                                title: "Simulador ATS Pro",
                                desc: "Optimizamos tu CV para que el software del reclutador te ponga en el top 1% de candidatos.",
                                icon: <FileText className="text-cyan-500" />,
                                image: "img/landing/uploaded_image_1_1768145007884.jpg"
                            },
                            {
                                title: "Entrenamiento de Entrevistas",
                                desc: "Practicá con SpeakGo AI para responder preguntas técnicas y culturales en tiempo real.",
                                icon: <Bot className="text-indigo-500" />,
                                image: "img/landing/uploaded_image_1_1768144162832.jpg"
                            },
                            {
                                title: "Tests Psicotécnicos",
                                desc: "Preparación intensiva para las pruebas lógicas y de personalidad líderes en Europa.",
                                icon: <Brain className="text-purple-500" />,
                                image: "img/landing/uploaded_image_1_1768144345868.jpg"
                            },
                            {
                                title: "SpeakGo AI: Idiomas",
                                desc: "Conversación fluida en situaciones reales de trabajo y vida.",
                                icon: <Mic className="text-emerald-500" />,
                                image: "img/landing/uploaded_image_2_1768144162832.jpg"
                            },
                            {
                                title: "Coach y Mentalidad Ganadora",
                                desc: "Gestión emocional para superar la soledad y la incertidumbre migratoria.",
                                icon: <Users className="text-red-400" />,
                                image: "img/landing/uploaded_image_2_1768150943006.jpg"
                            }
                        ].map((tool, i) => (
                            <motion.div
                                key={i}
                                {...fadeInUp}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-sm flex flex-col h-full hover:shadow-2xl transition-all duration-500 group"
                            >
                                <div className="h-56 overflow-hidden">
                                    <img src={tool.image} alt={tool.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                </div>
                                <div className="p-10 flex-1 flex flex-col">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-slate-900 shadow-inner">
                                        {tool.icon}
                                    </div>
                                    <h4 className="text-2xl font-black mb-4">{tool.title}</h4>
                                    <p className="text-slate-500 font-medium leading-relaxed flex-1">{tool.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- 9. ASPIRATIONAL RESULT --- */}
            <section className="py-40 bg-blue-50 overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="bg-white rounded-[4rem] p-12 md:p-24 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-5">
                            <Star size={300} className="text-blue-600" />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative z-10 font-bold">
                            <div>
                                <h3 className="text-4xl md:text-6xl font-black mb-10 leading-tight">La diferencia entre aventurarse <span className="text-blue-600 underline underline-offset-8">y progresar.</span></h3>
                                <p className="text-2xl text-slate-400 font-medium mb-12 leading-relaxed italic">
                                    "No busques suerte. Buscá preparación. El miedo desaparece cuando tenés un plan validado por expertos y herramientas que funcionan."
                                </p>
                                <a href="https://calendly.com/puentesglobales" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-4 px-10 py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all uppercase tracking-widest text-sm">
                                    Quiero mi Diagnóstico <ArrowRight size={20} />
                                </a>
                            </div>
                            <div className="relative">
                                <img src="img/landing/uploaded_image_2_1768144162832.jpg" alt="París Éxito" className="rounded-[3rem] shadow-2xl" />
                                <div className="absolute -bottom-8 -right-8 bg-slate-950 text-white p-10 rounded-[2rem] shadow-2xl max-w-xs border border-white/10">
                                    <p className="font-black text-xl mb-2 text-blue-400">Objetivo:</p>
                                    <p className="text-slate-400">Migración planificada, empleo asegurado y tranquilidad familiar.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 10. FINAL CTA --- */}
            <section className="py-60 bg-white">
                <div className="container mx-auto px-6 text-center">
                    <motion.div {...fadeInUp}>
                        <h2 className="text-6xl md:text-8xl font-black text-slate-950 mb-12 tracking-tighter">
                            Tu nueva vida <br />
                            <span className="text-blue-600 italic">comienza hoy.</span>
                        </h2>
                        <div className="flex flex-col items-center gap-10">
                            <a href="https://calendly.com/puentesglobales" target="_blank" rel="noopener noreferrer" className="group relative px-20 py-8 bg-slate-950 text-white rounded-[3rem] font-black text-3xl hover:bg-blue-600 transition-all shadow-3xl shadow-slate-950/20 transform hover:-translate-y-2 active:scale-95">
                                Agendar Entrevista Ahora
                            </a>
                            <p className="text-slate-400 font-bold text-lg flex items-center gap-3">
                                <Shield size={24} className="text-green-500" /> Sin compromiso • Perfil validado en 15 min
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="py-32 bg-slate-50 border-t border-slate-100">
                <div className="container mx-auto px-6 text-center">
                    <div className="flex justify-center mb-16 opacity-30 grayscale invert">
                        <img src="logo.jpg" alt="Logo" className="h-16 w-auto" />
                    </div>
                    <div className="flex flex-wrap justify-center gap-12 font-black text-sm uppercase tracking-widest text-slate-400 mb-12">
                        <a href="#" className="hover:text-blue-600">Términos</a>
                        <a href="#" className="hover:text-blue-600">Privacidad</a>
                        <a href="#" className="hover:text-blue-600">Contacto</a>
                    </div>
                    <p className="text-slate-300 font-bold text-xs uppercase tracking-[0.5em]">
                        © 2026 Puentes Globales. Arquitectura de Carrera para el Siglo XXI.
                    </p>
                </div>
            </footer>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        className="fixed inset-0 z-[100] bg-white p-10 flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-16 font-bold">
                            <img src="logo.jpg" alt="Logo" className="h-10" />
                            <button onClick={() => setIsMenuOpen(false)} className="text-slate-900 uppercase tracking-widest">Cerrar</button>
                        </div>
                        <div className="flex flex-col gap-10 uppercase font-black text-4xl leading-none tracking-tighter">
                            <a href="https://ats-career-client.vercel.app/" target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)} className="text-blue-600">Realiza tu Diagnóstico</a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* WhatsApp Floating Button */}
            <a
                href="https://wa.me/yourphonehere"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-10 left-10 z-[100] group flex items-center gap-3"
            >
                <div className="w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                    <MessageCircle size={32} className="text-white fill-current" />
                </div>
                <div className="bg-white px-4 py-2 rounded-xl shadow-xl border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block">
                    <span className="font-black text-xs text-slate-950">Chateá con <span className="text-blue-600">SpeakGo</span></span>
                </div>
            </a>

        </div>
    );
};

export default NewHomePage;
