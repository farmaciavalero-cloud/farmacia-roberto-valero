import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CameraIcon, ArrowLeftIcon } from '../components/Icons';

const MasterFormulationsPage: React.FC = () => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        patientName: '',
        patientDni: '',
        doctorName: '',
        doctorLicense: '',
        formulationName: '',
        additionalNotes: ''
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. ESCÁNER: Extrae datos y los asigna al estado local
    const handleScan = async (file: File) => {
        setIsAnalyzing(true);
        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

            const base64Data = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.readAsDataURL(file);
            });

            const prompt = `Analiza la receta médica. Devuelve solo un JSON con este formato:
            {
                "paciente": "nombre completo",
                "dni": "número",
                "medico": "nombre doctor",
                "colegiado": "número",
                "composicion": "nombre de la fórmula o ingredientes"
            }`;

            const result = await model.generateContent([
                prompt,
                { inlineData: { data: base64Data, mimeType: file.type } }
            ]);

            const response = await result.response;
            const data = JSON.parse(response.text().replace(/```json|```/g, "").trim());

            setFormData(prev => ({
                ...prev,
                patientName: data.paciente || prev.patientName,
                patientDni: data.dni || prev.patientDni,
                doctorName: data.medico || prev.doctorName,
                doctorLicense: data.colegiado || prev.doctorLicense,
                formulationName: data.composicion || prev.formulationName
            }));
        } catch (err: any) {
            alert("Error OCR: " + err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // 2. GUARDADO: Inserción según tu esquema SQL
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Inicia sesión para enviar.");

            const { error } = await supabase.from('formulas').insert([{
                user_id: user.id,
                nombre_paciente: formData.patientName,
                dni_paciente: formData.patientDni,
                nombre_medico: formData.doctorName,
                num_colegiado: formData.doctorLicense,
                composicion_ocr: formData.formulationName,
                notas_adicionales: formData.additionalNotes,
                estado: 'Pendiente'
            }]);

            if (error) throw error;
            alert("Solicitud guardada con éxito.");
        } catch (err: any) {
            alert("Error al guardar: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-10">
            {/* CABECERA AZUL (image_12a23c.png) */}
            <div className="bg-white p-4 flex items-center shadow-sm mb-4">
                <button className="p-2 text-blue-900"><ArrowLeftIcon className="h-6 w-6" /></button>
                <div className="flex-grow text-center pr-10">
                    <h1 className="text-xl font-black italic text-blue-900 uppercase">Fórmulas Magistrales</h1>
                    <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Laboratorio Personalizado</p>
                </div>
            </div>

            <div className="px-4 max-w-lg mx-auto space-y-6">
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                    Sube una foto de la receta para <strong>autocompletar los datos</strong>.
                </p>

                {/* ZONA DE CARGA (image_12a23c.png) */}
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer active:scale-95 transition-all shadow-sm"
                >
                    {isAnalyzing ? (
                        <div className="animate-spin h-8 w-8 border-4 border-brand-green border-t-transparent rounded-full mx-auto" />
                    ) : (
                        <div className="bg-gray-50 p-4 rounded-full inline-block mb-2"><CameraIcon className="h-8 w-8 text-gray-400" /></div>
                    )}
                    <p className="text-gray-700 font-bold text-sm">Sube tu Receta Médica</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">JPG, PNG o PDF</p>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleScan(e.target.files[0])} />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* TARJETA PACIENTE (image_12a23c.png) */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="text-[11px] font-black text-blue-900 uppercase border-b pb-2 tracking-widest">Datos del Paciente</h3>
                        <div className="space-y-3">
                            <input value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm" placeholder="Nombre Completo" />
                            <div className="grid grid-cols-2 gap-3">
                                <input value={formData.patientDni} onChange={e => setFormData({...formData, patientDni: e.target.value})} className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm" placeholder="DNI/NIE" />
                                <input value={formData.formulationName} onChange={e => setFormData({...formData, formulationName: e.target.value})} className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm" placeholder="Fórmula/Composición" />
                            </div>
                        </div>
                    </div>

                    {/* TARJETA MÉDICO (image_12a9fa.png) */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="text-[11px] font-black text-blue-900 uppercase border-b pb-2 tracking-widest">Datos del Médico</h3>
                        <div className="space-y-3">
                            <input value={formData.doctorName} onChange={e => setFormData({...formData, doctorName: e.target.value})} className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm" placeholder="Nombre del Médico" />
                            <input value={formData.doctorLicense} onChange={e => setFormData({...formData, doctorLicense: e.target.value})} className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm" placeholder="Número de Colegiado" />
                        </div>
                    </div>

                    {/* TARJETA NOTAS (image_12a9fa.png) */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <textarea 
                            value={formData.additionalNotes} 
                            onChange={e => setFormData({...formData, additionalNotes: e.target.value})}
                            rows={3} 
                            className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm outline-none"
                            placeholder="Notas adicionales..."
                        />
                    </div>

                    {/* BOTÓN VERDE (image_12a9fa.png) */}
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-[#4a5d55] text-white py-4 rounded-xl font-bold uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? "Enviando..." : "Enviar Solicitud al Laboratorio"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MasterFormulationsPage;
