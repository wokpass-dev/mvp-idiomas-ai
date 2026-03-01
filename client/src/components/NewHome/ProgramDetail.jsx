import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Search, UserCheck, FileText, Target,
    ArrowRight, MessageCircle, Shield,
    CheckCircle, Globe, Brain, Zap, Briefcase,
    ChevronRight, Star
} from 'lucide-react';

const ProgramDetail = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const fadeInUp = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.8, ease: "easeOut" }
    };

    const pillars = [
        {
            number: "01",
            title: "Diagnóstico y Estrategia de Destino",
            subtitle: "Evaluación Humana y Geográfica",
            desc: "Antes de aplicar, entendemos quién eres. Evaluamos tu perfil profesional y personal para definir el mercado europeo que mejor se adapta a tus metas y estilo de vida.",
            items: [
                "Definición estratégica del país de destino",
                "Detección de puntos de fricción y miedos",
                "Coaching de mentalidad migratoria",
                "Validación de viabilidad legal y profesional"
            ],
            icon: <Globe className="text-blue-500" />,
            photo: "img/landing/uploaded_image_1_1768152607150.jpg",
            color: "blue"
        },
        {
            number: "02",
            title: "Ingeniería de Aplicación",
            subtitle: "Construcción de un Perfil Irresistible",
            desc: "Transformamos tu trayectoria en un 'Paquete de Aplicación' de alto rendimiento. Optimizamos cada pieza para que los algoritmos y los humanos te elijan.",
            items: [
                "Construcción de CV bajo estándares europeos",
                "Optimización para filtros ATS (Algoritmos)",
                "Preparación para Tests Psicométricos",
                "Apoyo técnico de Coach de RRHH"
            ],
            icon: <Zap className="text-amber-500" />,
            photo: "img/landing/uploaded_image_1_1768145007884.jpg",
            color: "amber"
        },
        {
            number: "03",
            title: "Mercado y Conquista",
            subtitle: "Búsqueda Activa y Cierre de Ofertas",
            desc: "Entramos en la fase operativa. Te guiamos en la búsqueda real de vacantes y te entrenamos para que cada entrevista sea una victoria confirmada.",
            items: [
                "Búsqueda dirigida en portales premium",
                "Entrenamiento intensivo para entrevistas",
                "Coaching de resiliencia frente al rechazo",
                "Simulaciones reales con SpeakGo AI"
            ],
            icon: <Target className="text-emerald-500" />,
            photo: "img/landing/uploaded_image_1_1768144162832.jpg",
            color: "emerald"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 overflow-x-hidden">

            {/* Navigation (Simple) */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 py-4">
                <div className="container mx-auto px-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <img src="logo.jpg" alt="Logo" className="h-10 w-auto rounded-lg" />
                        <span className="text-xl font-black uppercase tracking-tighter">Puentes<span className="text-blue-600">Globales</span></span>
                    </Link>
                    <Link to="/" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest flex items-center gap-2">
                        Volver al inicio
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="pt-40 pb-20 bg-white">
                <div className="container mx-auto px-6 text-center">
                    <motion.div {...fadeInUp}>
                        <h1 className="text-6xl md:text-8xl font-black text-slate-950 mb-8 leading-[0.9] tracking-tighter">
                            El Método <br />
                            <span className="text-blue-600 italic">Paso a Paso.</span>
                        </h1>
                        <p className="text-2xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed">
                            No es solo buscar trabajo. Es configurar una transición de vida exitosa a través de nuestra metodología de 3 pilares estratégicos.
                        </p>
                    </motion.div>
                </div>
            </header>

            {/* The 3 Pillars Section */}
            <section className="py-24">
                <div className="container mx-auto px-6">
                    <div className="space-y-32">
                        {pillars.map((pillar, index) => (
                            <motion.div
                                key={index}
                                {...fadeInUp}
                                className={`flex flex-col ${index % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-20 items-center`}
                            >
                                {/* Content Side */}
                                <div className="lg:w-1/2">
                                    <div className="flex items-center gap-4 mb-6">
                                        <span className="text-6xl font-black text-slate-200">{pillar.number}</span>
                                        <div className="h-px flex-1 bg-slate-200"></div>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black text-slate-950 mb-4">{pillar.title}</h2>
                                    <h3 className="text-xl font-bold text-blue-600 uppercase tracking-widest mb-8">{pillar.subtitle}</h3>
                                    <p className="text-xl text-slate-500 font-medium mb-10 leading-relaxed">
                                        {pillar.desc}
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {pillar.items.map((item, i) => (
                                            <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                                <CheckCircle className="text-blue-500 mt-1 flex-shrink-0" size={18} />
                                                <span className="font-bold text-slate-700 leading-tight">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Visual Side */}
                                <div className="lg:w-1/2 w-full">
                                    <div className="relative p-4 rounded-[4rem] bg-white border border-slate-100 shadow-2xl overflow-hidden group">
                                        <img
                                            src={pillar.photo}
                                            alt={pillar.title}
                                            className="w-full h-[500px] object-cover rounded-[3.5rem] grayscale group-hover:grayscale-0 transition-all duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60"></div>
                                        <div className="absolute bottom-10 left-10 z-10 flex items-center gap-4">
                                            <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                                                {React.cloneElement(pillar.icon, { size: 32 })}
                                            </div>
                                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl">
                                                <p className="font-black text-white uppercase tracking-widest text-xs">Fase {pillar.number}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-32 bg-slate-950 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/10 blur-[150px]"></div>
                <div className="container mx-auto px-6 text-center relative z-10">
                    <motion.div {...fadeInUp}>
                        <h2 className="text-5xl md:text-7xl font-black mb-10 tracking-tighter">¿Listo para empezar el <br /><span className="text-blue-500">Pilar 01?</span></h2>
                        <p className="text-2xl text-slate-400 font-medium mb-16 max-w-2xl mx-auto leading-relaxed">
                            El primer paso es un diagnóstico profundo. Sin estrategia no hay éxito. Reserva tu lugar hoy mismo.
                        </p>
                        <a href="https://calendly.com/puentesglobales" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-6 px-16 py-8 bg-blue-600 text-white rounded-[2.5rem] font-black text-2xl hover:bg-blue-700 transition-all shadow-3xl shadow-blue-600/20 transform hover:-translate-y-2 active:scale-95">
                            Agenda tu Llamada <ArrowRight size={32} />
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Simple Footer */}
            <footer className="py-20 bg-white border-t border-slate-100">
                <div className="container mx-auto px-6 text-center text-slate-400 font-bold text-xs uppercase tracking-[0.5em]">
                    © 2026 Puentes Globales. Metodología de Ingeniería de Carrera.
                </div>
            </footer>

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

export default ProgramDetail;
