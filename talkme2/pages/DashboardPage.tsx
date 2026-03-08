import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchUserStats } from '../services/api';
import { BarChart3, MessageSquare, Globe, GraduationCap, LogOut, Shield, Building, Building2 } from 'lucide-react';
import { LANGUAGE_FLAGS } from '../constants';
import { Language } from '../types';

interface Stats {
    messageCount: number;
    level: string;
    language: string;
    lastActive: string;
    memberSince: string;
}

interface DashboardPageProps {
    onGoToChat: () => void;
    onGoToAdmin: () => void;
    onGoToSchool: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onGoToChat, onGoToAdmin, onGoToSchool }) => {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        fetchUserStats().then(setStats).catch(console.error);
    }, []);

    const formatDate = (dateStr: string) => {
        try { return new Date(dateStr).toLocaleDateString(); } catch { return 'N/A'; }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-indigo-600">TalkMe</h1>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-bold">Dashboard</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">

                    {user?.role === 'admin' && (
                        <button onClick={onGoToAdmin} className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg font-bold hover:bg-purple-200 transition-colors flex items-center gap-1">
                            <Shield size={14} /> Super Admin
                        </button>
                    )}

                    {user?.role === 'client' && (
                        <button onClick={onGoToSchool} className="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg font-bold hover:bg-amber-200 transition-colors flex items-center gap-1">
                            <Building2 size={14} /> School Dashboard
                        </button>
                    )}

                    <div className="flex items-center gap-2 border-l pl-3 ml-2">
                        <span className="text-sm font-medium text-slate-700">{user?.name}</span>
                        <button
                            onClick={logout}
                            className="p-2 bg-slate-100 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Log out"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-6 space-y-8">
                {/* Welcome */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-md">
                    <h2 className="text-3xl font-bold mb-1">Hello, {user?.name || 'Learner'}! 👋</h2>
                    <p className="text-white/70 mb-6">Let's keep up the great work on your language journey.</p>

                    {user?.schoolId && (
                        <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg text-sm mb-6 border border-white/20">
                            <Building size={16} /> Enrolled in School <strong className="font-mono bg-white/30 px-1.5 py-0.5 rounded ml-1">{user.schoolId}</strong>
                        </div>
                    )}

                    <div>
                        <button
                            onClick={onGoToChat}
                            className="bg-white text-indigo-700 font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                        >
                            <MessageSquare size={18} /> Start Practicing
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-5 border shadow-sm flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 bg-indigo-50 rounded-lg"><MessageSquare className="text-indigo-600" size={16} /></div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Messages</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-800">{stats?.messageCount || 0}</p>
                    </div>

                    <div className="bg-white rounded-xl p-5 border shadow-sm flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 bg-amber-50 rounded-lg"><GraduationCap className="text-amber-600" size={16} /></div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Level</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-800">{stats?.level || 'A1'}</p>
                    </div>

                    <div className="bg-white rounded-xl p-5 border shadow-sm flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 bg-emerald-50 rounded-lg"><Globe className="text-emerald-600" size={16} /></div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Language</span>
                        </div>
                        <p className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <span>{LANGUAGE_FLAGS[(stats?.language || 'English') as Language] || '🌍'}</span>
                            <span className="truncate">{stats?.language || 'English'}</span>
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-5 border shadow-sm flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 bg-blue-50 rounded-lg"><BarChart3 className="text-blue-600" size={16} /></div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Member Since</span>
                        </div>
                        <p className="text-lg font-bold text-slate-800">{formatDate(stats?.memberSince || '')}</p>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default DashboardPage;
