
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';
import HomePage from './pages/HomePage';
import MasterFormulationsPage from './pages/MasterFormulationsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import ServicesPage from './pages/ServicesPage';
import MorePage from './pages/MorePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import LegalPage from './pages/LegalPage';
import InformationPage from './pages/InformationPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import FAQPage from './pages/FAQPage';
import AuthPage from './pages/AuthPage';

const PageTitle: React.FC = () => {
    const location = useLocation();
    
    const getPageInfo = () => {
        const path = location.pathname;
        if (path === '/') return { title: 'Nuestros Servicios', subtitle: 'Todo lo que necesitas, al alcance de tu mano.' };
        if (path === '/orders') return { title: 'Mis Pedidos', subtitle: 'Estado de tus solicitudes y compras.' };
        if (path === '/profile') return { title: 'Mi Perfil', subtitle: 'Gestiona tus datos y preferencias.' };
        if (path === '/formulation') return { title: 'Fórmulas Magistrales', subtitle: 'Laboratorio de formulación personalizada.' };
        if (path === '/appointments') return { title: 'Pedir Cita', subtitle: 'Reserva tu hueco con nosotros.' };
        if (path === '/more') return { title: 'Perfil', subtitle: 'Otras secciones e información útil.' };
        if (path === '/about') return { title: 'Nosotros', subtitle: 'Conoce nuestra historia y equipo.' };
        if (path === '/contact') return { title: 'Ubicación', subtitle: 'Dónde estamos y cómo contactar.' };
        if (path === '/legal') return { title: 'Aviso Legal', subtitle: 'Términos, condiciones y privacidad.' };
        if (path === '/information') return { title: 'Información', subtitle: 'Horarios, guardias y urgencias.' };
        if (path === '/faq') return { title: 'Preguntas Frecuentes', subtitle: 'Resolvemos tus dudas habituales.' };
        
        if (path.startsWith('/services/')) {
            const serviceId = path.split('/').pop() || '';
            const titles: Record<string, string> = {
                'spd': 'Servicio SPD',
                'dermofarmacia': 'Dermo Análisis',
                'veterinaria': 'Vet-Farmacia',
                'analisis': 'Análisis Bioquímicos',
                'fitoterapia': 'Fitoterapia Natural',
                'cosmetica': 'Cosmética a Medida'
            };
            return { title: titles[serviceId] || 'Servicio Especializado', subtitle: 'Cuidado profesional personalizado.' };
        }
        
        if (path.startsWith('/tracking/')) return { title: 'Seguimiento', subtitle: 'Localiza tu pedido en tiempo real.' };
        
        return null;
    };

    const info = getPageInfo();
    if (!info) return null;

    return (
        <div className="text-center mb-6 mt-6 px-4 animate-fade-in">
            <h2 className="text-2xl font-bold text-brand-dark dark:text-slate-100 uppercase tracking-tight italic leading-tight">{info.title}</h2>
            {info.subtitle && <p className="text-gray-500 dark:text-slate-400 text-xs mt-1.5 font-medium">{info.subtitle}</p>}
        </div>
    );
};

const App: React.FC = () => {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-light dark:bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-green border-t-transparent"></div>
            </div>
        );
    }

    if (!session) {
        return <AuthPage />;
    }

    return (
        <div className="bg-brand-light dark:bg-slate-950 font-sans min-h-screen transition-colors duration-300">
            <div className="max-w-md mx-auto min-h-screen bg-white dark:bg-slate-900 shadow-2xl flex flex-col relative">
                <Header />
                <PageTitle />
                <main className="flex-grow pb-24">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/formulation" element={<MasterFormulationsPage />} />
                        <Route path="/appointments" element={<AppointmentsPage />} />
                        <Route path="/orders" element={<OrdersPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/services/:serviceId" element={<ServicesPage />} />
                        <Route path="/more" element={<MorePage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/legal" element={<LegalPage />} />
                        <Route path="/information" element={<InformationPage />} />
                        <Route path="/tracking/:orderId" element={<OrderTrackingPage />} />
                        <Route path="/faq" element={<FAQPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
                <BottomNav />
            </div>
        </div>
    );
};

export default App;
