
import React, { useState } from 'react';
import ServiceCard from '../components/ServiceCard';
import { Link } from 'react-router-dom';
import { BeakerIcon, CalendarIcon, SparklesIcon, PawIcon, PillIcon, LocationMarkerIcon, ChatbotIcon, PackageIcon } from '../components/Icons';

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
    },
    {
        title: '2x1 en Fotoprotección Facial',
        description: 'Protege tu piel con las mejores marcas de laboratorio.',
        imageUrl: 'https://picsum.photos/seed/sun/200/200',
        badge: '2x1',
        link: '/orders'
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

const PromotionsSection: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const prevSlide = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? promotionsData.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const nextSlide = () => {
        const isLastSlide = currentIndex === promotionsData.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    const goToSlide = (slideIndex: number) => {
        setCurrentIndex(slideIndex);
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 mt-6 transition-colors">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-brand-dark dark:text-slate-100">Promociones y Campañas</h3>
                <span className="bg-brand-green/10 text-brand-green text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Activas</span>
            </div>
            
            <div className="relative group">
                <div className="overflow-hidden rounded-lg">
                    <div 
                        className="flex transition-transform duration-500 ease-out" 
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {promotionsData.map((promo, index) => (
                            <div key={index} className="w-full flex-shrink-0 px-1">
                                <PromotionCard promo={promo} />
                            </div>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={prevSlide}
                    className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-2 bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-md text-brand-green hover:bg-gray-100 dark:hover:bg-slate-700 z-10 border border-gray-100 dark:border-slate-700 focus:outline-none hidden group-hover:block"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <button 
                    onClick={nextSlide}
                    className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-2 bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-md text-brand-green hover:bg-gray-100 dark:hover:bg-slate-700 z-10 border border-gray-100 dark:border-slate-700 focus:outline-none hidden group-hover:block"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            <div className="flex justify-center mt-4 space-x-2">
                {promotionsData.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-2 w-2 rounded-full transition-all duration-300 ${currentIndex === index ? 'bg-brand-green w-4' : 'bg-gray-300 dark:bg-slate-700 w-2'}`}
                    ></button>
                ))}
            </div>
        </div>
    );
};

const SupportFAB: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-24 right-5 z-40 flex flex-col items-end space-y-2.5">
            <div className={`flex flex-col items-end space-y-2.5 transition-all duration-300 transform ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}`}>
                <a 
                    href="tel:965386909"
                    className="flex items-center bg-white dark:bg-slate-800 text-brand-dark dark:text-slate-100 px-3.5 py-2 rounded-full shadow-lg border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
                >
                    <span className="mr-2.5 text-[10px] font-bold uppercase tracking-wider">Llamar</span>
                    <div className="bg-brand-green p-1.5 rounded-full text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                    </div>
                </a>

                <a 
                    href="https://wa.me/34610755819" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center bg-white dark:bg-slate-800 text-brand-dark dark:text-slate-100 px-3.5 py-2 rounded-full shadow-lg border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
                >
                    <span className="mr-2.5 text-[10px] font-bold uppercase tracking-wider">WhatsApp</span>
                    <div className="bg-[#25D366] p-1.5 rounded-full text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.487 5.235 3.487 8.413 0 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.459l-6.354 1.652zm6.225-3.148l.351.207c1.494.882 3.163 1.349 4.897 1.349 5.46 0 9.908-4.448 9.908-9.908s-4.448-9.908-9.908-9.908c-5.46 0-9.908 4.448-9.908 9.908 0 1.79.465 3.528 1.318 5.063l.215.371-1.027 3.745 3.846-1.012z" />
                        </svg>
                    </div>
                </a>
            </div>

            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center bg-brand-green text-white px-3.5 py-2 rounded-full shadow-xl transition-all active:scale-95 ${isOpen ? 'ring-4 ring-brand-green/10' : ''}`}
            >
                <div className={`transition-transform duration-300 mr-2 ${isOpen ? 'rotate-90' : 'rotate-0'}`}>
                    {isOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    )}
                </div>
                <span className="font-bold text-[11px] uppercase tracking-wider">¿Dudas?</span>
            </button>
        </div>
    );
};

const HomePage: React.FC = () => {
    const quickAccessServices: Service[] = [
        { title: 'SPD', description: 'Dosificación', icon: PillIcon, to: '/services/spd' },
        { title: 'Fórmulas', description: 'Preparados', icon: BeakerIcon, to: '/formulation' },
        { title: 'Encargar Pedido', description: 'Farmacia', icon: PackageIcon, to: '/orders' },
        { title: 'Pedir Cita', description: 'Salud', icon: CalendarIcon, to: '/appointments', titleClassName: 'text-brand-green' },
    ];
    
    const bannerServices: Service[] = [
        { title: 'Dermo Análisis', description: '', icon: SparklesIcon, to: '/services/dermofarmacia' },
        { title: 'Veterinaria', description: '', icon: PawIcon, to: '/services/veterinaria' },
        { title: 'Cosmética', description: '', icon: SparklesIcon, to: '/services/cosmetica' },
        { title: 'Análisis', description: '', icon: BeakerIcon, to: '/services/analisis' },
    ];
    
    return (
        <div className="p-4 bg-brand-light dark:bg-slate-950 transition-colors">
            <div className="grid grid-cols-2 gap-4 mb-6">
                {quickAccessServices.map(service => (
                    <div key={service.title}>
                        <ServiceCard {...service} />
                    </div>
                ))}
            </div>

            <div className="mb-2">
                <h3 className="text-sm font-bold text-gray-500 dark:text-slate-500 mb-2 px-1 uppercase tracking-wide">Otros Servicios</h3>
                <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
                    {bannerServices.map((service, index) => (
                        <Link 
                            key={index} 
                            to={service.to} 
                            className="flex-shrink-0 w-24 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm flex flex-col items-center justify-center text-center border border-gray-100 dark:border-slate-700 active:scale-95 transition-transform h-20"
                        >
                            <div className="bg-brand-light dark:bg-slate-700 p-1.5 rounded-full mb-1">
                                <service.icon className="h-5 w-5 text-brand-green" />
                            </div>
                            <span className="text-[10px] font-bold text-brand-dark dark:text-slate-100 leading-tight">{service.title}</span>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <PromotionsSection />
            </div>
            
            <SupportFAB />
        </div>
    );
};

export default HomePage;
