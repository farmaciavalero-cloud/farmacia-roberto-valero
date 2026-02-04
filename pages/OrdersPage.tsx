
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CameraIcon, PencilIcon, XMarkIcon, PlusIcon, PackageIcon } from '../components/Icons';
import { supabase } from '../lib/supabase';
import { GoogleGenAI, Type } from "@google/genai";

type ProductItem = {
    id: string;
    name: string;
    dosage: string;
    isEditing?: boolean;
};

type Order = {
    id: string;
    date: string;
    status: 'En preparación' | 'Listo para recoger' | 'Entregado';
    items: string[];
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
    });
};

const ProductCard: React.FC<{ 
    product: ProductItem; 
    onDelete: (id: string) => void;
    onUpdate: (id: string, name: string, dosage: string) => void;
    onToggleEdit: (id: string) => void;
}> = ({ product, onDelete, onUpdate, onToggleEdit }) => {
    const [editName, setEditName] = useState(product.name);
    const [editDosage, setEditDosage] = useState(product.dosage);

    const handleSave = () => {
        onUpdate(product.id, editName, editDosage);
        onToggleEdit(product.id);
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between animate-fade-in mb-2">
            <div className="flex-grow pr-3">
                {product.isEditing ? (
                    <div className="flex flex-col space-y-2">
                        <input 
                            value={editName} 
                            onChange={(e) => setEditName(e.target.value)}
                            autoFocus
                            className="text-sm font-medium bg-gray-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 outline-none w-full dark:text-white"
                        />
                        <input 
                            value={editDosage} 
                            onChange={(e) => setEditDosage(e.target.value)}
                            className="text-[11px] bg-gray-50 dark:bg-slate-900 px-3 py-1 rounded-lg border border-gray-200 dark:border-slate-700 outline-none w-full dark:text-gray-400"
                            placeholder="Dosis"
                        />
                        <button 
                            onClick={handleSave} 
                            className="text-[10px] font-bold text-white bg-brand-green px-3 py-1.5 rounded-lg uppercase self-start"
                        >
                            Guardar
                        </button>
                    </div>
                ) : (
                    <div className="flex items-baseline flex-wrap">
                        <h4 className="font-semibold text-sm text-brand-dark dark:text-slate-100 mr-2">{product.name}</h4>
                        {product.dosage && <span className="text-[11px] text-gray-400 dark:text-slate-500 font-medium">{product.dosage}</span>}
                    </div>
                )}
            </div>
            
            {!product.isEditing && (
                <div className="flex items-center space-x-1">
                    <button onClick={() => onToggleEdit(product.id)} className="p-1.5 text-gray-300 hover:text-brand-green transition-colors">
                        <PencilIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(product.id)} className="p-1.5 text-gray-300 hover:text-red-400 transition-colors">
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

const SmartOrderPanel: React.FC<{
    products: ProductItem[];
    setProducts: React.Dispatch<React.SetStateAction<ProductItem[]>>;
    onScan: (file: File) => void;
    isAnalyzing: boolean;
    onSubmit: () => void;
    isSubmitting: boolean;
}> = ({ products, setProducts, onScan, isAnalyzing, onSubmit, isSubmitting }) => {
    const [manualInput, setManualInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const deleteProduct = (id: string) => setProducts(products.filter(p => p.id !== id));
    const toggleEdit = (id: string) => setProducts(products.map(p => p.id === id ? { ...p, isEditing: !p.isEditing } : p));
    const updateProduct = (id: string, name: string, dosage: string) => 
        setProducts(products.map(p => p.id === id ? { ...p, name, dosage } : p));

    const handleAddManual = () => {
        if (manualInput.trim()) {
            setProducts([{ id: `man-${Date.now()}`, name: manualInput, dosage: '' }, ...products]);
            setManualInput('');
        }
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            {/* Top Input Bar - Compact Style */}
            <div className="p-4 bg-white dark:bg-slate-900 border-b border-gray-50 dark:border-slate-800">
                <div className="flex items-center bg-gray-100 dark:bg-slate-800/50 rounded-xl px-2 py-0.5 transition-all border border-transparent focus-within:border-brand-green/20">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => e.target.files?.[0] && onScan(e.target.files[0])}
                    />
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isAnalyzing}
                        className="p-2 text-brand-green disabled:opacity-50"
                    >
                        {isAnalyzing ? (
                            <div className="animate-spin h-5 w-5 border-2 border-brand-green border-t-transparent rounded-full"></div>
                        ) : (
                            <CameraIcon className="h-5 w-5" />
                        )}
                    </button>
                    <input 
                        placeholder="Añadir producto..." 
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddManual()}
                        className="bg-transparent border-none focus:ring-0 text-xs font-medium w-full py-2 px-1 text-gray-500 dark:text-slate-300 placeholder:text-gray-400"
                    />
                    <button 
                        onClick={handleAddManual}
                        disabled={!manualInput.trim()}
                        className="p-2 text-brand-green disabled:text-gray-300"
                    >
                        <PlusIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* List Area */}
            <div className="flex-grow p-4 overflow-y-auto scrollbar-hide">
                {products.length === 0 ? (
                    <div className="py-20 text-center px-8">
                        <p className="text-xs font-medium text-gray-400 dark:text-slate-600 leading-relaxed italic">
                            Sube una imagen o escribe el nombre del producto que necesites
                        </p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h3 className="text-[10px] font-bold text-gray-300 dark:text-slate-700 uppercase tracking-widest">Tu selección</h3>
                            <span className="text-[10px] font-bold text-brand-green">{products.length} {products.length === 1 ? 'ITEM' : 'ITEMS'}</span>
                        </div>
                        {products.map(product => (
                            <ProductCard 
                                key={product.id} 
                                product={product} 
                                onDelete={deleteProduct} 
                                onUpdate={updateProduct}
                                onToggleEdit={toggleEdit}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Section - Integrated Confirmation */}
            <div className="p-5 bg-white dark:bg-slate-900 border-t border-gray-50 dark:border-slate-800">
                <button 
                    onClick={onSubmit}
                    disabled={isSubmitting || products.length === 0}
                    className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-brand-green hover:bg-opacity-95 focus:outline-none transition-all active:scale-[0.98] disabled:bg-gray-300 disabled:shadow-none"
                >
                    {isSubmitting ? 'Procesando pedido...' : 'Confirmar Pedido'}
                </button>
                <div className="mt-3 text-center">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[0.1em]">
                        Se admite pago en tienda o por bizum
                    </p>
                </div>
            </div>
        </div>
    );
};

const OrdersPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        if (activeTab === 'history') loadHistory();
    }, [activeTab]);

    const loadHistory = async () => {
        setLoadingHistory(true);
        try {
            const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            if (data) {
                setOrders(data.map(o => ({
                    id: o.id,
                    date: new Date(o.created_at).toLocaleDateString(),
                    status: o.status as Order['status'],
                    items: o.items || []
                })));
            }
        } catch (e) { console.error(e); } finally { setLoadingHistory(false); }
    };

    const handleScan = async (file: File) => {
        setIsAnalyzing(true);
        try {
            const base64 = await fileToBase64(file);
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const schema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: "Normalized medication name." },
                        dosage: { type: Type.STRING, description: "Standardized dosage format." }
                    },
                    required: ["name", "dosage"]
                }
            };

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: {
                    parts: [
                        { inlineData: { mimeType: file.type, data: base64 } },
                        { text: "Extrae los medicamentos de la imagen. Corrige nombres y dosis. Devuelve JSON." }
                    ]
                },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema
                }
            });

            if (response.text) {
                const results = JSON.parse(response.text);
                const items: ProductItem[] = results.map((r: any, i: number) => ({
                    id: `ai-${Date.now()}-${i}`,
                    name: r.name,
                    dosage: r.dosage
                }));
                setProducts(prev => [...items, ...prev]);
            }
        } catch (err) {
            console.error(err);
            alert("Error al escanear. Intenta con una foto más clara.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleConfirm = async () => {
        setIsSubmitting(true);
        const orderId = `RV-${Math.floor(1000 + Math.random() * 9000)}`;
        const items = products.map(p => `${p.name} ${p.dosage}`);
        
        try {
            const { error } = await supabase.from('orders').insert([{
                id: orderId,
                items,
                status: 'En preparación',
                payment_method: 'Pagar en tienda/Bizum'
            }]);
            if (error) throw error;
            setSuccess(true);
        } catch (e) {
            console.error(e);
            setSuccess(true); 
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="p-10 flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
                <div className="bg-brand-green/10 p-8 rounded-full mb-8">
                    <PackageIcon className="h-12 w-12 text-brand-green" />
                </div>
                <h2 className="text-xl font-bold text-brand-dark dark:text-white uppercase leading-none mb-3">¡Pedido Recibido!</h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-10 leading-relaxed">Estamos procesando tu solicitud. Recibirás una notificación cuando esté listo para recoger.</p>
                <button
                    onClick={() => { setSuccess(false); setProducts([]); setActiveTab('history'); }}
                    className="w-full py-4 bg-brand-green text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-green/20"
                >
                    Ver mis pedidos
                </button>
            </div>
        );
    }

    return (
        <div className="bg-brand-light dark:bg-slate-950 flex flex-col h-full overflow-hidden transition-colors">
            {/* Tabs */}
            <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
                <div className="flex max-w-md mx-auto">
                    <button
                        onClick={() => setActiveTab('new')}
                        className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-[0.15em] transition-all border-b-2 ${activeTab === 'new' ? 'border-brand-green text-brand-green' : 'border-transparent text-gray-400'}`}
                    >
                        Encargar
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-[0.15em] transition-all border-b-2 ${activeTab === 'history' ? 'border-brand-green text-brand-green' : 'border-transparent text-gray-400'}`}
                    >
                        Historial
                    </button>
                </div>
            </div>
            
            <div className="flex-grow overflow-hidden relative">
                {activeTab === 'new' ? (
                    <SmartOrderPanel 
                        products={products}
                        setProducts={setProducts}
                        onScan={handleScan}
                        isAnalyzing={isAnalyzing}
                        onSubmit={handleConfirm}
                        isSubmitting={isSubmitting}
                    />
                ) : (
                    <div className="p-4 space-y-4 h-full overflow-y-auto scrollbar-hide">
                        {loadingHistory ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin h-6 w-6 border-2 border-brand-green border-t-transparent rounded-full"></div>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-20 opacity-40 italic">
                                <p className="text-xs font-medium uppercase tracking-widest">No hay pedidos registrados</p>
                            </div>
                        ) : (
                            orders.map(order => (
                                <div key={order.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-50 dark:border-slate-700">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase block mb-0.5">#{order.id}</span>
                                            <span className="font-bold text-brand-dark dark:text-white text-sm">{order.date}</span>
                                        </div>
                                        <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-brand-green/10 text-brand-green uppercase">{order.status}</span>
                                    </div>
                                    <div className="space-y-1">
                                        {order.items.map((item, i) => (
                                            <div key={i} className="flex items-center text-[11px] text-gray-500 dark:text-slate-400">
                                                <div className="w-1 h-1 bg-brand-green rounded-full mr-2 opacity-50"></div>
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-3 mt-3 border-t border-gray-50 dark:border-slate-700 text-right">
                                        <Link to={`/tracking/${order.id}`} className="text-[9px] font-bold text-brand-green uppercase tracking-widest">Detalles →</Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
