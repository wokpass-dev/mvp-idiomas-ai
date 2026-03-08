import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, ArrowRight, UserPlus, LogIn, Building } from 'lucide-react';

const LoginPage: React.FC = () => {
    const { login, register, error } = useAuth();
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [schoolCode, setSchoolCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');
        setLoading(true);
        try {
            if (isRegister) {
                await register(email, password, name, schoolCode || undefined);
            } else {
                await login(email, password);
            }
        } catch (err: any) {
            setLocalError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
                        <MessageCircle className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">TalkMe</h1>
                    <p className="text-white/70 text-sm">AI-Powered Language Tutor</p>
                </div>

                {/* Form Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-6">
                        {isRegister ? 'Create Account' : 'Welcome Back'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegister && (
                            <div>
                                <label className="block text-sm text-white/70 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Your name"
                                    required
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 outline-none transition-all"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm text-white/70 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@email.com"
                                required
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-white/70 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Min. 6 characters"
                                required
                                minLength={6}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 outline-none transition-all"
                            />
                        </div>

                        {isRegister && (
                            <div>
                                <label className="block text-sm text-white/70 mb-1 flex items-center gap-1">
                                    <Building size={14} /> School Invite Code (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={schoolCode}
                                    onChange={e => setSchoolCode(e.target.value)}
                                    placeholder="Ask your teacher"
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 outline-none transition-all font-mono"
                                />
                            </div>
                        )}

                        {(localError || error) && (
                            <div className="bg-red-500/20 border border-red-400/30 text-red-100 px-4 py-3 rounded-xl text-sm">
                                {localError || error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 bg-white text-indigo-700 font-bold py-3 rounded-xl shadow-lg hover:shadow-xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : isRegister ? (
                                <><UserPlus size={18} /> Create Account</>
                            ) : (
                                <><LogIn size={18} /> Sign In</>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => { setIsRegister(!isRegister); setLocalError(''); }}
                            className="text-white/60 hover:text-white text-sm transition-colors flex items-center justify-center gap-1 mx-auto"
                        >
                            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                            <ArrowRight size={14} />
                        </button>
                    </div>
                </div>

                <p className="text-center text-white/30 text-xs mt-6">
                    Practice 6 languages • AI-powered corrections • School support
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
