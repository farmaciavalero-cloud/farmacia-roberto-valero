
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CalendarIcon } from '../components/Icons';

const AppointmentsPage: React.FC = () => {
    const location = useLocation();
    const [service, setService] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    
    // State for calendar UI
    const [displayDate, setDisplayDate] = useState(new Date());

    useEffect(() => {
        if (location.state && location.state.service) {
            setService(location.state.service);
        }
    }, [location]);

    const getCalendarData = () => {
        if (!date || !time) return null;

        const startDateTime = new Date(`${date}T${time}`);
        // Assume 30 min duration
        const endDateTime = new Date(startDateTime.getTime() + 30 * 60000);

        const formatDateISO = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');

        const title = `Cita Farmacia: ${service || 'Consulta'}`;
        const description = `Cita solicitada por ${name} (${phone}) para ${service} en Farmacia Roberto Valero.`;
        const locationText = "Farmacia Roberto Valero, Avenida Reina Victoria 13, Elda";

        // Google Calendar URL
        const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(locationText)}&dates=${formatDateISO(startDateTime)}/${formatDateISO(endDateTime)}`;

        // ICS File Generation
        const downloadIcs = () => {
            const icsContent = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'BEGIN:VEVENT',
                `DTSTART:${formatDateISO(startDateTime)}`,
                `DTEND:${formatDateISO(endDateTime)}`,
                `SUMMARY:${title}`,
                `DESCRIPTION:${description}`,
                `LOCATION:${locationText}`,
                'END:VEVENT',
                'END:VCALENDAR'
            ].join('\n');

            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.setAttribute('download', 'cita_farmacia.ics');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        return { googleUrl, downloadIcs };
    };

    const sendEmailNotification = () => {
        const subject = `Nueva Cita Web: ${service} - ${name}`;
        const body = `Hola, quisiera solicitar la siguiente cita:
        
Servicio: ${service}
Fecha: ${date}
Hora: ${time}
Nombre: ${name}
Teléfono: ${phone}

Por favor, confirmar disponibilidad.`;

        window.location.href = `mailto:farmaciavalero@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);
        
        // Simulate API call and then trigger actions
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitSuccess(true);
            
            // Optional: Automatically trigger email client
            // sendEmailNotification(); 
        }, 1500);
    };

    if (submitSuccess) {
        const calendarData = getCalendarData();

        return (
            <div className="p-6 text-center">
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6" role="alert">
                    <p className="font-bold">Solicitud Procesada</p>
                    <p className="mb-2">Para finalizar, por favor notifícanos por correo y agenda tu cita.</p>
                </div>

                <div className="space-y-4">
                    {/* Botón 1: Enviar correo a la farmacia */}
                    <button 
                        onClick={sendEmailNotification}
                        className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-green hover:bg-opacity-90 focus:outline-none"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        1. Enviar Solicitud por Correo
                    </button>

                    {/* Botón 2: Google Calendar */}
                    {calendarData && (
                        <a 
                            href={calendarData.googleUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                        >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                            </svg>
                            2. Agendar en Google Calendar
                        </a>
                    )}
                    
                    {/* Botón 3: ICS */}
                    {calendarData && (
                        <button 
                            onClick={calendarData.downloadIcs}
                            className="flex items-center justify-center w-full py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                            <CalendarIcon className="w-5 h-5 mr-2 text-gray-500" />
                            Guardar en Agenda (.ics)
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Calendar logic
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to the start of the day

    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const monthName = displayDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Adjust for Monday start: Sunday (0) becomes 6, Monday (1) becomes 0, etc.
    const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const calendarDays = [];
    for (let i = 0; i < startingDay; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const dateString = currentDate.toISOString().split('T')[0];
        
        const isSelected = date === dateString;
        const isToday = currentDate.getTime() === today.getTime();
        const isPast = currentDate < today;
        
        let dayClasses = "w-10 h-10 flex items-center justify-center rounded-full text-sm transition-colors";
        if (isPast) {
            dayClasses += " text-gray-400 cursor-not-allowed";
        } else {
            dayClasses += " cursor-pointer";
            if (isSelected) {
                dayClasses += " bg-brand-green text-white font-bold";
            } else if (isToday) {
                dayClasses += " bg-brand-green bg-opacity-10 text-brand-green";
            } else {
                dayClasses += " hover:bg-gray-200";
            }
        }
        
        calendarDays.push(
            <button
                type="button"
                key={day}
                className={dayClasses}
                onClick={() => !isPast && setDate(dateString)}
                disabled={isPast}
            >
                {day}
            </button>
        );
    }

    const prevMonth = () => {
        setDisplayDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setDisplayDate(new Date(year, month + 1, 1));
    };

    const weekdays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];


    return (
        <div className="p-4">
             <p className="text-gray-600 mb-6 text-sm">
                Selecciona el servicio y la fecha que prefieras.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="service" className="block text-sm font-medium text-gray-700">Servicio</label>
                    <select id="service" value={service} onChange={e => setService(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-green focus:border-brand-green sm:text-sm rounded-md text-gray-900">
                        <option value="" disabled>Selecciona un servicio</option>
                        <option value="spd">Seguimiento y Sistemas personalizados de dosificación o SPD</option>
                        <option value="fitoterapia">Asesoramiento en fitoterapia</option>
                        <option value="cosmetica">Elaboramos cosmética a tu medida</option>
                        <option value="analisis">Análisis Bioquímicos</option>
                        <option value="dermofarmacia-facial">Dermofarmacia Facial</option>
                        <option value="dermofarmacia-capilar">Dermofarmacia Capilar</option>
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha Preferida</label>
                    <div className="mt-2 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <button type="button" onClick={prevMonth} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <p className="font-semibold text-brand-dark capitalize text-center">{monthName}</p>
                            <button type="button" onClick={nextMonth} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 font-medium mb-2">
                            {weekdays.map(day => <div key={day}>{day}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1 place-items-center">
                            {calendarDays}
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700">Hora Preferida</label>
                    <input type="time" id="time" value={time} onChange={e => setTime(e.target.value)} required step="900" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-brand-green focus:border-brand-green"/>
                </div>
              
                 <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tu Nombre</label>
                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-brand-green focus:border-brand-green"/>
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono de Contacto</label>
                    <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-brand-green focus:border-brand-green"/>
                </div>
                <div className="text-center text-xs text-gray-500 pt-2">
                    <p>Esta solicitud se enviará a la farmacia para su confirmación.</p>
                </div>
                <div>
                    <button type="submit" disabled={isSubmitting || !date} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-green hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green disabled:bg-gray-400">
                        {isSubmitting ? 'Procesando...' : 'Crear Cita'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AppointmentsPage;
