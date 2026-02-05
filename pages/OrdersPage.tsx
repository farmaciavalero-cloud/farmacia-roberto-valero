import React, { useState, useEffect, useRef } from 'react';
import { CameraIcon, XMarkIcon, PackageIcon, PlusIcon, PencilIcon } from '../components/Icons';
import { supabase } from '../lib/supabase';
import { GoogleGenerativeAI } from "@google/generative-ai";

type ProductItem = {
    id: string;
    name: string;
    dosage: string;
};

const OrdersPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [inputText, setInputText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ESCÁNER: Con alerta de error específico
    const handleScan = async (file: File) => {
        setIsAnalyzing(true);
        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
            if (!apiKey) throw new Error("API Key (VITE_GEMINI_API_KEY) no encontrada en el panel");

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const base64Data = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.readAsDataURL(file);
            });

            const result = await model.generateContent([
                "Extrae los medicamentos. Devuelve SOLO JSON: [{\"nombre\": \"Producto\", \"dosis\": \"Dosis\"}]",
                { inlineData: { data: base64Data, mimeType: file.type } }
            ]);

            const response = await result.response;
            const extracted = JSON.parse(response.text().replace(/```json|```/g, ""));

            const newItems = extracted.map((item: any) => ({
                id: Math.random().toString(36).substr(2, 9),
                name: item.nombre,
                dosage: item.dosis
            }));

            setProducts([...newItems, ...products]);
        } catch (err: any) {
            console.error(err);
            // ALERTA CON ERROR REAL
            alert("Error OCR: " + (err.message || "Fallo desconocido al escanear"));
        } finally {
            setIsAnalyzing(false);
        }
    };

    // GUARDADO: Con alerta de error de Supabase
    const handleConfirm = async () => {
        if (products.length === 0) return;
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No hay una sesión activa. Por favor, inicia sesión.");

            const { error: dbError } = await supabase.from('pedidos').insert([{
                user_id: user.id,
                lista_productos: products, // Se guarda en tu campo JSONB
                estado: 'Pendiente'
            }]);

            if (dbError) throw dbError;
            setSuccess(true);
        } catch (err: any) {
            console.error(err);
            // ALERTA CON ERROR REAL DE BASE DE DATOS
            alert("Error BD: " + (err.message || "No se pudo guardar el pedido"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddText = () => {
        if (!inputText.trim()) return;
        setProducts([{ id: Math.random().toString(36).substr(2, 9), name: inputText, dosage: '' }, ...products]);
        setInputText('');
    };

    if (success) {
        return (
            <div className="p-10 text-center bg-[#0f172a] min-h-screen text-white">
                <div className="bg-brand-green/10 p-8 rounded-full mb-8 inline-block shadow-2xl">
                    <PackageIcon className="h-12 w-12 text-brand-green" />
                </div>
                <h2 className="text-xl font-bold uppercase italic mb-6">¡PEDIDO RECIBIDO!</h2>
                <button onClick={() => { setSuccess(false); setProducts([]); setActiveTab('history'); }} className="w-full py-4 bg-brand-green text-white rounded-xl font-bold uppercase tracking-widest transition-transform active:scale-95">VER MIS PEDIDOS</button>
            </div>
        );
    }

    return (
        <div className="bg-[#0f172a] flex flex-col h-full min-h-screen text-white">
            <div className="text-center py-6">
                <h1 className="text-2xl font-black italic uppercase tracking-tighter">MIS PEDIDOS</h1>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Estado de tus solicitudes y compras.</p>
            </div>

            <div className="flex border-b border-gray-800">
                <button onClick={() => setActiveTab('new')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest ${activeTab === 'new' ? 'border-b-2 border-brand-green text-gray-200' : 'text-gray-600'}`}>ENCARGAR</button>
                <button onClick={() => setActiveTab('history')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest ${activeTab === 'history' ? 'border-b-2 border-brand-green text-gray-200' : 'text-gray-600'}`}>HISTORIAL</button>
            </div>

            <div className="p-4 flex-grow overflow-y-auto">
                {activeTab === 'new' ? (
                    <div className="space-y-6">
                        <div className="bg-[#1e293b] rounded-xl p-1 flex items-center border border-gray-800 shadow-lg">
                            <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-400 hover:text-brand-green">
                                {isAnalyzing ? <div className="h-5 w-5 animate-spin border-2 border-brand-green border-t-transparent rounded-full"/> : <CameraIcon className="h-5 w-5" />}
                            </button>
                            <input 
                                type="text" 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddText()}
                                placeholder="Añadir producto..." 
                                className="bg-transparent flex-grow py-3 px-2 text-sm focus:outline-none text-gray-300"
                            />
                            <button onClick={handleAddText} className="p-3 text-gray-400 hover:text-white"><PlusIcon className="h-5 w-5" /></button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleScan(e.target.files[0])} />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4 px-1">
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest italic">TU SELECCIÓN</h3>
                                <span className="text-[10px] font-bold text-gray-500">{products.length} ITEM</span>
                            </div>
                            <div className="space-y-2">
                                {products.map((p) => (
                                    <div key={p.id} className="bg-[#1e293b] p-4 rounded-xl flex justify-between items-center border border-gray-800 shadow-md">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white uppercase italic tracking-tight">{p.name} <span className="text-gray-600 font-normal ml-1 text-xs">{p.dosage}</span></span>
                                        </div>
                                        <div className="flex gap-4">
                                            <button onClick={() => {
                                                const n = prompt("Editar producto:", p.name);
                                                if(n) setProducts(products.map(i => i.id === p.id ? {...i, name: n} : i));
                                            }} className="text-gray-500 hover:text-white"><PencilIcon className="h-4 w-4" /></button>
                                            <button onClick={() => setProducts(products.filter(i => i.id !== p.id))} className="text-gray-600 hover:text-red-500"><XMarkIcon className="h-4 w-4" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 space-y-4 text-center">
                            <button 
                                onClick={handleConfirm} 
                                disabled={isSubmitting || products.length === 0}
                                className="w-full py-4 bg-[#4a5d55] text-white rounded-xl font-bold text-sm shadow-xl active:scale-[0.98] transition-all disabled:opacity-30"
                            >
                                {isSubmitting ? 'PROCESANDO...' : 'Confirmar Pedido'}
                            </button>
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">SE ADMITE PAGO EN TIENDA O POR BIZUM</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-600 font-bold text-[10px] uppercase tracking-widest">No hay historial de pedidos.</div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
