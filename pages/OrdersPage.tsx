import React, { useState, useEffect, useRef } from 'react';
import { CameraIcon, XMarkIcon, PackageIcon, PlusIcon, PencilIcon } from '../components/Icons';
import { supabase } from '../lib/supabase';
// Importación corregida para el entorno de despliegue
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
    const [orders, setOrders] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // FUNCIÓN: Añadir producto por texto (Botón +)
    const handleAddText = () => {
        if (!inputText.trim()) return;
        const newItem: ProductItem = {
            id: Math.random().toString(36).substr(2, 9),
            name: inputText,
            dosage: '' // Se puede editar después
        };
        setProducts([newItem, ...products]);
        setInputText('');
    };

    // FUNCIÓN: Escáner con IA (Icono Cámara)
    const handleScan = async (file: File) => {
        setIsAnalyzing(true);
        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const base64Data = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.readAsDataURL(file);
            });

            const result = await model.generateContent([
                "Extrae productos farmacéuticos. Devuelve JSON: [{\"nombre\": \"Nombre\", \"dosis\": \"Dosis\"}]",
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
        } catch (err) {
            console.error(err);
            alert("Error al leer la imagen.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // FUNCIÓN: Editar Producto (Icono Lápiz)
    const handleEdit = (id: string) => {
        const product = products.find(p => p.id === id);
        if (!product) return;
        const newName = prompt("Editar nombre del producto:", product.name);
        if (newName !== null) {
            setProducts(products.map(p => p.id === id ? { ...p, name: newName } : p));
        }
    };

    // FUNCIÓN: Confirmar Pedido (Botón Verde)
    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Inicia sesión");

            const { error } = await supabase.from('pedidos').insert([{
                user_id: user.id,
                lista_productos: products,
                estado: 'Pendiente'
            }]);

            if (error) throw error;
            setSuccess(true);
        } catch (err) {
            alert("Error al guardar en la base de datos.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="p-10 text-center bg-[#0f111a] min-h-screen">
                <div className="bg-brand-green/10 p-8 rounded-full mb-8 inline-block">
                    <PackageIcon className="h-12 w-12 text-brand-green" />
                </div>
                <h2 className="text-xl font-bold text-white mb-6">¡PEDIDO CONFIRMADO!</h2>
                <button onClick={() => { setSuccess(false); setProducts([]); setActiveTab('history'); }} className="w-full py-4 bg-brand-green text-white rounded-xl font-bold uppercase tracking-widest">VER MIS PEDIDOS</button>
            </div>
        );
    }

    return (
        <div className="bg-[#0f111a] flex flex-col h-full min-h-screen text-white">
            {/* TABS (ENCARGAR / HISTORIAL) */}
            <div className="flex border-b border-gray-800">
                <button onClick={() => setActiveTab('new')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'new' ? 'border-b-2 border-brand-green text-gray-200' : 'text-gray-600'}`}>ENCARGAR</button>
                <button onClick={() => setActiveTab('history')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'history' ? 'border-b-2 border-brand-green text-gray-200' : 'text-gray-600'}`}>HISTORIAL</button>
            </div>

            <div className="p-4 flex-grow overflow-y-auto">
                {activeTab === 'new' ? (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* BUSCADOR INTEGRADO (image_a21461.png) */}
                        <div className="bg-[#1a1d29] rounded-xl p-1 flex items-center border border-gray-800/50 shadow-inner">
                            <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-500 hover:text-brand-green transition-colors">
                                {isAnalyzing ? <div className="h-5 w-5 animate-spin border-2 border-brand-green border-t-transparent rounded-full"/> : <CameraIcon className="h-5 w-5" />}
                            </button>
                            <input 
                                type="text" 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddText()}
                                placeholder="Añadir producto..." 
                                className="bg-transparent flex-grow py-3 px-2 text-sm focus:outline-none text-gray-300 placeholder-gray-600 font-medium"
                            />
                            <button onClick={handleAddText} className="p-3 text-gray-400 hover:text-white">
                                <PlusIcon className="h-5 w-5" />
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleScan(e.target.files[0])} />
                        </div>

                        {/* LISTA: TU SELECCIÓN */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">TU SELECCIÓN</h3>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{products.length} ITEM</span>
                            </div>

                            <div className="space-y-2">
                                {products.map((p) => (
                                    <div key={p.id} className="bg-[#1a1d29] p-4 rounded-xl flex justify-between items-center border border-gray-800/30 group animate-in slide-in-from-right-4 duration-300">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-200">
                                                {p.name} <span className="text-gray-600 font-medium ml-1 text-xs">{p.dosage}</span>
                                            </span>
                                        </div>
                                        <div className="flex gap-4">
                                            <button onClick={() => handleEdit(p.id)} className="text-gray-600 hover:text-white transition-colors">
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => setProducts(products.filter(i => i.id !== p.id))} className="text-gray-600 hover:text-red-400 transition-colors">
                                                <XMarkIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* PIE Y BOTÓN (image_a21461.png) */}
                        <div className="pt-6 space-y-6">
                            <button 
                                onClick={handleConfirm}
                                disabled={isSubmitting || products.length === 0}
                                className="w-full py-4 bg-[#4a5d55] hover:bg-[#5a6d65] text-white rounded-xl font-bold text-sm shadow-lg active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'PROCESANDO...' : 'Confirmar Pedido'}
                            </button>
                            <p className="text-center text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">
                                ADMITIMOS PAGO EN TIENDA O POR BIZUM
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">Cargando historial...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
