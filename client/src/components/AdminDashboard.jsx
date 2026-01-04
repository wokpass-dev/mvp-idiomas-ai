import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard,
    Users,
    Tag,
    Settings,
    DollarSign,
    Activity,
    Save,
    Plus
} from 'lucide-react';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('billing');

    return (
        <div className="min-h-screen bg-slate-900 text-white flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-800 border-r border-slate-700 p-6 flex flex-col">
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
                    v1.0.0 - MVP Idiomas Also
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-10 overflow-y-auto">
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

const BillingSection = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-3xl font-bold mb-6">Configuración de Pagos</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="text-blue-400" /> Pasarelas de Pago
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <span>Stripe</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked className="sr-only peer" readOnly />
                            <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <span>PayPal</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <span>MercadoPago</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="text-green-400" /> Precios Base
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Plan Mensual (USD)</label>
                        <input type="number" defaultValue="9.99" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Plan Anual (USD)</label>
                        <input type="number" defaultValue="89.99" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white" />
                    </div>
                    <button className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 p-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <Save size={18} /> Guardar Precios
                    </button>
                </div>
            </div>
        </div>
    </motion.div>
);

const PromotionsSection = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Gestión de Promociones</h2>
            <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <Plus size={18} /> Crear Cupón
            </button>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-900/50">
                    <tr>
                        <th className="p-4 text-slate-400 font-medium">Código</th>
                        <th className="p-4 text-slate-400 font-medium">Descuento</th>
                        <th className="p-4 text-slate-400 font-medium">Uso</th>
                        <th className="p-4 text-slate-400 font-medium">Estado</th>
                        <th className="p-4 text-slate-400 font-medium">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                    <tr>
                        <td className="p-4 font-mono text-yellow-400">LANZAMIENTO2026</td>
                        <td className="p-4">50% OFF</td>
                        <td className="p-4">12/100</td>
                        <td className="p-4"><span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">Activo</span></td>
                        <td className="p-4"><button className="text-slate-400 hover:text-white">Editar</button></td>
                    </tr>
                    <tr>
                        <td className="p-4 font-mono text-yellow-400">ESTUDIANTE</td>
                        <td className="p-4">20% OFF</td>
                        <td className="p-4">450/∞</td>
                        <td className="p-4"><span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">Activo</span></td>
                        <td className="p-4"><button className="text-slate-400 hover:text-white">Editar</button></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </motion.div>
);

const UsersSection = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-3xl font-bold mb-6">Progreso de Usuarios (Inmutable)</h2>
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
            <p className="text-slate-400 mb-4">
                El progreso se registra en Supabase y es de solo lectura para los usuarios. Solo los administradores pueden realizar ajustes manuales.
            </p>
            <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 p-4 rounded-xl flex gap-3">
                <Activity />
                <div>
                    <h4 className="font-bold">Registro de Auditoría</h4>
                    <p className="text-sm opacity-80">Todas las modificaciones de nivel quedan registradas con ID de transacción blockchain (Simulado para MVP).</p>
                </div>
            </div>

            <div className="mt-6 space-y-2">
                {/* Mock User List */}
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold">U{i}</div>
                            <div>
                                <p className="font-bold text-white">Usuario Demo {i}</p>
                                <p className="text-xs text-slate-500">usuario{i}@ejemplo.com</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-blue-400 font-bold">Nivel 2 - 45%</p>
                            <p className="text-xs text-slate-500">Última actividad: Hace 2h</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </motion.div>
);

export default AdminDashboard;
