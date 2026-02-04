import React, { useState } from 'react';

const faqData = [
    {
        question: '¿Qué es una fórmula magistral?',
        answer: 'Es un medicamento destinado a un paciente individualizado, preparado por el farmacéutico, o bajo su dirección, para cumplimentar expresamente una prescripción facultativa detallada de las sustancias medicinales que incluye, según las normas técnicas y científicas del arte farmacéutico, dispensado en su farmacia o servicio farmacéutico y con la debida información al usuario.'
    },
    {
        question: '¿Qué necesito para que me preparen una fórmula magistral?',
        answer: 'La receta médica es imprescindible para poder elaborar y dispensar cualquier fórmula magistral, ya que se trata de un medicamento.'
    },
    {
        question: '¿Puedo devolver una fórmula magistral?',
        answer: 'No, las fórmulas magistrales al ser medicamentos individualizados para un paciente en concreto no se pueden devolver.'
    },
    {
        question: '¿Hacéis envíos de fórmulas magistrales?',
        answer: 'Sí, hacemos envíos a toda España y Portugal.'
    },
    {
        question: '¿Cuánto tiempo tardan en hacer la fórmula?',
        answer: 'El tiempo de elaboración de la fórmula es de 24h a 48h desde que se recibe el pedido, según la complejidad de ésta.'
    },
    {
        question: '¿Cuánto tardan los envíos?',
        answer: 'El tiempo de entrega es de 24h-48h desde la recogida del pedido por parte de la empresa de transporte.'
    },
    {
        question: '¿Cuáles son los gastos de envío?',
        answer: 'Los gastos de envío son de 5€ para Península y Baleares.'
    },
    {
        question: '¿Qué métodos de pago aceptan?',
        answer: 'Aceptamos pagos con tarjeta de crédito/débito y Bizum.'
    }
];

interface AccordionItemProps {
    item: { question: string; answer: string };
    isOpen: boolean;
    onClick: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ item, isOpen, onClick }) => {
    return (
        <div className="border-b border-gray-200">
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center text-left py-4 px-2 focus:outline-none focus-visible:ring focus-visible:ring-brand-green focus-visible:ring-opacity-75"
                aria-expanded={isOpen}
            >
                <span className="font-semibold text-brand-dark">{item.question}</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 text-gray-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}
            >
                <div className="p-4 pt-0 text-gray-600 text-sm">
                    {item.answer}
                </div>
            </div>
        </div>
    );
};

const FAQPage: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const handleItemClick = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="p-4 bg-brand-light min-h-full">
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="space-y-2">
                    {faqData.map((item, index) => (
                        <AccordionItem
                            key={index}
                            item={item}
                            isOpen={openIndex === index}
                            onClick={() => handleItemClick(index)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
