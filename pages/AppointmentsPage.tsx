import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AppointmentsPage: React.FC = () => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [displayDate, setDisplayDate] = useState(new Date());
    const [availability, setAvailability] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. Lógica del Calendario: Gris si está lleno (16 citas), Negro si está libre
    useEffect(() => {
        const checkAvailability = async () => {
            const { data } = await supabase.from('citas').select('fecha');
            const counts: Record<string, number> = {};
            
            // Contamos cuántas citas hay por día
            data?.forEach(app => {
                counts[app.fecha] = (counts[app.fecha] || 0) + 1;
            });
            
            const fullDays: Record<string, boolean> = {};
            Object.keys(counts).forEach(d => {
                // Si el día llega a 16 citas (tramos de 30 min), se marca como lleno
                if (counts[d] >= 16) fullDays[d] = true;
            });
            setAvailability(fullDays);
        };
        checkAvailability();
    }, [displayDate]);

    // Intervalos de 30 minutos (Total 16 huecos al día)
    const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"];

    // 2. La función mágica: Saca los datos de 'profiles' y los guarda en 'citas'
    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            // A. Miramos quién es el usuario que está usando la App
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                alert("Por favor, inicia sesión para poder reservar.");
                setIsSubmitting(false);
                return;
            }

            // B. Vamos a la tabla 'profiles' a por su nombre y teléfono usando su ID
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, phone')
                .eq('id', user.id)
                .single();

            // C. Guardamos la cita en la tabla 'citas' con toda la info para Roberto
            const { error } = await supabase.from('citas').insert([
                { 
                    user_id: user.id,
                    servicio: 'Consulta General', 
                    fecha: date, 
                    hora: time, 
                    nombre_paciente: profile?.full_name || 'Usuario registrado',
                    telefono_paciente: profile?.phone || 'Sin teléfono',
                    estado: 'Confirmada' 
                }
            ]);

            if (error) throw error;

            alert("¡Cita reservada! Nos vemos en la Avenida Reina Victoria 13.");
            setDate('');
            setTime('');
            
        } catch (error: any) {
            alert("Error al guardar la cita: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 bg-white min-h-screen pb-12">
            <h2 className="text-xl font-bold mb-6 text-center text-brand-dark">Reserva tu Cita</h2>
            
            <div className="mb-8 bg-gray-50 p-5 rounded-3xl border border-gray-100 shadow-sm text-center">
                {/* Selector de Mes */}
                <div className="flex justify-between items-center mb-6 font-bold">
                    <button type="button" onClick={() => setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() - 1))} className="text-brand-green p-2">&lt;</button>
                    <span className="capitalize text-lg">{displayDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
                    <button type="button" onClick={() => setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + 1))} className="text-brand-green p-2">&gt;</button>
                </div>

                {/* El Calendario */}
                <div className="grid grid-cols-7 gap-3">
                    {Array.from({ length: 31 }, (_, i) => {
                        const day = i + 1;
                        const month = (displayDate.getMonth() + 1).toString().padStart(2, '0');
                        const dateStr = `${displayDate.getFullYear()}-${month}-${day.toString().padStart(2, '0')}`;
                        const isFull = availability[dateStr];

                        return (
                            <button 
                                key={day}
                                type="button"
                                onClick={() => !isFull && setDate(dateStr)}
                                className={`h-10 w-10 rounded-full text-xs font-bold transition-all
                                    ${isFull ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-black text-white hover:scale-110 active:scale-90'}
                                    ${date === dateStr ? 'ring-4 ring-brand-green border-2 border-white shadow-lg' : ''}`}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Selector de Horas */}
            {date && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="font-bold text-sm text-gray-500 uppercase px-1 tracking-wider">Horarios de 30 min</h3>
                    <div className="grid grid-cols-4 gap-2">
                        {timeSlots.map(t => (
                            <button 
                                key={t} 
                                type="button"
                                onClick={() => setTime(t)} 
                                className={`p-2 text-[11px] font-bold border rounded-xl transition-all ${time === t ? 'bg-brand-green text-white border-brand-green shadow-md' : 'bg-white text-gray-600 border-gray-100'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={handleBooking} 
                        disabled={!time || isSubmitting} 
                        className="w-full bg-brand-green text-white p-4 rounded-2xl font-bold shadow-xl disabled:bg-gray-300 transition-transform active:scale-95"
                    >
                        {isSubmitting ? 'Confirmando...' : 'Confirmar Cita'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default AppointmentsPage;