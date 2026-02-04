import React from 'react';
import { useParams, Link } from 'react-router-dom';

const OrderTrackingPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();

    // Mock data for the timeline. In a real app, this would be fetched.
    const timelineSteps = [
        { name: 'Pedido Realizado', date: '2024-07-28 10:30 AM', completed: true },
        { name: 'En preparación', date: '2024-07-28 11:00 AM', completed: true },
        { name: 'Listo para recoger/enviado', date: '2024-07-28 05:00 PM', completed: true },
        { name: 'Entregado', date: '2024-07-29 01:15 PM', completed: true },
    ];

    return (
        <div className="p-6 bg-brand-light min-h-full">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-brand-dark mb-2">Seguimiento del Pedido</h2>
                    <p className="text-sm text-gray-500 mb-6">ID: {orderId}</p>
                </div>
                
                <div className="relative pl-8">
                    {/* Vertical line */}
                    <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-green-200" aria-hidden="true"></div>

                    <div className="space-y-8">
                        {timelineSteps.map((step, index) => (
                            <div key={index} className="flex items-start relative">
                                <div className={`z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${step.completed ? 'bg-brand-green' : 'bg-gray-300'}`}>
                                    {step.completed ? (
                                        <svg className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <div className="w-3 h-3 bg-white rounded-full"></div>
                                    )}
                                </div>
                                <div className="ml-4">
                                    <p className={`font-semibold ${step.completed ? 'text-brand-dark' : 'text-gray-500'}`}>{step.name}</p>
                                    <p className="text-sm text-gray-500">{step.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                 <div className="mt-8 text-center">
                    <Link to="/orders" className="text-brand-green font-semibold hover:underline text-sm">
                        &larr; Volver a Mis Pedidos
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderTrackingPage;
