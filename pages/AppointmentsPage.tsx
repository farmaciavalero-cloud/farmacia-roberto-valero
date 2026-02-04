import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AppointmentsPage: React.FC = () => {
    const [service, setService] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [busySlots, setBusySlots] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const servicesList = [
        "Seguimiento y Sistemas personalizados de dosificación o SPD",
        "Asesoramiento en fitoterapia",
        "Elaboramos cosmética a tu medida",
        "Análisis Bioquímicos",
        "Dermofarmacia Facial",
        "Dermofarmacia Capilar"
    ];

    const timeSlots = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
        "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    useEffect(() => {
        const fetchCitas = async () => {
            const { data } = await supabase.from('citas').select('fecha, hora');
            if (data) setBusySlots(data);
        };
        fetchCitas();
    }, []);

    const isDayFull = (day: number) => {
        const dateStr = `2026-02-${day.toString().padStart(2, '0')}`;
        const count = busySlots.filter(s => s.fecha === dateStr).length;
        return count >= timeSlots.length;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Inicia sesión para continuar.");

            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, phone')
                .eq('id', user.id)
                .single();

            const { error: insertError } = await supabase
                .from('citas')
                .insert([{ 
                    user_id: user.id,
                    nombre: profile?.full_name || 'Usuario',
                    telefono: profile?.phone || '',
                    servicio: service,
                    fecha: `2026-02-${date.padStart(2, '0')}`,
                    hora: time
                }]);

            if (insertError) throw insertError;
            setSubmitSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderCalendar = () => {
        const days = [];
        // Febrero 2026 empieza en Domingo (6 huecos si la semana empieza en Lunes)
        for (let i = 0; i < 6; i++) {
            days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
        }

        for (let d = 1; d <= 28; d++) {
            const currentDate = new Date(2026, 1, d);
            const isPast = currentDate < today;
            const full = isDayFull(d);
            const isSelected = date === d.toString();
            
            // Lógica de colores: Gris para inaccesibles, Negro para disponibles
            const isDisabled = isPast || full;
            const circleClass = isDisabled 
                ? "bg-gray-100 text-gray-300 cursor-not-allowed" 
                : isSelected 
                    ? "bg-brand-green text-white scale-110" 
                    : "bg-black text-white hover:bg-slate-800 cursor-pointer";

            days.push(
                <button
                    key={d}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => setDate(d.toString())}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all ${circleClass}`}
                >
                    {d}
                </button>
            );
        }
        return days;
    };

    if (submitSuccess) {
        return (
            <div className="p-10 text-center">
                <div className="text-6xl mb-6">✨</div>
                <h2 className="text-2xl font-black mb-2">¡Cita Guardada!</h2>
                <p className="text-gray-500 mb-8">Roberto la recibirá en su calendario automáticamente.</p>
                <button onClick={() => window.location.reload()} className="w-full py-4 bg-black text-white rounded-2xl font-bold">Volver</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-8 pb-24 max-w-sm mx-auto">
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase text-center border border-red-100">{error}</div>}

            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Servicio</label>
                <select required value={service} onChange={(e) => setService(e.target.value)}
                    className="w-full p-5 bg-slate-950 rounded-[1.5rem] text-white border-none focus:ring-2 focus:ring-brand-green appearance-none shadow-xl">
                    <option value="">¿Qué necesitas?</option>
                    {servicesList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center block">Febrero 2026</label>
                <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-gray-50">
                    <div className="grid grid-cols-7 gap-4 place-items-center mb-6">
                        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(l => <span key={l} className="text-[10px] font-black text-gray-300 uppercase">{l}</span>)}
                        {renderCalendar()}
                    </div>
                </div>
            </div>

            {date && (
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center block">Hora</label>
                    <div className="grid grid-cols-4 gap-2">
                        {timeSlots.map(t => {
                            const dateStr = `2026-02-${date.padStart(2, '0')}`;
                            const isBusy = busySlots.some(s => s.fecha === dateStr && s.hora === t);
                            return (
                                <button key={t} type="button" disabled={isBusy} onClick={() => setTime(t)}
                                    className={`py-4 text-[10px] font-black rounded-xl border transition-all ${isBusy ? 'bg-gray-50 text-gray-200 border-transparent' : time === t ? 'bg-black text-white border-black shadow-lg scale-95' : 'bg-white text-gray-800 border-gray-100'}`}>
                                    {isBusy ? 'Ocupado' : t}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <button type="submit" disabled={isSubmitting || !date || !time || !service}
                className="w-full py-6 bg-brand-green text-white rounded-[2rem] font-black text-lg shadow-xl disabled:bg-gray-200 transition-all uppercase tracking-widest">
                {isSubmitting ? 'Confirmando...' : 'Confirmar Cita'}
            </button>
        </form>
    );
};

export default AppointmentsPage;
