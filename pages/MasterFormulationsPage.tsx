import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { GoogleGenerativeAI } from "@google/generative-ai";

// ICONOS SVG INTEGRADOS (Para que el build no falle buscando archivos externos)
const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
);
const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);

const MasterFormulationsPage: React.FC = () => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Estado con los nombres exactos de tu tabla SQL
    const [formData, setFormData] = useState({
        nombre_paciente: '',
        dni_paciente: '',
        nombre_medico: '',
        num_colegiado: '',
        composicion_ocr: '',
        notas_adicionales: ''
    });
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // OCR usando el alias gemini-flash-latest
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

            const prompt = `Analiza la receta médica. Devuelve solo JSON:
            {
                "p": "nombre paciente",
                "d": "dni",
                "m": "nombre medico",
                "c": "colegiado",
                "f": "formula o composicion"
            }`;

            const result = await model.generateContent([
                prompt,
                { inlineData: { data: base64Data, mimeType: file.type } }
            ]);

            const response = await result.response;
            const data = JSON.parse(response.text().replace(/```json|```/g, "").trim());

            setFormData(prev => ({
                ...prev,
                nombre_paciente: data.p || prev.nombre_paciente,
                dni_paciente: data.d || prev.dni_paciente,
                nombre_medico: data.m || prev.nombre_medico,
                num_colegiado: data.c || prev.num_colegiado,
                composicion_ocr: data.f || prev.composicion_ocr
            }));
        } catch (err: any) {
            alert("Error OCR: " + err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Debes iniciar sesión");

            // Guardado en tabla 'formulas'
            const { error } = await supabase.from('formulas').insert([{
                user_id: user.id,
                nombre_paciente: formData.nombre_paciente,
                dni_paciente: formData.dni_paciente,
                nombre_medico: formData.nombre_medico,
                num_colegiado: formData.num_colegiado,
                composicion_ocr: formData.composicion_ocr,
                notas_adicionales: formData.notas_adicionales,
                estado: 'Pendiente'
            }]);

            if (error) throw error;
            alert("¡Solicitud enviada con éxito!");
        } catch (err: any) {
            alert("Error al guardar: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-10">
            {/* Cabecera idéntica a tu imagen */}
            <div className="bg-white p-4 flex items-center shadow-sm mb-4 border-b border-gray-100">
                <button onClick={() => window.history.back()} className="p-2 text-blue-900"><ArrowLeftIcon /></button>
                <div className="flex-grow text-center pr-10">
                    <h1 className="text-xl font-black italic text-blue-900 uppercase">Fórmulas Magistrales</h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Laboratorio de formulación personalizada</p>
                </div>
            </div>

            <div className="px-4 max-w-lg mx-auto space-y-6">
                <p className="text-xs text-gray-600 leading-tight font-medium">
                    Rellena el formulario o sube una foto de la receta para <strong>autocompletar los datos</strong>.
                </p>

                {/* Zona de carga idéntica */}
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer shadow-sm active:scale-95 transition-all"
                >
                    {isAnalyzing ? (
                        <div className="flex flex-col items-center">
                            <div className="h-8 w-8 animate-spin border-4 border-blue-900 border-t-transparent rounded-full mb-2"/>
                            <p className="text-[10px] font-bold text-gray-500 uppercase">Analizando receta...</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-gray-50 p-4 rounded-full inline-block mb-2 text-gray-400"><CameraIcon /></div>
                            <p className="text-gray-700 font-bold text-sm">Sube tu Receta Médica</p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">PNG, JPG, PDF hasta 10MB</p>
                        </>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleScan(e.target.files[0])} />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Sección Paciente */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="text-[11px] font-black text-blue-900 uppercase border-b pb-2 tracking-widest">Datos del Paciente</h3>
                        <div className="space-y-3">
                            <input value={formData.nombre_paciente} onChange={e => setFormData({...formData, nombre_paciente: e.target.value})} className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-blue-900" placeholder="Nombre Completo" required />
                            <div className="grid grid-cols-2 gap-3">
                                <input value={formData.dni_paciente} onChange={e => setFormData({...formData, dni_paciente: e.target.value})} className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm outline-none" placeholder="DNI/NIE" required />
                                <input value={formData.composicion_ocr} onChange={e => setFormData({...formData, composicion_ocr: e.target.value})} className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm outline-none" placeholder="Fórmula" />
                            </div>
                        </div>
                    </div>

                    {/* Sección Médico */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="text-[11px] font-black text-blue-900 uppercase border-b pb-2 tracking-widest">Datos del Médico</h3>
                        <div className="space-y-3">
                            <input value={formData.nombre_medico} onChange={e => setFormData({...formData, nombre_medico: e.target.value})} className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm outline-none" placeholder="Nombre del Médico" />
                            <input value={formData.num_colegiado} onChange={e => setFormData({...formData, num_colegiado: e.target.value})} className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm outline-none" placeholder="Número de Colegiado" />
                        </div>
                    </div>

                    {/* Notas */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <textarea 
                            value={formData.notas_adicionales} 
                            onChange={e => setFormData({...formData, notas_adicionales: e.target.value})}
                            rows={3} 
                            className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm outline-none"
                            placeholder="Notas adicionales o teléfono..."
                        />
                    </div>

                    {/* Botón Final */}
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-[#4a5d55] text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? "Enviando..." : "Enviar Solicitud al Laboratorio"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MasterFormulationsPage;
