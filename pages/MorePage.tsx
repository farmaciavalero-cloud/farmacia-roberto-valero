import React from 'react';
import { Link } from 'react-router-dom';
import { UserCircleIcon, ShieldCheckIcon, InformationCircleIcon, QuestionMarkCircleIcon } from '../components/Icons';

const MorePage: React.FC = () => {
    const ChevronRightIcon: React.FC = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    );
    
    const UsersIcon: React.FC = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    );

    const PhoneIcon: React.FC = () => (
         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
    );

    const menuItems = [
        { path: '/profile', label: 'Mi Perfil', icon: <UserCircleIcon className="h-6 w-6 text-gray-500" /> },
        { path: '/about', label: 'Nosotros', icon: <UsersIcon /> },
        { path: '/contact', label: 'Contacto', icon: <PhoneIcon /> },
        { path: '/information', label: 'Información', icon: <InformationCircleIcon className="h-6 w-6 text-gray-500" /> },
        { path: '/faq', label: 'Preguntas Frecuentes', icon: <QuestionMarkCircleIcon className="h-6 w-6 text-gray-500" /> },
        { path: '/legal', label: 'Aviso Legal', icon: <ShieldCheckIcon className="h-6 w-6 text-gray-500" /> },
    ];

    return (
        <div className="p-4 bg-brand-light flex-grow h-full">
            <div className="space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center space-x-4">
                            {item.icon}
                            <span className="font-medium text-brand-dark">{item.label}</span>
                        </div>
                        <ChevronRightIcon />
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default MorePage;