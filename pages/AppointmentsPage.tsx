import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Asegúrate de que esta ruta es correcta en tu GitHub

const AppointmentsPage: React.FC = () => {
    const [service, setService] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // 1. TU LISTA EXACTA DE SERVICIOS
    const servicesList = [
        "Seguimiento y Sistemas personalizados de dosificación o SPD",
        "Asesoramiento en fitoterapia",
        "Elaboramos cosmética a tu medida",
        "Análisis Bioquímicos",
        "Dermofarmacia Facial",
        "Dermofarmacia Capilar"
    ];

    // Horas disponibles (ejemplo de 9:00 a 14:00 y 16:00 a 20:00 cada 30 min)
    const timeSlots = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
        "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Aquí iría la lógica para guardar en Supabase/Google Calendar
        // Por ahora simulamos el éxito
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitSuccess(true);
        }, 1500);
    };

    const renderCalendar = () => {
        const year = 2026;
        const month = 1; // Febrero
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];

        for (let d = 1; d <= daysInMonth; d++) {
            const currentDate = new Date(year, month, d);
            const isPast = currentDate < today;
            const isSelected = date === d.toString();
            
            // REGLA: Gris si es pasado, Negro si está disponible
            const circleClass = isPast 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : isSelected 
                    ? "bg-brand-green text-white ring-2 ring-offset-2 ring-brand-green" 
                    : "bg-black text-white hover:bg-opacity-80 cursor-pointer";

            days.push(
                <button
                    key={d}
                    type="button"
                    onClick={() => !isPast && setDate(d.toString())}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${circleClass}`}
                    disabled={isPast}
                >
                    {d}
                </button>
            );
        }
        return days;
    };

    if (submitSuccess) {
        return (
            <div className="p-8 text-center space-y-4">
                <div className="text-5xl">✅</div>
                <h2 className="text-2xl font-bold">¡Cita Solicitada!</h2>
                <p className="text-gray-600">Roberto recibirá tu solicitud y se pondrá en contacto contigo pronto.</p>
                <button onClick={() => setSubmitSuccess(false)} className="text-brand-green font-bold">Pedir otra cita</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-8 pb-20">
            {/* SERVICIOS */}
            <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Servicio</label>
                <select 
                    required
                    value={service} 
                    onChange={(e) => setService(e.target.value)}
                    className="w-full p-4 bg-slate-900 border border-slate-800 rounded-xl text-white appearance-none"
                >
                    <option value="">Selecciona un servicio</option>
                    {servicesList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* CALENDARIO */}
            <div className="space-y-4">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Febrero De 2026</label>
                <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-50">
                    <div className="grid grid-cols-7 gap-4 place-items-center mb-4">
                        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(l => (
                            <span key={l} className="text-[10px] font-black text-gray-300 uppercase">{l}</span>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-4 place-items-center">
                        {renderCalendar()}
                    </div>
                </div>
            </div>

            {/* HORAS - Solo aparece si hay fecha seleccionada */}
            {date && (
                <div className="space-y-4 animate-fade-in">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Hora Disponible</label>
                    <div className="grid grid-cols-4 gap-2">
                        {timeSlots.map(t => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setTime(t)}
                                className={`py-2 text-sm font-bold rounded-lg border ${time === t ? 'bg-black text-white border-black' : 'bg-white text-gray-800 border-gray-200'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* DATOS PERSONALES */}
            <div className="space-y-4 pt-4">
                <input 
                    type="text" 
                    placeholder="Tu nombre completo"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white transition-all"
                />
                <input 
                    type="tel" 
                    placeholder="Teléfono de contacto"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white transition-all"
                />
            </div>

            {/* BOTÓN FINAL */}
            <button
                type="submit"
                disabled={isSubmitting || !date || !time || !service}
                className="w-full py-5 bg-black text-white rounded-2xl font-bold text-lg shadow-2xl active:scale-95 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
                {isSubmitting ? 'Procesando...' : 'Confirmar Cita'}
            </button>
        </form>
    );
};

export default AppointmentsPage;
