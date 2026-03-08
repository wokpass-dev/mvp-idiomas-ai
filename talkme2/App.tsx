import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import AdminPage from './pages/AdminPage';
import SchoolDashboard from './pages/SchoolDashboard';

type Page = 'login' | 'dashboard' | 'chat' | 'admin' | 'school';

const AppContent: React.FC = () => {
    const { user, isLoading } = useAuth();
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-indigo-600 font-bold tracking-widest uppercase text-xs">Loading TalkMe...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <LoginPage />;
    }

    switch (currentPage) {
        case 'chat':
            return <ChatPage onBack={() => setCurrentPage('dashboard')} />;
        case 'admin':
            if (user.role !== 'admin') {
                setCurrentPage('dashboard');
                return null;
            }
            return <AdminPage onBack={() => setCurrentPage('dashboard')} />;
        case 'school':
            if (user.role !== 'client' && user.role !== 'admin') {
                setCurrentPage('dashboard');
                return null;
            }
            return <SchoolDashboard onBack={() => setCurrentPage('dashboard')} />;
        case 'dashboard':
        default:
            return (
                <DashboardPage
                    onGoToChat={() => setCurrentPage('chat')}
                    onGoToAdmin={() => setCurrentPage('admin')}
                    onGoToSchool={() => setCurrentPage('school')}
                />
            );
    }
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;
