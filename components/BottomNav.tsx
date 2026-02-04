
import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, PackageIcon, CalendarIcon, UserCircleIcon } from './Icons';

const BottomNav: React.FC = () => {
    const navItems = [
        { path: '/', label: 'Inicio', icon: HomeIcon },
        { path: '/orders', label: 'Mis pedidos', icon: PackageIcon },
        { path: '/appointments', label: 'Citas', icon: CalendarIcon },
        { path: '/more', label: 'Perfil', icon: UserCircleIcon },
    ];

    const activeLinkClass = 'text-brand-green';
    const inactiveLinkClass = 'text-gray-400 dark:text-slate-500 hover:text-brand-dark dark:hover:text-slate-300';

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 shadow-[0_-1px_10px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)] transition-colors">
            <div className="grid grid-cols-4 h-16">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/'}
                        className={({ isActive }) => 
                           `flex flex-col items-center justify-center w-full h-full transition-all duration-200 group ${isActive ? activeLinkClass : inactiveLinkClass}`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className={`p-1 rounded-full transition-transform duration-200 ${isActive ? '-translate-y-1' : 'group-hover:-translate-y-0.5'}`}>
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <span className={`text-xs font-medium leading-none mb-1 transition-opacity duration-200 ${isActive ? 'opacity-100 font-bold' : 'opacity-80'}`}>
                                    {item.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default BottomNav;
