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

    // 1. ESCÁNER: Usando 'gemini-flash-latest' para evitar el error 404
    const handleScan = async (file: File) => {
        setIsAnalyzing(true);
        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
            const genAI = new GoogleGenerativeAI(apiKey);
            
            // Cambio solicitado: Utilizamos el alias más reciente de Google
            const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

            const base64Data = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.readAsDataURL(file);
            });

            const result = await model.generateContent([
                "Extrae los nombres de medicamentos y sus dosis. Devuelve SOLO un array JSON: [{\"nombre\": \"Producto\", \"dosis\": \"Dosis\"}]",
                { inlineData: { data: base64Data, mimeType: file.type } }
            ]);

            const response = await result.response;
            const text = response.text().replace(/```json|```/g, "");
            const extracted = JSON.parse(text);

            const newItems = extracted.map((item: any) => ({
                id: Math.random().toString(36).substr(2, 9),
                name: item.nombre,
                dosage: item.dosis
            }));

            setProducts([...newItems, ...products]);
        } catch (err: any) {
            console.error("Error OCR:", err);
            alert("Error en el escáner: " + err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // 2. GUARDADO: Inserción directa en 'public.pedidos' campo 'lista_productos' (jsonb)
    const handleConfirm = async () => {
        if (products.length === 0) return;
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return alert("Debes iniciar sesión para realizar el encargo.");

            // Según tu esquema SQL, insertamos en 'lista_productos' el array de objetos
            const { error: dbError } = await supabase.from('pedidos').insert([{
                user_id: user.id,
                lista_productos: products,
                estado: 'Pendiente'
            }]);

            if (dbError) throw dbError;
            setSuccess(true);
            setProducts([]);
        } catch (err: any) {
            console.error("Error BD:", err);
            alert("Error de base de datos: " + err.message);
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
            <div className="p-10 text-center bg-[#0f172a] min-h-screen text-white flex flex-col items-center justify-center">
                <div className="bg-brand-green/10 p-8 rounded-full mb-8 inline-block shadow-2xl">
                    <PackageIcon className="h-12 w-12 text-brand-green" />
                </div>
                <h2 className="text-xl font-bold uppercase italic mb-6 tracking-tighter">¡PEDIDO RECIBIDO!</h2>
                <button onClick={() => setSuccess(false)} className="w-full max-w-xs py-4 bg-brand-green text-white rounded-xl font-bold uppercase tracking-widest">Aceptar</button>
            </div>
        );
    }

    return (
        <div className="bg-[#0f172a] flex flex-col h-full min-h-screen text-white">
            <div className="text-center py-6">
                <h1 className="text-2xl font-black italic uppercase tracking-tighter">MIS PEDIDOS</h1>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Estado de tus solicitudes y compras.</p>
            </div>

            {/* DISEÑO DE TABS ORIGINAL */}
            <div className="flex border-b border-gray-800">
                <button onClick={() => setActiveTab('new')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'new' ? 'border-b-2 border-brand-green text-gray-200' : 'text-gray-600'}`}>ENCARGAR</button>
                <button onClick={() => setActiveTab('history')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'history' ? 'border-b-2 border-brand-green text-gray-200' : 'text-gray-600'}`}>HISTORIAL</button>
            </div>

            <div className="p-4 flex-grow overflow-y-auto">
                {activeTab === 'new' ? (
                    <div className="space-y-6">
                        {/* BUSCADOR INTEGRADO CON ICONOS */}
                        <div className="bg-[#1e293b] rounded-xl p-1 flex items-center border border-gray-800 shadow-lg">
                            <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-400 hover:text-brand-green transition-colors">
                                {isAnalyzing ? <div className="animate-spin h-5 w-5 border-2 border-brand-green border-t-transparent rounded-full"/> : <CameraIcon className="h-5 w-5" />}
                            </button>
                            <input 
                                type="text" 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddText()}
                                placeholder="Añadir producto..." 
                                className="bg-transparent flex-grow py-3 px-2 text-sm focus:outline-none text-gray-300 font-medium"
                            />
                            <button onClick={handleAddText} className="p-3 text-gray-400 hover:text-white"><PlusIcon className="h-5 w-5" /></button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleScan(e.target.files[0])} />
                        </div>

                        {/* LISTADO CON EDITAR Y BORRAR */}
                        <div>
                            <div className="flex justify-between items-center mb-4 px-1">
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest italic tracking-wider">TU SELECCIÓN</h3>
                                <span className="text-[10px] font-bold text-gray-500">{products.length} ITEM</span>
                            </div>
                            <div className="space-y-2">
                                {products.map((p) => (
                                    <div key={p.id} className="bg-[#1e293b] p-4 rounded-xl flex justify-between items-center border border-gray-800 shadow-md">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white uppercase italic tracking-tight">
                                                {p.name} <span className="text-gray-600 font-normal ml-1 text-xs">{p.dosage}</span>
                                            </span>
                                        </div>
                                        <div className="flex gap-4">
                                            <button onClick={() => {
                                                const n = prompt("Editar producto:", p.name);
                                                if(n) setProducts(products.map(i => i.id === p.id ? {...i, name: n} : i));
                                            }} className="text-gray-600 hover:text-white"><PencilIcon className="h-4 w-4" /></button>
                                            <button onClick={() => setProducts(products.filter(i => i.id !== p.id))} className="text-gray-600 hover:text-red-500"><XMarkIcon className="h-4 w-4" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* BOTÓN DE CONFIRMACIÓN FINAL */}
                        <div className="pt-4 space-y-4 text-center">
                            <button 
                                onClick={handleConfirm} 
                                disabled={isSubmitting || products.length === 0}
                                className="w-full py-4 bg-[#4a5d55] text-white rounded-xl font-bold text-sm shadow-xl active:scale-[0.98] transition-all disabled:opacity-30"
                            >
                                {isSubmitting ? 'PROCESANDO...' : 'Confirmar Pedido'}
                            </button>
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                                SE ADMITE PAGO EN TIENDA O POR BIZUM
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-600 font-bold text-[10px] uppercase tracking-widest">Cargando historial de pedidos...</div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
