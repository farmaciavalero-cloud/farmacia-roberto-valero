
import React from 'react';
import { Link } from 'react-router-dom';

interface ServiceCardProps {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    to: string;
    fullWidth?: boolean;
    titleClassName?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, description, icon: Icon, to, fullWidth = false, titleClassName = 'text-brand-dark' }) => {
    const isExternal = to.startsWith('http');
    
    const CardContent = (
         <div className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 h-full border border-transparent dark:border-slate-700 ${
            fullWidth 
                ? 'flex items-center text-left space-x-4' 
                : 'flex flex-col items-center text-center'
        }`}>
            <div className={`bg-brand-green text-white rounded-full p-3 flex-shrink-0 ${!fullWidth && 'mb-3'}`}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <h3 className={`font-bold text-md ${titleClassName} dark:text-slate-100`}>{title}</h3>
                <p className={`text-gray-500 dark:text-slate-400 text-xs mt-1 ${!fullWidth && 'flex-grow'}`}>{description}</p>
            </div>
        </div>
    );
    
    if (isExternal) {
        return (
            <a href={to} target="_blank" rel="noopener noreferrer" className="block h-full">
                {CardContent}
            </a>
        );
    }

    return (
        <Link to={to} className="block h-full">
            {CardContent}
        </Link>
    );
};

export default ServiceCard;
