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
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data, error } = await supabase
                .from('pedidos')
                .select('*')
                .eq('user_id', user.id)
                .order('creado_el', { ascending: false });
            if (error) throw error;
            setHistory(data || []);
        } catch (err) {
            console.error("Error historial:", err);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'history') fetchHistory();
    }, [activeTab]);

    const handleScan = async (file: File) => {
        setIsAnalyzing(true);
        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
            const base64Data = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.readAsDataURL(file);
            });
            const result = await model.generateContent([
                "Extrae medicamentos. Devuelve SOLO JSON: [{\"nombre\": \"Producto\", \"dosis\": \"Dosis\"}]",
                { inlineData: { data: base64Data, mimeType: file.type } }
            ]);
            const response = await result.response;
            const extracted = JSON.parse(response.text().replace(/```json|```/g, "").trim());
            const newItems = extracted.map((item: any) => ({
                id: Math.random().toString(36).substr(2, 9),
                name: item.nombre,
                dosage: item.dosis || ''
            }));
            setProducts([...products, ...newItems]);
        } catch (err) {
            alert("Error al leer la imagen.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleConfirm = async () => {
        if (products.length === 0) return;
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return alert("Inicia sesión.");
            const { error } = await supabase.from('pedidos').insert([{
                user_id: user.id,
                lista_productos: products,
                estado: 'Pendiente'
            }]);
            if (error) throw error;
            setSuccess(true);
            setProducts([]);
        } catch (err) {
            alert("Error al guardar el pedido.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="p-10 text-center bg-gray-50 min-h-screen flex flex-col justify-center items-center">
                <div className="bg-green-100 p-6 rounded-full mb-6">
                    <PackageIcon className="h-12 w-12 text-[#4a5d55]" />
                </div>
                <h2 className="text-xl font-bold text-blue-900 uppercase mb-6">¡Pedido Recibido!</h2>
                <button onClick={() => { setSuccess(false); setActiveTab('history'); }} className="w-full py-4 bg-[#4a5d55] text-white rounded-xl font-bold uppercase tracking-widest shadow-lg">Aceptar</button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 flex flex-col min-h-screen">
            {/* CABECERA CORREGIDA: Sin duplicados y texto recto */}
            <div className="bg-white p-6 text-center border-b border-gray-100 shadow-sm">
                <h1 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">MIS PEDIDOS</h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ESTADO DE TUS SOLICITUDES Y COMPRAS</p>
            </div>

            {/* SELECTOR DE PESTAÑAS */}
            <div className="flex bg-white mx-4 mt-6 rounded-xl shadow-sm border border-gray-100 p-1 mb-6">
                <button onClick={() => setActiveTab('new')} className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'new' ? 'bg-gray-50 text-blue-900 shadow-inner' : 'text-gray-400'}`}>ENCARGAR</button>
                <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'history' ? 'bg-gray-50 text-blue-900 shadow-inner' : 'text-gray-400'}`}>HISTORIAL</button>
            </div>

            <div className="px-4 flex-grow overflow-y-auto pb-40 no-scrollbar">
                {activeTab === 'new' ? (
                    <div className="space-y-6">
                        {/* ZONA DE ESCÁNER */}
                        <div onClick={() => fileInputRef.current?.click()} className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer shadow-sm active:scale-95 transition-all">
                            {isAnalyzing ? (
                                <div className="flex flex-col items-center"><div className="h-8 w-8 animate-spin border-4 border-blue-900 border-t-transparent rounded-full mb-2"/><p className="text-[10px] font-bold text-gray-500 uppercase">Analizando...</p></div>
                            ) : (
                                <><div className="bg-gray-50 p-4 rounded-full inline-block mb-2 text-gray-400"><CameraIcon className="h-8 w-8" /></div><p className="text-gray-700 font-bold text-sm">Escanea tu receta o lista</p><p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">IMAGEN O PDF HASTA 10MB</p></>
                            )}
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={(e) => e.target.files?.[0] && handleScan(e.target.files[0])} />
                        </div>

                        {/* LISTA DE PRODUCTOS */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="text-[11px] font-black text-blue-900 uppercase tracking-widest">TU SELECCIÓN</h3>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{products.length} PRODUCTOS</span>
                            </div>
                            <div className="space-y-3">
                                {products.map((p) => (
                                    <div key={p.id} className="bg-gray-50 p-4 rounded-xl flex justify-between items-center border border-gray-100">
                                        <span className="text-sm font-bold text-blue-900 uppercase">{p.name} <span className="text-gray-400 font-normal ml-1 lowercase">{p.dosage}</span></span>
                                        <button onClick={() => setProducts(products.filter(i => i.id !== p.id))} className="text-gray-300"><XMarkIcon className="h-5 w-5" /></button>
                                    </div>
                                ))}
                                <div className="flex gap-2 pt-2">
                                    <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && inputText && (setProducts([{id: Date.now().toString(), name: inputText, dosage: ''}, ...products]), setInputText(''))} placeholder="Añadir manualmente..." className="flex-grow bg-gray-50 border-gray-100 rounded-xl p-3 text-sm outline-none" />
                                    <button onClick={() => { if(inputText) { setProducts([{id: Date.now().toString(), name: inputText, dosage: ''}, ...products]); setInputText(''); }}} className="bg-blue-900 text-white p-3 rounded-xl shadow-md"><PlusIcon className="h-5 w-5" /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {loadingHistory ? (
                            <div className="text-center py-10 text-gray-500 text-[10px] font-bold uppercase animate-pulse">Cargando...</div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 text-gray-400 font-bold text-[10px] uppercase">Sin pedidos realizados.</div>
                        ) : (
                            history.map((order) => (
                                <div key={order.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">{order.creado_el ? new Date(order.creado_el).toLocaleDateString() : 'Hoy'}</p>
                                            <h4 className="text-sm font-black text-blue-900 uppercase">Pedido #{order.id.slice(0, 5)}</h4>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                            order.estado === 'Pendiente' ? 'bg-yellow-50 text-yellow-600' : 
                                            order.estado === 'Listo para recoger' ? 'bg-green-50 text-green-600 animate-pulse' :
                                            'bg-gray-100 text-gray-500'
                                        }`}>
                                            {order.estado}
                                        </span>
                                    </div>
                                    <div className="space-y-1 border-t border-gray-50 pt-3 mb-4">
                                        {order.lista_productos.slice(0, 2).map((item: any, idx: number) => (
                                            <p key={idx} className="text-xs text-gray-500 italic">• {item.name}</p>
                                        ))}
                                    </div>
                                    <button onClick={() => { setProducts(order.lista_productos); setActiveTab('new'); }} className="w-full py-2 border border-blue-900/10 rounded-lg text-[10px] font-black text-blue-900 uppercase flex items-center justify-center gap-2">
                                        <PackageIcon className="h-4 w-4" /> REPETIR ENCARGO
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* PIE DE PÁGINA: Botón Confirmar y Bizum */}
            {activeTab === 'new' && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-20 text-center">
                    <button onClick={handleConfirm} disabled={isSubmitting || products.length === 0} className="max-w-lg mx-auto w-full py-4 bg-[#4a5d55] text-white rounded-xl font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all disabled:opacity-30 mb-3">
                        {isSubmitting ? 'PROCESANDO...' : 'Confirmar Pedido'}
                    </button>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        SE ADMITE PAGO EN TIENDA O POR BIZUM
                    </p>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
