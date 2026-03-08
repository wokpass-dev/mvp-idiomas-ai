import React, { useState, useEffect } from 'react';
import { fetchSchoolDashboard, updateSchoolPrompt } from '../services/api';
import { Users, Save, Edit3, ArrowLeft, Building2, Copy, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Student {
    id: string;
    email: string;
    name: string;
    messageCount: number;
    level: string;
    language: string;
    lastActive: string;
}

interface SchoolDashboardProps {
    onBack: () => void;
}

const SchoolDashboard: React.FC<SchoolDashboardProps> = ({ onBack }) => {
    const { user } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [schoolInfo, setSchoolInfo] = useState<{ id: string, name: string, customPrompt: string, inviteCode: string } | null>(null);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchSchoolDashboard()
            .then(data => {
                setSchoolInfo(data.school);
                setPrompt(data.school.customPrompt || '');
                setStudents(data.students || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleSavePrompt = async () => {
        setSaving(true);
        try {
            await updateSchoolPrompt(prompt);
            alert('Tutor instructions updated successfully!');
        } catch (err) {
            alert('Failed to update instructions.');
        } finally {
            setSaving(false);
        }
    };

    const copyCode = () => {
        if (schoolInfo) {
            navigator.clipboard.writeText(schoolInfo.inviteCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-slate-400 hover:text-indigo-600 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-100 rounded-lg"><Building2 size={20} className="text-indigo-600" /></div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800">{schoolInfo?.name || 'School Dashboard'}</h1>
                            <p className="text-xs text-slate-500">Teacher Portal</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Stats & Invite */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 border shadow-sm">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Invite Students</h3>
                        <p className="text-sm text-slate-600 mb-4">
                            Share this code with your students so they join your virtual classroom when creating an account.
                        </p>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 bg-slate-100 px-4 py-3 rounded-xl text-indigo-700 font-mono text-sm border">
                                {schoolInfo?.inviteCode}
                            </code>
                            <button
                                onClick={copyCode}
                                className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                                title="Copy code"
                            >
                                {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-md">
                        <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-2">Total Students</h3>
                        <div className="flex items-end gap-3">
                            <span className="text-5xl font-bold">{students.length}</span>
                            <Users size={32} className="opacity-50 pb-1" />
                        </div>
                    </div>
                </div>

                {/* Middle Column: Prompt Editor */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl p-6 border shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Edit3 className="text-amber-500" size={24} />
                                <h2 className="text-xl font-bold text-slate-800">Study Plan Prompt</h2>
                            </div>
                            <button
                                onClick={handleSavePrompt}
                                disabled={saving}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                            >
                                {saving ? "Saving..." : <><Save size={16} /> Save Changes</>}
                            </button>
                        </div>

                        <p className="text-sm text-slate-500 mb-4">
                            Customize the AI tutor for your students. Tell the AI how to behave, what syllabus to teach, or specific vocabulary to reinforce.
                            Leave it empty to use the TalkMe default syllabus.
                        </p>

                        <div className="bg-slate-50 p-3 rounded-lg border border-indigo-100 mb-4 text-xs text-indigo-800">
                            <strong>Dynamic Variables:</strong> You can use <code>{'{level}'}</code> and <code>{'{language}'}</code> in your prompt, and the system will automatically inject the student's current settings.
                        </div>

                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Example: You are specialized in Business English. Focus strictly on corporate vocabulary, email writing, and formal negotiations. The student is at {level} level in {language}..."
                            className="w-full h-64 p-4 border rounded-xl bg-slate-50 text-slate-700 font-mono text-sm resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    {/* Students List */}
                    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-bold text-slate-800">Your Students</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                                    <tr>
                                        <th className="p-4">Student</th>
                                        <th className="p-4">Focus</th>
                                        <th className="p-4">Progress (Msgs)</th>
                                        <th className="p-4">Last Session</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-sm">
                                    {students.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-slate-400">
                                                No students have joined your school yet. Send them your invite code.
                                            </td>
                                        </tr>
                                    ) : students.map(s => (
                                        <tr key={s.id} className="hover:bg-slate-50">
                                            <td className="p-4">
                                                <p className="font-bold text-slate-800">{s.name}</p>
                                                <p className="text-xs text-slate-500">{s.email}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className="font-medium text-indigo-700">{s.language}</span>
                                                <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">{s.level}</span>
                                            </td>
                                            <td className="p-4 font-bold text-slate-700">{s.messageCount}</td>
                                            <td className="p-4 text-slate-500 text-xs">{new Date(s.lastActive).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default SchoolDashboard;
