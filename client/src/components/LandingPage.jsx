import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, MessageCircle, Calendar, Briefcase, CheckCircle, Mic, Star } from 'lucide-react';

const LandingPage = () => {
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans overflow-x-hidden">

            {/* 1. HERO SECTION */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Background Image Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/img/landing/uploaded_image_0_1768144162832.jpg"
                        alt="Avión en nubes"
                        className="w-full h-full object-cover opacity-40 hover:scale-105 transition-transform duration-[20s]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-transparent to-slate-900"></div>
                </div>

                <div className="relative z-10 container mx-auto px-6 text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <div className="flex justify-center mb-6">
                            {/* Logo Placeholder or Icon */}
                            <div className="w-20 h-20 bg-blue-600/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-blue-400/30">
                                <Globe className="w-10 h-10 text-blue-400" />
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                            Emigrar con <span className="text-blue-400">confianza</span> es posible
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-300 font-light max-w-3xl mx-auto mb-10">
                            No es improvisar, es planificar. Tu futuro en Europa comienza hoy.
                        </p>
                        <div className="flex flex-col md:flex-row gap-4 justify-center">
                            <a href="#solutions" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2">
                                Conocer Soluciones <ArrowRight size={20} />
                            </a>
                            <a href="https://calendly.com/puentesglobales" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-md border border-slate-600 hover:border-slate-500 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2">
                                <Calendar size={20} /> Agendar Asesoría
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 2. SOMOS PUENTES GLOBALES (Services) */}
            <section className="py-20 bg-slate-900">
                <div className="container mx-auto px-6">
                    <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }} className="text-center mb-16">
                        <h2 className="text-blue-400 font-bold tracking-wider uppercase mb-2">Sobre Nosotros</h2>
                        <h3 className="text-3xl md:text-5xl font-bold">Somos Puentes Globales</h3>
                        <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
                            Un equipo de orientadores profesionales especializados en procesos migratorios a Europa a través de un acompañamiento cercano, priorizando tu crecimiento personal y profesional.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { icon: <Globe />, title: "Orientación Migratoria", desc: "Trámites y burocracia simplificados." },
                            { icon: <Briefcase />, title: "Inserción Laboral", desc: "Conexión directa con empresas europeas." },
                            { icon: <Mic />, title: "Coaching de Idiomas", desc: "Domina el idioma con IA y práctica real." },
                            { icon: <Star />, title: "Crecimiento Personal", desc: "Gestión de miedos y adaptación cultural." }
                        ].map((item, idx) => (
                            <motion.div key={idx} variants={fadeInUp} className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl hover:bg-slate-800 transition-colors">
                                <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4">
                                    {item.icon}
                                </div>
                                <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                                <p className="text-slate-400 text-sm">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. TALKME PITCH (The Problem) */}
            <section id="solutions" className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
                    <div className="md:w-1/2">
                        <img src="/img/landing/uploaded_image_0_1768145007884.jpg" alt="Método tradicional" className="rounded-2xl shadow-2xl grayscale hover:grayscale-0 transition-all duration-700" />
                    </div>
                    <div className="md:w-1/2">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Durante mucho tiempo, aprender un idioma fue <span className="text-slate-400 line-through">lento, difícil y poco personalizado</span>.
                        </h2>
                        <p className="text-lg text-slate-300 mb-6">
                            A diferencia de los métodos tradicionales, nuestra tecnología <strong>Talkme AI</strong> se adapta al nivel, ritmo y objetivos reales de cada persona, ofreciendo un acompañamiento constante y personalizado.
                        </p>
                        <ul className="space-y-4 mb-8">
                            {["Práctica 24/7 sin juicios", "Feedback inmediato de pronunciación", "Simulaciones de entrevistas reales"].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-300">
                                    <CheckCircle className="text-green-500" size={20} /> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* 4. THE SOLUTION (Antygraviti) */}
            <section className="py-20 bg-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/5 skew-x-12"></div>
                <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row-reverse items-center gap-12">
                    <div className="md:w-1/2">
                        <img src="/img/landing/uploaded_image_1_1768145007884.jpg" alt="Solución IA" className="rounded-2xl shadow-2xl border border-blue-500/20" />
                    </div>
                    <div className="md:w-1/2">
                        <div className="inline-block px-4 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-bold mb-4">ANTIGRAVITY ENGINE</div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">
                            Nuestra Solución
                        </h2>
                        <p className="text-lg text-slate-300 mb-6">
                            Contamos con una plataforma que brinda <strong>asesoramiento inteligente</strong>, con respuestas inmediatas que permiten resolver dudas al instante, practicar situaciones cotidianas y entrenar el idioma de forma práctica y dinámica.
                        </p>
                        <p className="text-lg text-white font-semibold mb-8">
                            Esto <span className="text-blue-400">ACELERA</span> el aprendizaje y ayuda a ganar confianza en mucho menos <span className="text-blue-400">TIEMPO</span>.
                        </p>

                        <Link to="/login" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-blue-500/40 transition-all transform hover:-translate-y-1">
                            <Mic size={24} /> Probar Talkme Ahora
                        </Link>
                        <div className="mt-4 text-xs text-slate-500">
                            <Link to="/login" className="hover:text-blue-400 underline">Ya tengo cuenta</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. JOB SEARCH (External Link) */}
            <section className="py-24 bg-slate-900 border-t border-slate-800">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold mb-4">¿Buscas trabajo en Europa?</h2>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
                        Nuestra API conecta directamente con las principales bolsas de empleo del continente. Filtra por país, idioma y sector.
                    </p>
                    <a
                        href="https://www.puentesglobales.com/index2.php"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-10 py-5 bg-white text-slate-900 hover:bg-slate-200 rounded-full font-bold text-xl transition-all shadow-xl flex items-center justify-center gap-3 mx-auto w-fit"
                    >
                        <Briefcase /> Empieza a buscar tu trabajo hoy
                    </a>
                </div>
            </section>

            {/* 6. BENEFITS GRID */}
            <section className="py-20 bg-slate-800">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-12">Te permites...</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            "Aprender cualquier idioma",
                            "Adaptado a tu nivel y ritmo",
                            "Respuestas Inmediatas",
                            "Práctica en contextos reales",
                            "Preparación Laboral y Migratoria",
                            "Aprendizaje rápido y efectivo",
                            "Mayor confianza al comunicarte",
                            "Asesoramiento sin limitaciones"
                        ].map((benefit, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                <span className="font-medium text-slate-200">{benefit}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. CTA / FINAL PITCH */}
            <section className="relative py-24 bg-blue-900 overflow-hidden">
                <img src="/img/landing/uploaded_image_3_1768144162832.jpg" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay" alt="Paris" />
                <div className="relative container mx-auto px-6 text-center z-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">La preparación correcta transforma el camino</h2>
                    <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-10 leading-relaxed">
                        El cambio empieza mucho antes del viaje. Empieza cuando decidís prepararte, informarte y entender cómo funciona el camino que querés recorrer.
                    </p>
                    <div className="inline-block p-6 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-blue-400/30">
                        <p className="text-2xl font-bold text-white mb-2">No se trata solo de postular,</p>
                        <p className="text-3xl font-bold text-blue-400">sino de estar LISTO ✨</p>
                    </div>

                    <div className="mt-12 flex flex-col md:flex-row justify-center gap-6">
                        <a href="https://calendly.com/puentesglobales" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-green-500 hover:bg-green-400 text-white rounded-full font-bold text-lg shadow-lg flex items-center justify-center gap-2">
                            <Calendar /> Agendar Entrevista
                        </a>
                        <a href="https://wa.me/541158253958" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-white text-green-600 hover:bg-slate-100 rounded-full font-bold text-lg shadow-lg flex items-center justify-center gap-2">
                            <MessageCircle /> WhatsApp Directo
                        </a>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-slate-950 py-12 border-t border-slate-900">
                <div className="container mx-auto px-6 text-center text-slate-500 text-sm">
                    <div className="flex justify-center gap-6 mb-8">
                        <a href="#" className="hover:text-white transition-colors">Terminos y Condiciones</a>
                        <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                        <a href="#" className="hover:text-white transition-colors">Contacto</a>
                    </div>
                    <p>&copy; 2026 Puentes Globales. Todos los derechos reservados.</p>
                    <p className="mt-2 text-xs">Desarrollado con ❤️ y mucha IA.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
