import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function Login() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState(''); // Simple password login for MVP
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage('¡Registro exitoso! Revisa tu email para confirmar.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate('/dashboard');
            }
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100">
                <div className="flex justify-center mb-6">
                    <img src="/logo.jpg" alt="Puentes Globales" className="h-20 w-auto object-contain" />
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 mb-2 text-center">
                    {isSignUp ? 'Crear Cuenta' : 'Bienvenido'}
                </h1>
                <p className="text-center text-slate-500 mb-8 text-sm">
                    {isSignUp ? 'Empieza tu viaje hacia la fluidez' : 'Inicia sesión para continuar practicando'}
                </p>

                <form onSubmit={handleAuth} className="space-y-5">
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all shadow-sm"
                            placeholder="tu@email.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-2">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all shadow-sm"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {message && (
                        <div className={`text-sm p-3 rounded-lg ${message.includes('exitoso') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white p-4 rounded-xl transition-all font-bold flex justify-center items-center shadow-lg shadow-cyan-600/20"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? 'Registrarse Gratis' : 'Entrar')}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-slate-500">
                    {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="ml-2 text-cyan-600 font-bold hover:text-cyan-700 transition-colors"
                    >
                        {isSignUp ? 'Ingresa aquí' : 'Regístrate gratis'}
                    </button>
                </div>
            </div>
        </div>
    );
}
