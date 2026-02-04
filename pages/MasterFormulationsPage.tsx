
import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { BeakerIcon, ChevronDownIcon } from '../components/Icons';
import { supabase } from '../lib/supabase';

// Helper to convert file to base64 for the API
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
            const base64Data = result.split(',')[1];
            resolve(base64Data);
        };
        reader.onerror = (error) => reject(error);
    });
};

type CompositionItem = {
    ingredient: string;
    amount: string;
};

const MasterFormulationsPage: React.FC = () => {
    // Patient Data
    const [patientName, setPatientName] = useState('');
    const [patientDni, setPatientDni] = useState('');
    const [phone, setPhone] = useState('');

    // Doctor Data
    const [doctorName, setDoctorName] = useState('');
    const [doctorCollegiateNumber, setDoctorCollegiateNumber] = useState('');

    const [notes, setNotes] = useState('');
    const [fileName, setFileName] = useState('');
    
    // AI Analysis States
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [composition, setComposition] = useState<CompositionItem[]>([]);
    const [showComposition, setShowComposition] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            setFileName(file.name);
            
            // Start AI Analysis
            await analyzePrescription(file);
        }
    };

    const analyzePrescription = async (file: File) => {
        try {
            setIsAnalyzing(true);
            setComposition([]); // Reset previous composition
            setIsSaved(false);
            
            // 1. Convert image to Base64
            const base64Data = await fileToBase64(file);

            // 2. Initialize Gemini
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            // 3. Define the Schema for structured output
            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    patientName: { type: Type.STRING, description: "Full name of the patient found in the prescription." },
                    patientDni: { type: Type.STRING, description: "Patient's DNI, NIF, or ID number." },
                    phoneNumber: { type: Type.STRING, description: "Patient contact phone number if present." },
                    doctorName: { type: Type.STRING, description: "Name of the prescribing doctor." },
                    doctorCollegiateNumber: { type: Type.STRING, description: "Doctor's collegiate license number (Número de colegiado)." },
                    composition: {
                        type: Type.ARRAY,
                        description: "List of ingredients and amounts for the master formulation.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                ingredient: { type: Type.STRING },
                                amount: { type: Type.STRING }
                            }
                        }
                    }
                }
            };

            // 4. Call the model
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: {
                    parts: [
                        {
                            inlineData: {
                                mimeType: file.type,
                                data: base64Data
                            }
                        },
                        {
                            text: "Analiza esta receta médica con máximo detalle. Extrae: Nombre del paciente, DNI/NIF del paciente, teléfono de contacto. Datos del médico: Nombre completo y Número de Colegiado. Finalmente, extrae la composición detallada de la fórmula magistral."
                        }
                    ]
                },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema
                }
            });

            // 5. Process the response
            if (response.text) {
                const data = JSON.parse(response.text);
                
                if (data.patientName) setPatientName(data.patientName);
                if (data.patientDni) setPatientDni(data.patientDni);
                if (data.phoneNumber) setPhone(data.phoneNumber);
                
                if (data.doctorName) setDoctorName(data.doctorName);
                if (data.doctorCollegiateNumber) setDoctorCollegiateNumber(data.doctorCollegiateNumber);
                
                if (data.composition && Array.isArray(data.composition) && data.composition.length > 0) {
                    setComposition(data.composition);
                    setShowComposition(true); // Auto-open the accordion if data is found
                }
            }

        } catch (error) {
            console.error("Error analyzing image:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSaveComposition = async () => {
        try {
            const { error } = await supabase
                .from('formulations')
                .insert([{
                    patient_name: patientName,
                    patient_dni: patientDni,
                    doctor_name: doctorName,
                    composition: composition
                }]);

            if (error) throw error;
            
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        } catch (error) {
            console.error("Error saving to Supabase", error);
        }
    };
    
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);
        
        // Final save to DB for record keeping
        await handleSaveComposition();
        
        // Construct email data
        const compositionText = composition.map(c => `- ${c.ingredient}: ${c.amount}`).join('\n');
        
        const subject = `Nueva Fórmula Magistral - ${patientName}`;
        const body = `Solicitud de Fórmula Magistral:

DATOS DEL PACIENTE:
Nombre: ${patientName}
DNI/NIE: ${patientDni}
Teléfono: ${phone}

DATOS DEL MÉDICO:
Doctor: ${doctorName}
Nº Colegiado: ${doctorCollegiateNumber}

COMPOSICIÓN DETECTADA:
${compositionText || 'No se ha detectado composición automáticamente.'}

NOTAS ADICIONALES:
${notes}

----------------------------------------------------
IMPORTANTE: Por favor, adjunte la imagen de la receta a este correo antes de enviar.
----------------------------------------------------`;

        const mailtoLink = `mailto:laboratorio@robertovalerofarmacia.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitSuccess(true);
            window.location.href = mailtoLink;
        }, 1000);
    };

    if (submitSuccess) {
        return (
            <div className="p-6 text-center">
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg" role="alert">
                    <p className="font-bold">Solicitud Generada</p>
                    <p>Se ha abierto tu aplicación de correo. Por favor, <strong>recuerda adjuntar la foto de la receta</strong> y enviar el correo para completar el pedido.</p>
                </div>
                <button 
                    onClick={() => setSubmitSuccess(false)}
                    className="mt-6 text-brand-green font-medium underline"
                >
                    Volver al formulario
                </button>
            </div>
        );
    }

    return (
        <div className="p-4">
            <p className="text-gray-600 mb-6 text-sm">
                Rellena el siguiente formulario para solicitar tu fórmula magistral. Sube una foto de la receta para <strong>autocompletar los datos automáticamente</strong>.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
                 <div>
                    <label className="block text-sm font-medium text-brand-dark mb-1">1. Sube tu Receta Médica</label>
                    <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${isAnalyzing ? 'border-brand-green bg-green-50' : 'border-gray-300'}`}>
                        <div className="space-y-1 text-center">
                            {isAnalyzing ? (
                                <div className="flex flex-col items-center justify-center py-2">
                                    <svg className="animate-spin h-8 w-8 text-brand-green mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <p className="text-sm font-medium text-brand-green">Analizando receta con IA...</p>
                                    <p className="text-xs text-gray-500">Extrayendo datos clínicos y personales</p>
                                </div>
                            ) : (
                                <>
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <div className="flex text-sm text-gray-600 justify-center">
                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="relative cursor-pointer bg-white rounded-md font-medium text-brand-green hover:text-brand-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-green">
                                            <span>Sube una foto</span>
                                            <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,.pdf"/>
                                        </button>
                                        <p className="pl-1">o arrástrala</p>
                                    </div>
                                    <p className="text-xs text-gray-500">{fileName || 'PNG, JPG, PDF hasta 10MB'}</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Detected Composition Dropdown */}
                {composition.length > 0 && (
                    <div className="bg-white border border-brand-green border-opacity-30 rounded-lg shadow-sm overflow-hidden">
                        <button 
                            type="button"
                            onClick={() => setShowComposition(!showComposition)}
                            className="w-full flex justify-between items-center px-4 py-3 bg-brand-green bg-opacity-5 hover:bg-opacity-10 transition-colors"
                        >
                            <div className="flex items-center space-x-2">
                                <BeakerIcon className="h-5 w-5 text-brand-green" />
                                <span className="font-semibold text-brand-dark text-sm">Composición Detectada ({composition.length})</span>
                            </div>
                            <ChevronDownIcon className={`h-4 w-4 text-brand-green transform transition-transform ${showComposition ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {showComposition && (
                            <div className="p-0">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingrediente</th>
                                            <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {composition.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{item.ingredient}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{item.amount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="px-4 py-2 bg-yellow-50 text-xs text-yellow-700 italic border-t border-yellow-100">
                                    * Por favor, verifica que los datos detectados coincidan con tu receta original.
                                </div>
                                <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={handleSaveComposition}
                                        disabled={isSaved}
                                        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green transition-colors ${
                                            isSaved ? 'bg-green-600 hover:bg-green-700' : 'bg-brand-green hover:bg-opacity-90'
                                        }`}
                                    >
                                        {isSaved ? (
                                             <>
                                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                Guardado
                                             </>
                                        ) : (
                                             <>
                                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                                                Guardar en Historial
                                             </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-brand-dark mb-3 uppercase tracking-wide border-b border-gray-100 pb-2">Datos del Paciente</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="patientName" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                            <input type="text" id="patientName" value={patientName} onChange={e => setPatientName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-brand-green focus:border-brand-green"/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="patientDni" className="block text-sm font-medium text-gray-700">DNI/NIE</label>
                                <input type="text" id="patientDni" value={patientDni} onChange={e => setPatientDni(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-brand-green focus:border-brand-green"/>
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
                                <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-brand-green focus:border-brand-green"/>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-brand-dark mb-3 uppercase tracking-wide border-b border-gray-100 pb-2">Datos del Médico Prescriptor</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="doctorName" className="block text-sm font-medium text-gray-700">Nombre del Médico</label>
                            <input type="text" id="doctorName" value={doctorName} onChange={e => setDoctorName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-brand-green focus:border-brand-green"/>
                        </div>
                        <div>
                            <label htmlFor="doctorCollegiateNumber" className="block text-sm font-medium text-gray-700">Número de Colegiado</label>
                            <input type="text" id="doctorCollegiateNumber" value={doctorCollegiateNumber} onChange={e => setDoctorCollegiateNumber(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-brand-green focus:border-brand-green"/>
                        </div>
                    </div>
                </div>
               
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notas Adicionales</label>
                    <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-brand-green focus:border-brand-green"></textarea>
                </div>
                <div>
                    <button type="submit" disabled={isSubmitting || isAnalyzing} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-green hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green disabled:bg-gray-400">
                        {isSubmitting ? 'Preparando correo...' : 'Enviar Solicitud al Laboratorio'}
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                        Se abrirá tu cliente de correo para enviar la solicitud.
                    </p>
                </div>
            </form>
        </div>
    );
};

export default MasterFormulationsPage;
