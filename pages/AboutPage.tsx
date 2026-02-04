
import React from 'react';

const AboutPage: React.FC = () => {
    return (
        <div className="p-6">
            <div className="text-center mb-6">
                <img 
                    src="https://picsum.photos/seed/pharmacyteam/800/400?grayscale" 
                    alt="Ilustración de la Farmacia Roberto Valero" 
                    className="w-full h-48 object-cover rounded-lg shadow-md mb-4 filter grayscale"
                />
                <h2 className="text-2xl font-bold text-brand-dark">Nuestra Filosofía</h2>
                <p className="text-gray-600 mt-1">Cuidado y profesionalidad a tu servicio</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-gray-700 space-y-4">
                <p>
                    Nuestro equipo está formado por profesionales farmacéuticos altamente cualificados y en constante formación. 
                    Nos dedicamos a ofrecer un servicio cercano y personalizado para cubrir todas tus necesidades de salud.
                </p>
                <p className="font-semibold text-brand-dark">
                    Liderado por Roberto Valero, farmacéutico con más de 20 años de experiencia y especialista en formulación magistral.
                </p>
                <p>
                    Contamos con expertos en dermofarmacia, nutrición y atención farmacéutica, comprometidos con tu bienestar integral. 
                    Tu confianza es nuestra mayor motivación.
                </p>
            </div>
        </div>
    );
};

export default AboutPage;
