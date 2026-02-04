
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { EyeIcon, EyeSlashIcon } from '../components/Icons';

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validatePassword = (password: string) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validateEmail(email)) {
            setError('Por favor, introduce un correo electrónico válido.');
            return;
        }

        if (!isLogin) {
            if (!acceptedPrivacy) {
                setError('Debes aceptar la política de privacidad para continuar.');
                return;
            }
            if (!validatePassword(password)) {
                setError('La contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula, número y símbolo.');
                return;
            }
        }

        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            phone: phone,
                        },
                    },
                });
                if (error) throw error;
                alert('¡Registro exitoso! Revisa tu correo.');
                setIsLogin(true);
            }
        } catch (err: any) {
            setError(err.message || 'Error de autenticación.');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError(null);
        setAcceptedPrivacy(false);
        setRememberMe(false);
        setShowPassword(false);
    };

    return (
        <div className="min-h-screen bg-brand-light dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-colors duration-300">
            <div className="w-full max-w-sm">
                <div className="text-center mb-10">
                    <div className="bg-brand-green w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.5 10.5H15.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M14 9V12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M11 6.5C11 6.5 13.5 6.5 14.5 6.5C16.9853 6.5 18 8.01472 18 10C18 11.9853 16.9853 13.5 14.5 13.5H9.5V6.5H11Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M13 13.5L18 18.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-extrabold text-brand-dark dark:text-white uppercase tracking-tighter italic leading-none">Roberto Valero</h1>
                    <p className="text-brand-green text-[10px] font-bold tracking-[0.3em] mt-2 uppercase opacity-80">Farmacia y Laboratorio</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 border border-white dark:border-slate-800 transition-colors">
                    <h2 className="text-2xl font-bold text-brand-dark dark:text-white mb-6">
                        {isLogin ? 'Inicia Sesión' : 'Crea tu cuenta'}
                    </h2>

                    <form onSubmit={handleAuth} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-[11px] font-bold border border-red-100 dark:border-red-900/50 leading-tight">
                                {error}
                            </div>
                        )}

                        {!isLogin && (
                            <>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase ml-1 tracking-wider">Nombre Completo</label>
                                    <input 
                                        type="text" 
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 text-gray-900 dark:text-white transition-all text-sm"
                                        placeholder="Tu nombre"
                                        required={!isLogin}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase ml-1 tracking-wider">Teléfono</label>
                                    <input 
                                        type="tel" 
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 text-gray-900 dark:text-white transition-all text-sm"
                                        placeholder="Ej: 600000000"
                                        required={!isLogin}
                                    />
                                </div>
                            </>
                        )}

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase ml-1 tracking-wider">Email</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 text-gray-900 dark:text-white transition-all text-sm"
                                placeholder="tu@correo.com"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase ml-1 tracking-wider">Contraseña</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 text-gray-900 dark:text-white transition-all text-sm pr-12"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-green transition-colors p-1"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {isLogin ? (
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center">
                                    <input
                                        id="remember"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 dark:border-slate-700 text-brand-green focus:ring-brand-green cursor-pointer"
                                    />
                                    <label htmlFor="remember" className="ml-2 text-[12px] text-gray-500 dark:text-slate-400 cursor-pointer select-none">
                                        Recordarme
                                    </label>
                                </div>
                                <a href="/#/faq" className="text-[10px] font-bold text-brand-green hover:underline">¿Olvidaste tu contraseña?</a>
                            </div>
                        ) : (
                            <div className="flex items-start mt-2 px-1">
                                <div className="flex items-center h-5">
                                    <input
                                        id="privacy"
                                        type="checkbox"
                                        checked={acceptedPrivacy}
                                        onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 dark:border-slate-700 text-brand-green focus:ring-brand-green cursor-pointer"
                                        required
                                    />
                                </div>
                                <div className="ml-3 text-[11px] leading-tight">
                                    <label htmlFor="privacy" className="text-gray-500 dark:text-slate-400">
                                        He leído y acepto la <a href="/#/legal" className="text-brand-green font-bold hover:underline">política de privacidad</a>.
                                    </label>
                                </div>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-4 bg-brand-green text-white rounded-2xl font-bold shadow-xl shadow-brand-green/20 hover:bg-opacity-90 active:scale-[0.98] transition-all disabled:bg-gray-300 flex items-center justify-center mt-4"
                        >
                            {loading ? (
                                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                            ) : (
                                isLogin ? 'ENTRAR' : 'REGISTRARME'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-400 dark:text-slate-500">
                            {isLogin ? '¿Eres nuevo por aquí?' : '¿Ya tienes una cuenta?'}
                            <button 
                                onClick={toggleMode}
                                className="ml-1 text-brand-green font-extrabold hover:underline"
                            >
                                {isLogin ? 'Crea una cuenta' : 'Inicia sesión'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
