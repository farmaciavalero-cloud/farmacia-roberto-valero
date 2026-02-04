import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AppointmentsPage: React.FC = () => {
    const [service, setService] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [busySlots, setBusySlots] = useState<{fecha: string, hora: string}[]>([]);
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

    // Cargar citas para saber qué está ocupado
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

            // 1. Sacamos tus datos de la tabla profiles
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, phone')
                .eq('id', user.id)
                .single();

            // 2. Guardamos la cita en Supabase
            const { error: insertError } = await supabase
                .from('citas')
                .insert([{ 
                    user_id: user.id,
                    nombre: profile?.full_name || 'Usuario App',
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
        // Febrero 2026 empieza en Domingo (necesitamos 6 huecos si empezamos por Lunes)
        for (let i = 0; i < 6; i++) {
            days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
        }

        for (let d = 1; d <= 28; d++) {
            const currentDate = new Date(2026, 1, d);
            const isPast = currentDate < today;
            const full = isDayFull(d);
            const isSelected = date === d.toString();
            
            // GRIS si es pasado o está lleno, NEGRO si hay huecos
            const isDisabled = isPast || full;
            const circleClass = isDisabled 
                ? "bg-gray-100 text-gray-300 cursor-not-allowed" 
                : isSelected 
                    ? "bg-brand-green text-white scale-110 shadow-lg" 
                    : "bg-black text-white hover:bg-gray-800 cursor-pointer";

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
            <div className="p-10 text-center animate-in fade-in zoom-in duration-300">
                <div className="text-6xl mb-6">✨</div>
                <h2 className="text-2xl font-black mb-2">¡Cita enviada!</h2>
                <p className="text-gray-500 mb-8 text-sm">Roberto la verá en su calendario en breve.</p>
                <button onClick={() => window.location.reload()} className="w-full py-4 bg-black text-white rounded-2xl font-bold">Volver</button>
            </div>
        );
    }
