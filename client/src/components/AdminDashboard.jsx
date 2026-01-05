import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard,
    Users,
    Tag,
    Settings,
    DollarSign,
    Activity,
    Save,
    Plus,
    Lock
} from 'lucide-react';

const AdminDashboard = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('billing');

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'Lore2027$') {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Contraseña incorrecta');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-2xl border border-slate-700 w-full max-w-md shadow-2xl">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-slate-700 rounded-full">
                            <Lock className="w-8 h-8 text-blue-400" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white text-center mb-6">Acceso Administrativo</h2>
                    <div className="mb-6">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Contraseña Maestra"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                        Entrar al Panel
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-800 border-r border-slate-700 p-6 flex flex-col hidden md:flex">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-10">
                    Admin Panel
                </h1>

                <nav className="space-y-2 flex-1">
                    <SidebarItem
                        icon={<DollarSign />}
                        label="Facturación"
                        isActive={activeTab === 'billing'}
                        onClick={() => setActiveTab('billing')}
                    />
                    <SidebarItem
                        icon={<Tag />}
                        label="Promociones"
                        isActive={activeTab === 'promos'}
                        onClick={() => setActiveTab('promos')}
                    />
                    <SidebarItem
                        icon={<Users />}
                        label="Usuarios & Progreso"
                        isActive={activeTab === 'users'}
                        onClick={() => setActiveTab('users')}
                    />
                    <SidebarItem
                        icon={<Settings />}
                        label="Configuración"
                        isActive={activeTab === 'settings'}
                        onClick={() => setActiveTab('settings')}
                    />
                </nav>

                <div className="text-xs text-slate-500 mt-auto">
                    v1.1.0 - MVP Idiomas Secure
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-10 overflow-y-auto">
                <div className="md:hidden mb-6 flex gap-2 overflow-x-auto pb-2">
                    {/* Mobile Nav Tabs */}
                    <button onClick={() => setActiveTab('billing')} className={`px-4 py-2 rounded-lg ${activeTab === 'billing' ? 'bg-blue-600' : 'bg-slate-800'}`}>Pagos</button>
                    <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg ${activeTab === 'users' ? 'bg-blue-600' : 'bg-slate-800'}`}>Usuarios</button>
                </div>

                {activeTab === 'billing' && <BillingSection />}
                {activeTab === 'promos' && <PromotionsSection />}
                {activeTab === 'users' && <UsersSection />}
            </main>
        </div>
    );
};

// Components
const SidebarItem = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${isActive ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'}`}
    >
        {React.cloneElement(icon, { size: 20 })}
        <span className="font-medium">{label}</span>
    </button>
);

const BillingSection = () => {
    const [keys, setKeys] = useState({
        stripePublic: '',
        stripeSecret: '',
        paypalClient: ''
    });

    useEffect(() => {
        const saved = localStorage.getItem('billingKeys');
        if (saved) setKeys(JSON.parse(saved));
    }, []);

    const handleSave = () => {
        localStorage.setItem('billingKeys', JSON.stringify(keys));
        alert('Claves guardadas en local (Modo Seguro MVP)');
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-3xl font-bold mb-6">Configuración de Pasarelas</h2>

            <div className="grid grid-cols-1 gap-6 mb-8 max-w-4xl">
                <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <CreditCard className="text-blue-400" /> Credenciales de API
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Stripe Public Key</label>
                            <input
                                type="text"
                                value={keys.stripePublic}
                                onChange={e => setKeys({ ...keys, stripePublic: e.target.value })}
                                placeholder="pk_test_..."
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white font-mono text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Stripe Secret Key</label>
                            <input
                                type="password"
                                value={keys.stripeSecret}
                                onChange={e => setKeys({ ...keys, stripeSecret: e.target.value })}
                                placeholder="sk_test_..."
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white font-mono text-sm"
                            />
                        </div>
                        <div className="pt-4 border-t border-slate-700">
                            <label className="block text-sm text-slate-400 mb-1">PayPal Client ID</label>
                            <input
                                type="text"
                                value={keys.paypalClient}
                                onChange={e => setKeys({ ...keys, paypalClient: e.target.value })}
                                placeholder="AbC123..."
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white font-mono text-sm"
                            />
                        </div>
                        <button
                            onClick={handleSave}
                            className="w-full mt-4 bg-green-600 hover:bg-green-500 text-white p-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-bold"
                        >
                            <Save size={18} /> Guardar Credeciales
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const PromotionsSection = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Same as before... */}
        <h2 className="text-3xl font-bold mb-6">Gestión de Promociones</h2>
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 text-center">
            <p className="text-slate-400">Sistema de cupones listo para configurar en Base de Datos.</p>
        </div>
    </motion.div>
);

const UsersSection = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch real users from backend
        // Use hardcoded URL to avoid env issues
        const API_URL = 'https://mvp-idiomas-server.onrender.com/api';
        fetch(`${API_URL}/admin/users`)
            .then(res => res.json())
            .then(data => {
                setUsers(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching users:', err);
                setLoading(false);
            });
    }, []);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-3xl font-bold mb-6">Progreso de Usuarios (En Vivo)</h2>
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                {loading ? (
                    <p className="text-center text-slate-400">Cargando base de clientes...</p>
                ) : (
                    <div className="space-y-2">
                        {users.map((user, i) => (
                            <div key={user.id || i} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center font-bold text-white shadow-lg">
                                        {(user.email || 'U')[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white max-w-[150px] truncate md:max-w-none">{user.email || `Usuario ${i}`}</p>
                                        <p className="text-xs text-slate-500">ID: {user.id ? user.id.substring(0, 8) : 'anon'}...</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-green-400 font-bold">{user.progress || 'Nivel A1'}</p>
                                    <p className="text-xs text-slate-500">Último acceso: Hoy</p>
                                </div>
                            </div>
                        ))}
                        {users.length === 0 && <p className="text-slate-500 text-center">No hay usuarios registrados aún.</p>}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default AdminDashboard;
