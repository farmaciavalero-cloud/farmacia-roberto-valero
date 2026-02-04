
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

interface ServiceContent {
    title: string;
    imageUrl: string;
    description: string;
    details: string[];
    cta: {
        text: string;
        link: string;
        action?: 'appointment' | 'order';
        serviceId?: string;
    }
}

const serviceData: { [key: string]: ServiceContent } = {
    dermofarmacia: {
        title: "Dermo Análisis",
        imageUrl: "https://picsum.photos/seed/pharmacy-lab-glassware/800/400?grayscale",
        description: "No te vendemos una crema, fabricamos tu crema.",
        details: [
            "Nadie tiene el ciclo completo (diagnóstico + asesoramiento + producto personalizado) bajo el mismo techo.",
            "Solo nosotros tenemos tu fórmula.",
            "Análisis facial y capilar con tecnología avanzada.",
            "Elaboración propia en laboratorio."
        ],
        cta: {
            text: "Pedir Cita para Análisis",
            link: "/appointments",
            action: 'appointment',
            serviceId: 'dermofarmacia-facial'
        }
    },
    veterinaria: {
        title: "Cuidado Veterinario",
        imageUrl: "https://picsum.photos/seed/dog/800/400?grayscale",
        description: "La salud de tu mascota es nuestra prioridad. Disponemos de una amplia gama de productos veterinarios.",
        details: [
            "Medicamentos con y sin receta para animales.",
            "Productos de higiene y cuidado: champús, antiparasitarios, etc.",
            "Alimentación especializada para diferentes necesidades y patologías.",
            "Asesoramiento farmacéutico para el cuidado de tu mascota."
        ],
        cta: {
            text: "Realizar un Pedido",
            link: "/orders",
            action: 'order'
        }
    },
    spd: {
        title: "Sistemas Personalizados de Dosificación (SPD)",
        imageUrl: "https://picsum.photos/seed/caringhands/800/400?grayscale",
        description: "Seguimiento y sistemas personalizados de dosificación para mejorar la adherencia al tratamiento.",
        details: [
            "Servicio ideal para pacientes polimedicados, personas mayores o con dificultades.",
            "Blísteres semanales, sellados y etiquetados de forma segura.",
            "Reducción de errores en la toma de medicación.",
            "Mejora la eficacia de los tratamientos y aporta tranquilidad."
        ],
        cta: {
            text: "Pedir Cita SPD",
            link: "/appointments",
            action: 'appointment',
            serviceId: 'spd'
        }
    },
    cosmetica: {
        title: "Elaboramos cosmética a tu medida",
        imageUrl: "https://picsum.photos/seed/mortar/800/400?grayscale",
        description: "Creamos productos cosméticos personalizados adaptados a las necesidades específicas de tu piel.",
        details: [
            "Fórmulas únicas basadas en tu tipo de piel y necesidades.",
            "Selección de principios activos de alta calidad.",
            "Texturas y aromas personalizados.",
            "Asesoramiento dermocosmético integral."
        ],
        cta: {
            text: "Pedir Cita Cosmética",
            link: "/appointments",
            action: 'appointment',
            serviceId: 'cosmetica'
        }
    },
    analisis: {
        title: "Análisis Bioquímicos",
        imageUrl: "https://picsum.photos/seed/pharmacy-analysis-lab/800/400?grayscale",
        description: "Química Clínica: Análisis de sangre rápido, completo y fiable.",
        details: [
            "Perfiles: Lipid Test 5 (GLU, CHOL, TG, HDL, LDL), Wellness Test 9 (AST, ALT, GGT, TBIL, GLU, CHOL, AMY, CREA, BUN).",
            "Biochemistry Test 9 (AST, ALT, GGT, GLU, CREA, CHOL, TG, HDL, LDL) y Hemoglobina Glicosilada (HbA1c).",
            "Parámetros analíticos: ALB, ALP, ALT, AST, AMY, CREA, GGT, GLU, HDL, LDL, CHOL, TG, TP, BUN, TBIL, DBIL.",
            "Control de función hepática, renal, pancreática y riesgo cardiovascular."
        ],
        cta: {
            text: "Pedir Cita Análisis",
            link: "/appointments",
            action: 'appointment',
            serviceId: 'analisis'
        }
    },
     fitoterapia: {
        title: "Asesoramiento en Fitoterapia",
        imageUrl: "https://picsum.photos/seed/leaves/800/400?grayscale",
        description: "Descubre el poder de las plantas medicinales para mejorar tu salud y bienestar de forma natural.",
        details: [
            "Asesoramiento personalizado sobre plantas medicinales.",
            "Soluciones naturales para el sueño, digestión, estrés y más.",
            "Combinación segura con tu medicación habitual.",
            "Productos de fitoterapia de alta calidad y eficacia garantizada."
        ],
        cta: {
            text: "Pedir Cita Fitoterapia",
            link: "/appointments",
            action: 'appointment',
            serviceId: 'fitoterapia'
        }
    }
};

const ServicesPage: React.FC = () => {
    const { serviceId } = useParams<{ serviceId: string }>();
    const navigate = useNavigate();

    const content = serviceId ? serviceData[serviceId] : null;

    if (!content) {
        return <div className="p-6 text-center">
            <h2 className="text-xl font-bold text-brand-dark">Servicio no encontrado</h2>
            <Link to="/" className="text-brand-green mt-4 inline-block">Volver al inicio</Link>
        </div>;
    }

    const handleCtaClick = (e: React.MouseEvent) => {
        if (content.cta.action === 'appointment') {
            e.preventDefault();
            navigate('/appointments', { state: { service: content.cta.serviceId } });
        }
    };

    return (
        <div>
            <img src={content.imageUrl} alt={content.title} className="w-full h-48 object-cover filter grayscale"/>
            <div className="p-6">
                <h2 className="text-2xl font-bold text-brand-dark mb-2">{content.title}</h2>
                <p className="text-gray-600 mb-6">{content.description}</p>
                <div className="space-y-3 mb-8">
                    {content.details.map((detail, index) => (
                        <div key={index} className="flex items-start">
                             <svg className="h-5 w-5 text-brand-green mr-3 flex-shrink-0 mt-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p className="text-gray-700">{detail}</p>
                        </div>
                    ))}
                </div>
                
                {content.cta.action === 'appointment' ? (
                     <button 
                        onClick={handleCtaClick}
                        className="w-full block text-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-green hover:bg-opacity-90"
                    >
                        {content.cta.text}
                    </button>
                ) : (
                    <Link to={content.cta.link} className="w-full block text-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-green hover:bg-opacity-90">
                        {content.cta.text}
                    </Link>
                )}
            </div>
        </div>
    );
};

export default ServicesPage;
