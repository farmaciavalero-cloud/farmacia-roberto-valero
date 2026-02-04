
import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { LocationMarkerIcon } from './Icons';

const Logo: React.FC = () => (
    <div className="flex items-center space-x-2">
        <div className="bg-brand-green w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5 10.5H15.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M14 9V12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M11 6.5C11 6.5 13.5 6.5 14.5 6.5C16.9853 6.5 18 8.01472 18 10C18 11.9853 16.9853 13.5 14.5 13.5H9.5V6.5H11Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13 13.5L18 18.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        </div>
        <div className="flex flex-col overflow-hidden text-left">
            <span className="text-brand-dark dark:text-slate-100 text-xs font-bold leading-tight truncate uppercase tracking-tighter italic">ROBERTO VALERO</span>
            <span className="text-brand-green text-[8px] font-bold tracking-widest leading-tight uppercase opacity-80">Farmacia y Laboratorio</span>
        </div>
    </div>
);

const Header: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isHomePage = location.pathname === '/';

    return (
        <header className="bg-white dark:bg-slate-900 sticky top-0 z-50 p-3 shadow-md border-b border-gray-100 dark:border-slate-800 transition-colors">
            <div className="flex items-center justify-between h-10">
                <div className="flex items-center w-10">
                    {!isHomePage && (
                        <button 
                            onClick={() => navigate(-1)} 
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-brand-dark dark:text-slate-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}
                </div>

                <div className="flex-grow flex justify-center">
                    <Link to="/" className="flex items-center">
                        <Logo />
                    </Link>
                </div>

                <div className="flex items-center justify-end w-10">
                    <Link 
                        to="/contact" 
                        className={`p-2.5 rounded-full transition-all active:scale-90 ${location.pathname === '/contact' ? 'bg-brand-green text-white' : 'bg-brand-light dark:bg-slate-800 text-brand-green hover:bg-brand-green/10'}`}
                        aria-label="Ir a ubicación y contacto"
                    >
                        <LocationMarkerIcon className="h-5 w-5" />
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
