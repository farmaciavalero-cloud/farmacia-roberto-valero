import React, { useState, useEffect } from 'react';

const AppointmentsPage: React.FC = () => {
    const [service, setService] = useState('');
    const [date, setDate] = useState('');
    
    // 1. TU LISTA EXACTA DE SERVICIOS (Sin tablas de Supabase)
    const servicesList = [
        "Seguimiento y Sistemas personalizados de dosificación o SPD",
        "Asesoramiento en fitoterapia",
        "Elaboramos cosmética a tu medida",
        "Análisis Bioquímicos",
        "Dermofarmacia Facial",
        "Dermofarmacia Capilar"
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Lógica para generar el calendario
    const renderCalendar = () => {
        const year = 2026;
        const month = 1; // Febrero
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];

        for (let d = 1; d <= daysInMonth; d++) {
            const currentDate = new Date(year, month, d);
            const isPast = currentDate < today;
            
            // REGLA: Gris si es pasado, Negro si está disponible
            const circleClass = isPast 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" // Gris
                : "bg-black text-white hover:bg-opacity-80 cursor-pointer"; // Negro

            days.push(
                <button
                    key={d}
                    onClick={() => !isPast && setDate(d.toString())}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${circleClass} ${date === d.toString() ? 'ring-2 ring-offset-2 ring-black' : ''}`}
                    disabled={isPast}
                >
                    {d}
                </button>
            );
        }
        return days;
    };

    return (
        <div className="p-4 space-y-6">
            <p className="text-gray-500 text-sm">Selecciona el servicio y la fecha que prefieras.</p>
            
            {/* DESPLEGABLE ARREGLADO */}
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Servicio</label>
                <select 
                    value={service} 
                    onChange={(e) => setService(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-800 rounded-lg text-white focus:ring-2 focus:ring-brand-green"
                >
                    <option value="">Selecciona un servicio</option>
                    {servicesList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* CALENDARIO CON ESTILO NEGRO/GRIS */}
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-4">Fecha Preferida</label>
                <div className="bg-white p-6 rounded-2xl shadow-xl">
                    <h3 className="text-center font-bold text-gray-800 mb-6">Febrero De 2026</h3>
                    <div className="grid grid-cols-7 gap-4 place-items-center">
                        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(l => (
                            <span key={l} className="text-[10px] font-bold text-gray-400">{l}</span>
                        ))}
                        {renderCalendar()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentsPage;
