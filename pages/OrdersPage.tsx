import React, { useState, useEffect, useRef } from 'react';
import { CameraIcon, XMarkIcon, PackageIcon } from '../components/Icons';
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
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. ESCÁNER CON GEMINI 3 (Ajustado para el OCR de tus fotos)
    const handleScan = async (file: File) => {
        setIsAnalyzing(true);
        try {
            // Leemos la llave del archivo .env
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            const genAI = new GoogleGenerativeAI(apiKey);
            
            // Forzamos el uso de Gemini 3 como en AI Studio
            const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

            const base64Data = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.readAsDataURL(file);
            });

            const prompt = "Actúa como farmacéutico. Analiza la imagen y extrae los medicamentos. Devuelve SOLO un array JSON con este formato: [{\"nombre\": \"Nombre del producto\", \"dosis\": \"Concentración/Dosis\"}]";

            const result = await model.generateContent([
                prompt,
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
        } catch (err) {
            console.error("Error OCR:", err);
            alert("No se pudo leer la imagen. Asegúrate de que la API Key esté cargada en Dokploy.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // 2. GUARDAR EN LA TABLA 'PEDIDOS' (Columna lista_productos JSONB)
    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Inicia sesión para realizar el encargo.");

            // Formato exacto para tu columna 'lista_productos'
            const listaParaDB = products.map(p => ({
                nombre: p.name,
                dosis: p.dosage
            }));

            const { error } = await supabase.from('pedidos').insert([{
                user_id: user.id,
                lista_productos: listaParaDB, // Se guarda como JSONB
                estado: 'Pendiente'
            }]);

            if (error) throw error;
            setSuccess(true);
        } catch (err: any) {
            alert(err.message || "Error al conectar con la base de datos.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const loadHistory = async () => {
        const { data } = await supabase
            .from('pedidos')
            .select('*')
            .order('creado_el', { ascending: false }); // Orden por tu columna de fecha
        if (data) setOrders(data);
    };

    useEffect(() => {
        if (activeTab === 'history') loadHistory();
    }, [activeTab]);

    if (success) {
        return (
            <div className="p-10 text-center animate-in fade-in zoom-in">
                <div className="bg-brand-green/10 p-8 rounded-full mb-8 inline-block shadow-2xl">
                    <PackageIcon className="h-12 w-12 text-brand-green" />
                </div>
                <h2 className="text-xl font-black text-white uppercase italic mb-3 tracking-tighter">¡PEDIDO REALIZADO!</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-10">Farmacia Roberto Valero</p>
                <button onClick={() => { setSuccess(false); setProducts([]); setActiveTab('history'); }} className="w-full py-5 bg-brand-green text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">Ver historial</button>
            </div>
        );
    }

    return (
        <div className="bg-slate-950 flex flex-col h-full overflow-hidden">
            <div className="bg-slate-900 border-b border-slate-800 p-2">
                <div className="flex max-w-md mx-auto gap-2">
                    <button onClick={() => setActiveTab('new')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'new' ? 'bg-brand-green text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Nuevo Pedido</button>
                    <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'history' ? 'bg-brand-green text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Historial</button>
                </div>
            </div>

            <div className="flex-grow flex flex-col overflow-hidden">
                {activeTab === 'new' ? (
                    <>
                        <div className="p-6 bg-slate-900 border-b border-slate-800 flex items-center gap-5">
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleScan(e.target.files[0])} />
                            <button onClick={() => fileInputRef.current?.click()} disabled={isAnalyzing} className="p-5 bg-brand-green text-white rounded-full shadow-[0_0_30px_rgba(0,223,154,0.3)] active:scale-90 transition-transform disabled:opacity-30">
                                {isAnalyzing ? <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div> : <CameraIcon className="h-7 w-7" />}
                            </button>
                            <div className="flex-grow">
                                <h3 className="text-white font-black text-xs uppercase italic tracking-tighter">OCR Inteligente</h3>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">Usando Gemini 3 Flash</p>
                            </div>
                        </div>

                        <div className="flex-grow p-4 overflow-y-auto space-y-3 custom-scrollbar">
                            {products.length === 0 && !isAnalyzing && (
                                <div className="py-20 text-center px-10">
                                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest leading-loose italic">Sube la foto de tu medicamento para que Roberto lo prepare</p>
                                </div>
                            )}
                            {products.map(p => (
                                <div key={p.id} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex justify-between items-center animate-in slide-in-from-right duration-500 shadow-sm">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-white uppercase italic tracking-tight">{p.name}</span>
                                        <span className="text-[10px] text-brand-green font-black uppercase">{p.dosage}</span>
                                    </div>
                                    <button onClick={() => setProducts(products.filter(i => i.id !== p.id))} className="p-2 text-slate-700 hover:text-red-500 transition-colors"><XMarkIcon className="h-6 w-6"/></button>
                                </div>
                            ))}
                        </div>

                        <div className="p-5 bg-slate-900 border-t border-slate-800">
                            <button onClick={handleConfirm} disabled={isSubmitting || products.length === 0} className="w-full py-6 bg-brand-green text-white rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(0,0,0,0.4)] disabled:opacity-10 active:scale-95 transition-all">
                                {isSubmitting ? 'ENVIANDO...' : 'CONFIRMAR ENCARGO'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="p-4 space-y-4 overflow-y-auto pb-24">
                        {orders.map(o => (
                            <div key={o.id} className="bg-slate-900 p-5 rounded-[2rem] border border-slate-800 shadow-xl">
                                <div className="flex justify-between items-center mb-4">
                                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${o.estado === 'Pendiente' ? 'bg-orange-500/10 text-orange-400' : 'bg-brand-green/10 text-brand-green'}`}>{o.estado}</span>
                                    <span className="text-[10px] text-slate-600 font-bold uppercase">{new Date(o.creado_el).toLocaleDateString()}</span>
                                </div>
                                <div className="space-y-2">
                                    {o.lista_productos?.map((item: any, i: number) => (
                                        <div key={i} className="flex items-center text-[11px] text-slate-300 font-bold italic">
                                            <div className="w-1.5 h-1.5 bg-brand-green rounded-full mr-3 shadow-[0_0_10px_rgba(0,223,154,1)]"></div>
                                            {item.nombre} - {item.dosis}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
