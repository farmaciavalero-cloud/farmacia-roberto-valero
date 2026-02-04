
import React from 'react';

const InformationPage: React.FC = () => {

    const ClockIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-green mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );

    const CalendarIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-green mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    );

    const ExclamationIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-green mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    );

    return (
        <div className="p-6 bg-brand-light min-h-full">
            <div className="bg-white p-6 rounded-lg shadow-sm text-gray-700 space-y-6">
                <section>
                    <h2 className="text-xl font-bold text-brand-dark mb-4 border-b-2 border-brand-green pb-2">Información General</h2>
                    
                    <div className="flex items-start mt-4">
                        <ClockIcon />
                        <div>
                            <h3 className="font-semibold text-gray-800">Horario de Apertura</h3>
                            <ul className="list-disc list-inside mt-1 text-sm">
                                <li>Lunes a Viernes: 9:00 a 14:00 y de 17:00 a 20:00h</li>
                                <li>Sábados: 9:00 a 14:00</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="flex items-start mt-6">
                        <CalendarIcon />
                         <div>
                            <h3 className="font-semibold text-gray-800">Farmacia de Guardia</h3>
                            <p className="mt-1 text-sm">
                                Consulta el calendario de guardias actualizado en el siguiente enlace:
                            </p>
                            <a 
                                href="https://www.cofalicante.com/farmacias-de-guardia/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-brand-green font-semibold hover:underline text-sm mt-2 inline-block"
                            >
                                Ver Calendario de Guardias
                            </a>
                        </div>
                    </div>

                    <div className="flex items-start mt-6">
                        <ExclamationIcon />
                        <div>
                            <h3 className="font-semibold text-gray-800">Urgencias</h3>
                            <p className="mt-1 text-sm">
                                En caso de URGENCIA, pueden escribir al <a href="https://wa.me/34610755819" target="_blank" rel="noopener noreferrer" className="text-brand-green font-semibold hover:underline">WHATSAPP 610755819</a> o mandar un <a href="mailto:farmacia@robertovalerofarmacia.com" className="text-brand-green font-semibold hover:underline">email a farmacia@robertovalerofarmacia.com</a> y se le contestará a la mayor brevedad posible.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default InformationPage;
