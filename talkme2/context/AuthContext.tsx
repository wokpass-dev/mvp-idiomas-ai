import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'client' | 'admin';
    schoolId?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string, schoolCode?: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE = import.meta.env.VITE_API_URL || 'https://mvp-idiomas-server.onrender.com';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('talkme_token'));
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            fetch(`${API_BASE}/api/talkme/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.ok ? res.json() : Promise.reject())
                .then(data => setUser(data))
                .catch(() => { setToken(null); localStorage.removeItem('talkme_token'); })
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        setError(null);
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/talkme/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('talkme_token', data.token);
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (email: string, password: string, name: string, schoolCode?: string) => {
        setError(null);
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/talkme/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name, schoolCode })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Registration failed');
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('talkme_token', data.token);
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('talkme_token');
        localStorage.removeItem('talkme_v2_session');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, isLoading, error }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
