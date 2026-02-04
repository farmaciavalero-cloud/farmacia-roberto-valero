import React from 'react';
import { LocationMarkerIcon } from '../components/Icons';

const ContactPage: React.FC = () => {
    const address = "Avenida Reina Victoria 13, 03600 Elda (Alicante)";
    const mapUrl = "https://www.google.com/maps/search/?api=1&query=FARMACIA%20ROBERTO%20VALERO%2C%20Avenida%20Reina%20Victoria%2013%2C%20Elda";
    const phoneNumber = "965386909";
    const whatsappNumber = "610755819";
    const email = "farmaciavalero@gmail.com";
    
    const PhoneIcon: React.FC = () => (
         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-green mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
    );

    const MailIcon: React.FC = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-green mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    );

    return (
        <div className="p-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold text-brand-dark mb-4">Información de Contacto</h2>
                <div className="space-y-4">
                    <div className="flex items-start">
                        <LocationMarkerIcon className="h-5 w-5 text-brand-green mr-3 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-semibold text-gray-800">Dirección</h3>
                            <p className="text-gray-600">{address}</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <PhoneIcon />
                        <div>
                            <h3 className="font-semibold text-gray-800">Teléfono / WhatsApp</h3>
                            <a href={`tel:${phoneNumber}`} className="text-gray-600 hover:text-brand-green block">Teléfono: {phoneNumber}</a>
                            <a href={`https://wa.me/34${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-brand-green block">Whatsapp: {whatsappNumber}</a>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <MailIcon />
                         <div>
                            <h3 className="font-semibold text-gray-800">Email</h3>
                            <a href={`mailto:${email}`} className="text-gray-600 hover:text-brand-green">{email}</a>
                        </div>
                    </div>
                </div>
                 <div className="mt-6">
                    <a 
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full block text-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-green hover:bg-opacity-90"
                    >
                        Cómo llegar
                    </a>
                </div>
            </div>
             <div className="mt-6">
                <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3121.785315443224!2d-0.7937176846611596!3d38.42171597964687!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd63c5a528e1c67d%3A0x6c6e75924d550b73!2sFARMACIA%20ROBERTO%20VALERO!5e0!3m2!1sen!2ses!4v1660000000000!5m2!1sen!2ses"
                    width="100%" 
                    height="250" 
                    style={{border:0}} 
                    allowFullScreen={false} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-lg shadow-md"
                    title="Ubicación de Farmacia Roberto Valero"
                ></iframe>
            </div>
        </div>
    );
};

export default ContactPage;