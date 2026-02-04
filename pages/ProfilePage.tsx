
import React, { useState, useEffect } from 'react';
// Fix: Removed non-existent ChatBubbleLeftRightIcon import from components/Icons
import { BeakerIcon, ClipboardListIcon, ChevronDownIcon } from '../components/Icons';
import { supabase } from '../lib/supabase';

type HistoryStatus = 'Entregado' | 'Listo para recoger' | 'En preparación' | 'Respondida' | 'Pendiente';

const StatusBadge: React.FC<{ status: HistoryStatus }> = ({ status }) => {
    const statusClasses: Record<HistoryStatus, string> = {
        'En preparación': 'bg-yellow-100 text-yellow-800',
        'Listo para recoger': 'bg-blue-100 text-blue-800',
        'Entregado': 'bg-green-100 text-green-800',
        'Respondida': 'bg-indigo-100 text-indigo-800',
        'Pendiente': 'bg-gray-100 text-gray-800',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status]}`}>{status}</span>;
};

interface AccordionItemProps {
    title: string;
    icon: React.ReactNode;
    isOpen: boolean;
    onClick: () => void;
    children: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, icon, isOpen, onClick, children }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center text-left p-4 focus:outline-none"
                aria-expanded={isOpen}
            >
                <div className="flex items-center space-x-3">
                    {icon}
                    <span className="font-semibold text-brand-dark">{title}</span>
                </div>
                <ChevronDownIcon className={`h-5 w-5 text-gray-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                <div className="border-t border-gray-200">
                    {children}
                </div>
            </div>
        </div>
    );
};


const ProfilePage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [dni, setDni] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [requestInvoice, setRequestInvoice] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [tempName, setTempName] = useState('');
    const [tempEmail, setTempEmail] = useState('');
    const [tempDni, setTempDni] = useState('');
    const [tempPhone, setTempPhone] = useState('');
    const [tempAddress, setTempAddress] = useState('');
    const [tempCity, setTempCity] = useState('');
    const [tempPostalCode, setTempPostalCode] = useState('');
    const [tempRequestInvoice, setTempRequestInvoice] = useState(false);
    
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                setName(data.full_name || '');
                setEmail(data.email || user.email || '');
                setPhone(data.phone || '');
                setDni(data.dni || '');
                setAddress(data.address || '');
                setCity(data.city || '');
                setPostalCode(data.postal_code || '');
                setRequestInvoice(data.request_invoice || false);
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            await supabase.auth.signOut();
        }
    };

    const getInitials = (nameStr: string) => {
        if (!nameStr) return '?';
        const parts = nameStr.trim().split(' ');
        if (parts.length > 1) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return nameStr.substring(0, 2).toUpperCase();
    };

    const handleEditClick = () => {
        setTempName(name);
        setTempEmail(email);
        setTempDni(dni);
        setTempPhone(phone);
        setTempAddress(address);
        setTempCity(city);
        setTempPostalCode(postalCode);
        setTempRequestInvoice(requestInvoice);
        setIsEditing(true);
    };

    const handleSaveClick = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const profileData = {
            id: user.id,
            full_name: tempName,
            email: tempEmail,
            phone: tempPhone,
            dni: tempDni,
            address: tempAddress,
            city: tempCity,
            postal_code: tempPostalCode,
            request_invoice: tempRequestInvoice,
            updated_at: new Date().toISOString()
        };

        try {
            const { error } = await supabase
                .from('profiles')
                .upsert(profileData);

            if (error) throw error;

            setName(tempName);
            setEmail(tempEmail);
            setDni(tempDni);
            setPhone(tempPhone);
            setAddress(tempAddress);
            setCity(tempCity);
            setPostalCode(tempPostalCode);
            setRequestInvoice(tempRequestInvoice);
            
            setIsEditing(false);
        } catch (err) {
            console.error('Error saving profile:', err);
            alert('Error al guardar los cambios');
        }
    };

    const handleCancelClick = () => {
        setIsEditing(false);
    };

    const toggleAccordion = (id: string) => {
        setOpenAccordion(openAccordion === id ? null : id);
    };
    
    if (isLoading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-green border-t-transparent mx-auto"></div>
                <p className="mt-4 text-gray-500">Cargando perfil...</p>
            </div>
        );
    }

    const inputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-brand-green focus:border-brand-green";
    const editInputClasses = "text-center w-full p-1 bg-gray-100 border-b-2 border-gray-300 focus:border-brand-green outline-none transition";

    return (
        <div className="p-4 bg-brand-light min-h-full">
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 bg-brand-green rounded-full flex items-center justify-center mb-4 shadow-md">
                            <span className="text-4xl font-bold text-white">{getInitials(name)}</span>
                        </div>
                        
                        {isEditing ? (
                            <div className="w-full max-w-xs text-center space-y-3">
                                <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className={`text-2xl font-bold text-brand-dark ${editInputClasses}`} placeholder="Tu Nombre" />
                                <input type="email" value={tempEmail} readOnly className={`text-gray-400 bg-transparent border-none text-center outline-none`} />
                            </div>
                        ) : (
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-brand-dark">{name}</h2>
                                <p className="text-gray-500">{email}</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-brand-dark border-b pb-2">Datos Personales</h3>
                        {isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                                    <input type="tel" value={tempPhone} onChange={(e) => setTempPhone(e.target.value)} className={inputClasses} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">DNI/NIF</label>
                                    <input type="text" value={tempDni} onChange={(e) => setTempDni(e.target.value)} className={inputClasses} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Dirección</label>
                                    <input type="text" value={tempAddress} onChange={(e) => setTempAddress(e.target.value)} className={inputClasses} />
                                </div>
                                <div className="flex space-x-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700">Ciudad</label>
                                        <input type="text" value={tempCity} onChange={(e) => setTempCity(e.target.value)} className={inputClasses} />
                                    </div>
                                    <div className="w-1/3">
                                        <label className="block text-sm font-medium text-gray-700">C.P.</label>
                                        <input type="text" value={tempPostalCode} onChange={(e) => setTempPostalCode(e.target.value)} className={inputClasses} />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm space-y-3 text-gray-700">
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-400 uppercase text-[10px]">Teléfono:</span>
                                    <span>{phone || 'No especificado'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-400 uppercase text-[10px]">DNI:</span>
                                    <span>{dni || 'No especificado'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-400 uppercase text-[10px]">Dirección:</span>
                                    <span className="text-right">{address ? `${address}, ${postalCode} ${city}` : 'No especificada'}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-6 flex flex-col space-y-3">
                        {isEditing ? (
                            <div className="flex space-x-3">
                                <button onClick={handleSaveClick} className="flex-1 py-3 px-4 bg-brand-green text-white rounded-xl text-sm font-bold shadow-md">Guardar Cambios</button>
                                <button onClick={handleCancelClick} className="flex-1 py-3 px-4 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold">Cancelar</button>
                            </div>
                        ) : (
                            <button onClick={handleEditClick} className="w-full py-3 px-4 bg-gray-50 text-gray-700 rounded-xl text-sm font-bold border border-gray-100">Editar Información</button>
                        )}
                        <button onClick={handleLogout} className="w-full py-3 px-4 text-red-500 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors">Cerrar Sesión</button>
                    </div>
                </div>

                <div className="space-y-4">
                     <h3 className="text-lg font-bold text-brand-dark px-2">Actividad Reciente</h3>
                     <div className="space-y-2">
                        <AccordionItem title="Fórmulas Magistrales" icon={<BeakerIcon className="h-6 w-6 text-gray-500" />} isOpen={openAccordion === 'formulas'} onClick={() => toggleAccordion('formulas')}>
                            <div className="p-4 text-sm text-gray-500 text-center">Tus solicitudes de laboratorio aparecerán aquí.</div>
                        </AccordionItem>
                        
                        <AccordionItem title="Pedidos de Farmacia" icon={<ClipboardListIcon className="h-6 w-6 text-gray-500" />} isOpen={openAccordion === 'orders'} onClick={() => toggleAccordion('orders')}>
                             <div className="p-4 text-sm text-gray-500 text-center">Ve a la pestaña de 'Pedidos' para ver el historial completo.</div>
                        </AccordionItem>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
