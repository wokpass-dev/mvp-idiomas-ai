
import React, { useState, useEffect } from 'react';
import { fetchAdminUsers, fetchAdminStats, deleteUser } from '../services/api';
import { ArrowLeft, Users, BarChart3, Trash2, Shield, Activity, Key } from 'lucide-react';

interface AdminUser {
    id: string;
    email: string;
    name: string;
    role: string;
    messageCount: number;
    level: string;
    language: string;
    lastActive: string;
    createdAt: string;
}

interface AdminStats {
    totalUsers: number;
    totalMessages: number;
    activeToday: number;
    apiKeyConfigured: boolean;
}

interface AdminPageProps {
    onBack: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onBack }) => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');

    useEffect(() => {
        Promise.all([fetchAdminUsers(), fetchAdminStats()])
            .then(([usersData, statsData]) => {
                setUsers(usersData.users || []);
                setStats(statsData);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (userId: string, email: string) => {
        if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
        try {
            await deleteUser(userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <Shield className="text-purple-400" size={20} />
                        <h1 className="text-xl font-bold">TalkMe Admin</h1>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
                    >
                        <BarChart3 size={16} className="inline mr-1" /> Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
                    >
                        <Users size={16} className="inline mr-1" /> Users
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-6">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">System Overview</h2>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-blue-500/20 rounded-lg"><Users className="text-blue-400" size={20} /></div>
                                </div>
                                <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
                                <p className="text-xs text-slate-500 mt-1">Total Users</p>
                            </div>

                            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-emerald-500/20 rounded-lg"><Activity className="text-emerald-400" size={20} /></div>
                                </div>
                                <p className="text-3xl font-bold">{stats?.totalMessages || 0}</p>
                                <p className="text-xs text-slate-500 mt-1">Total Messages</p>
                            </div>

                            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-amber-500/20 rounded-lg"><BarChart3 className="text-amber-400" size={20} /></div>
                                </div>
                                <p className="text-3xl font-bold">{stats?.activeToday || 0}</p>
                                <p className="text-xs text-slate-500 mt-1">Active Today</p>
                            </div>

                            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-green-500/20 rounded-lg"><Key className="text-green-400" size={20} /></div>
                                </div>
                                <p className="text-xl font-bold">{stats?.apiKeyConfigured ? '✅ Active' : '❌ Missing'}</p>
                                <p className="text-xs text-slate-500 mt-1">Gemini API Key</p>
                            </div>
                        </div>

                        {/* Top Users */}
                        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                            <h3 className="font-bold mb-4">Top Users by Messages</h3>
                            <div className="space-y-2">
                                {[...users].sort((a, b) => b.messageCount - a.messageCount).slice(0, 5).map(u => (
                                    <div key={u.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-sm font-bold">
                                                {u.name[0]?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{u.name}</p>
                                                <p className="text-xs text-slate-500">{u.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-indigo-400">{u.messageCount} msgs</p>
                                            <p className="text-xs text-slate-500">{u.level} • {u.language}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">User Management</h2>
                            <span className="text-sm text-slate-500">{users.length} users total</span>
                        </div>

                        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-semibold">
                                        <tr>
                                            <th className="p-4">User</th>
                                            <th className="p-4">Role</th>
                                            <th className="p-4">Level</th>
                                            <th className="p-4">Language</th>
                                            <th className="p-4">Messages</th>
                                            <th className="p-4">Last Active</th>
                                            <th className="p-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700 text-sm">
                                        {users.map(u => (
                                            <tr key={u.id} className="hover:bg-slate-700/30 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                                                            {u.name[0]?.toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{u.name}</p>
                                                            <p className="text-xs text-slate-500">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-600 text-slate-300'}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-mono">{u.level}</td>
                                                <td className="p-4">{u.language}</td>
                                                <td className="p-4 font-bold text-indigo-400">{u.messageCount}</td>
                                                <td className="p-4 text-slate-400 text-xs">{u.lastActive ? new Date(u.lastActive).toLocaleDateString() : 'N/A'}</td>
                                                <td className="p-4">
                                                    {u.role !== 'admin' && (
                                                        <button
                                                            onClick={() => handleDelete(u.id, u.email)}
                                                            className="text-red-400 hover:text-red-300 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPage;
