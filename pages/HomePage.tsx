import React, { useState } from 'react';
import ServiceCard from '../components/ServiceCard';
import { Link } from 'react-router-dom';
import { BeakerIcon, CalendarIcon, SparklesIcon, PawIcon, PillIcon, PackageIcon } from '../components/Icons';

type Service = {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    to: string;
    fullWidth?: boolean;
    titleClassName?: string;
};

const promotionsData = [
    {
        title: '10% Dto. en Higiene Dental',
        description: 'En todas las marcas seleccionadas durante este mes.',
        imageUrl: 'https://picsum.photos/seed/dental/200/200',
        badge: '-10%',
        link: '/orders'
    },
    {
        title: 'Campaña Revisión Capilar Gratis',
        description: 'Diagnóstico personalizado con microcámara. Pide tu cita.',
        imageUrl: 'https://picsum.photos/seed/hair/200/200',
        badge: 'GRATIS',
        link: '/appointments'
    }
];

const PromotionCard: React.FC<{ promo: typeof promotionsData[0] }> = ({ promo }) => (
    <Link to={promo.link} className="flex items-center p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors space-x-4 h-full border border-gray-100 dark:border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-brand-green text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
            {promo.badge}
        </div>
        <img src={promo.imageUrl} alt={promo.title} className="w-20 h-20 rounded-md object-cover flex-shrink-0" />
        <div className="flex flex-col justify-center h-full py-1 pr-6">
            <h4 className="font-bold text-sm text-brand-dark dark:text-slate-100 leading-tight">{promo.title}</h4>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 leading-snug">{promo.description}</p>
            <span className="text-xs font-semibold text-brand-green mt-2 self-start">Ver promoción &rarr;</span>
        </div>
    </Link>
);

const SupportFAB: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="fixed bottom-24 right-5 z-40 flex flex-col items-end space-y-2.5">
            <div className={`flex flex-col items-end space-y-2.5 transition-all duration-300 transform ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}`}>
                <a href="tel:965386909" className="flex items-center bg-white dark:bg-slate-800 text-brand-dark px-3.5 py-2 rounded-full shadow-lg border border-gray-100">
                    <span className="mr-2.5 text-[10px] font-bold uppercase tracking-wider">Llamar</span>
                    <div className="bg-brand-green p-1.5 rounded-full text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    </div>
                </a>
                <a href="https://wa.me/34610755819" target="_blank" rel="noopener noreferrer" className="flex items-center bg-white dark:bg-slate-800 text-brand-dark px-3.5 py-2 rounded-full shadow-lg border border-gray-100">
                    <span className="mr-2.5 text-[10px] font-bold uppercase tracking-wider">WhatsApp</span>
                    <div className="bg-[#25D366] p-1.5 rounded-full text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.487 5.235 3.487 8.413 0 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.459l-6.354 1.652zm6.225-3.148l.351.207c1.494.882 3.163 1.349 4.897 1.349 5.46 0 9.908-4.448 9.908-9.908s-4.448-9.908-9.908-9.908c-5.46 0-9.908 4.448-9.908 9.908 0 1.79.465 3.528 1.318 5.063l.215.371-1.027 3.745 3.846-1.012z" /></svg>
                    </div>
                </a>
            </div>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center bg-brand-green text-white px-3.5 py-2 rounded-full shadow-xl transition-all">
                <span className="font-bold text-[11px] uppercase tracking-wider">{isOpen ? 'Cerrar' : '¿Dudas?'}</span>
            </button>
        </div>
    );
};

const HomePage: React.FC = () => {
    const quickAccessServices: Service[] = [
        { title: 'SPD', description: 'Dosificación', icon: PillIcon, to: '/services/spd' },
        { title: 'Fórmulas', description: 'Preparados', icon: BeakerIcon, to: '/formulation' },
        { title: 'Encargar Pedido', description: 'Farmacia', icon: PackageIcon, to: '/orders' },
        { title: 'Pedir Cita', description: 'Salud', icon: CalendarIcon, to: '/appointments', titleClassName: 'text-brand-green font-bold' },
    ];

    const bannerServices: Service[] = [
        { title: 'Dermo', description: '', icon: SparklesIcon, to: '/services/dermofarmacia' },
        { title: 'Veterinaria', description: '', icon: PawIcon, to: '/services/veterinaria' },
        { title: 'Cosmética', icon: SparklesIcon, to: '/services/cosmetica' },
        { title: 'Análisis', icon: BeakerIcon, to: '/services/analisis' },
    ];

    return (
        <div className="p-4 bg-brand-light dark:bg-slate-950 transition-colors min-h-screen pb-24">
            <div className="grid grid-cols-2 gap-4 mb-6">
                {quickAccessServices.map(service => (
                    <ServiceCard key={service.title} {...service} />
                ))}
            </div>

            <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-500 mb-2 px-1 uppercase tracking-wide">Otros Servicios</h3>
                <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
                    {bannerServices.map((service, index) => (
                        <Link key={index} to={service.to} className="flex-shrink-0 w-24 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm flex flex-col items-center justify-center text-center border border-gray-100 h-20">
                            <service.icon className="h-5 w-5 text-brand-green mb-1" />
                            <span className="text-[10px] font-bold text-brand-dark dark:text-slate-100 leading-tight">{service.title}</span>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-bold text-brand-dark dark:text-slate-100">Promociones</h3>
                {promotionsData.map((promo, index) => (
                    <PromotionCard key={index} promo={promo} />
                ))}
            </div>
            
            <SupportFAB />
        </div>
    );
};

export default HomePage;