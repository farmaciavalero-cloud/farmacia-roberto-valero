import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { GoogleGenerativeAI } from "@google/generative-ai";
// Importamos iconos estándar para evitar fallos de compilación si faltan en tu carpeta
import { Camera, ArrowLeft, Loader2 } from 'lucide-react';

const MasterFormulationsPage: React.FC = () => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Estado ajustado a tu esquema SQL
    const [formData, setFormData] = useState({
        nombre_paciente: '',
        dni_paciente: '',
        nombre_medico: '',
        num_colegiado: '',
        composicion_ocr: '',
        notas_adicionales: ''
    });
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleScan = async (file: File) => {
        setIsAnalyzing(true);
        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            const genAI = new GoogleGenerativeAI(apiKey);
            // Usamos el alias estable para evitar el error 404
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
                "formula": "composición o nombre de la fórmula"
            }`;

            const result = await model.generateContent([
                prompt,
                { inlineData: { data: base64Data, mimeType: file.type } }
            ]);

            const response = await result.response;
            const data = JSON.parse(response.text().replace(/```json|```/g, "").trim());

            // Mapeo automático al estado del formulario
            setFormData(prev => ({
                ...prev,
                nombre_paciente: data.paciente || prev.nombre_paciente,
                dni_paciente: data.dni || prev.dni_paciente,
                nombre_medico: data.medico || prev.nombre_medico,
                num_colegiado: data.colegiado || prev.num_colegiado,
                composicion_ocr: data.formula || prev.composicion_ocr
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
            if (!user) throw new Error("Debes iniciar sesión para enviar la solicitud.");

            // Inserción exacta según tus nombres de columna
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
            // Limpiar formulario tras éxito
            setFormData({ nombre_paciente: '', dni_paciente: '', nombre_medico: '', num_colegiado: '', composicion_ocr: '', notas_adicionales: '' });
        } catch (err: any) {
            alert("Error al guardar: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-10 font-sans">
            {/* CABECERA (image_12a23c.png) */}
            <div className="bg-white p-4 flex items-center shadow-sm mb-4 border-b border-gray-100">
                <button className="p-2 text-blue-900"><ArrowLeft className="h-6 w-6" /></button>
                <div className="flex-grow text-center pr-10">
                    <h1 className="text-xl font-black italic text-blue-900 uppercase tracking-tight">Fórmulas Magistrales</h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Laboratorio de formulación personalizada</p>
                </div>
            </div>

            <div className="px-4 max-w-lg mx-auto space-y-6">
                <p className="text-xs text-gray-600 leading-tight font-medium">
                    Rellena el formulario o sube una foto de la receta para <strong>autocompletar los datos</strong>.
                </p>

                {/* ZONA DE CARGA (image_12a23c.png) */}
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer active:scale-95 transition-all shadow-sm"
                >
                    {isAnalyzing ? (
                        <div className="flex flex-col items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-brand-green mb-2" />
                            <p className="text-xs font-bold text-gray-500 uppercase">Analizando receta...</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-gray-50 p-4 rounded-full inline-block mb-2"><Camera className="h-8 w-8 text-gray-400" /></div>
                            <p className="text-gray-700 font-bold text-sm">Sube tu Receta Médica</p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">PNG, JPG, PDF hasta 10MB</p>
                        </>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleScan(e.target.files[0])} />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* DATOS PACIENTE (image_12a23c.png) */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="text-[11px] font-black text-blue-900 uppercase border-b pb-2 tracking-widest">Datos del Paciente</h3>
                        <div className="space-y-3">
                            <input value={formData.nombre_paciente} onChange={e => setFormData({...formData, nombre_paciente: e.target.value})} className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Nombre Completo" required />
                            <div className="grid grid-cols-2 gap-3">
                                <input value={formData.dni_paciente} onChange={e => setFormData({...formData, dni_paciente: e.target.value})} className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm" placeholder="DNI/NIE" required />
                                <input value={formData.composicion_ocr} onChange={e => setFormData({...formData, composicion_ocr: e.target.value})} className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm" placeholder="Fórmula" />
                            </div>
                        </div>
                    </div>

                    {/* DATOS MÉDICO (image_12a9fa.png) */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="text-[11px] font-black text-blue-900 uppercase border-b pb-2 tracking-widest">Datos del Médico</h3>
                        <div className="space-y-3">
                            <input value={formData.nombre_medico} onChange={e => setFormData({...formData, nombre_medico: e.target.value})} className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm" placeholder="Nombre del Médico" />
                            <input value={formData.num_colegiado} onChange={e => setFormData({...formData, num_colegiado: e.target.value})} className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm" placeholder="Número de Colegiado" />
                        </div>
                    </div>

                    {/* NOTAS (image_12a9fa.png) */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <textarea 
                            value={formData.notas_adicionales} 
                            onChange={e => setFormData({...formData, notas_adicionales: e.target.value})}
                            rows={3} 
                            className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                            placeholder="Notas adicionales o teléfono..."
                        />
                    </div>

                    {/* BOTÓN (image_12a9fa.png) */}
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-[#4a5d55] text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all disabled:opacity-50 flex justify-center items-center"
                    >
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Enviar Solicitud al Laboratorio"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MasterFormulationsPage;
