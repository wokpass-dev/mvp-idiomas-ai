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
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700">
                <div className="flex justify-center mb-6">
                    <img src="/logo.jpg" alt="Puentes Globales" className="h-16 w-auto rounded-lg shadow-lg" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-6 text-center">
                    {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
                </h1>

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-slate-400 text-sm mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-sm mb-1">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {message && (
                        <div className={`text-sm p-3 rounded-lg ${message.includes('exitoso') ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'}`}>
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors font-semibold flex justify-center items-center"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? 'Registrarse' : 'Entrar')}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-400">
                    {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="ml-2 text-blue-400 hover:underline"
                    >
                        {isSignUp ? 'Ingresa aquí' : 'Regístrate'}
                    </button>
                </div>
            </div>
        </div>
    );
}
