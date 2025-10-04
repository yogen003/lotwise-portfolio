import React, { useState, useEffect } from 'react';
import { getPositions } from '../services/api';

const PositionsPage = () => {
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getPositions() // GET /positions
            .then(response => {
                setPositions(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching positions:', error);
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-10 pb-20">
            
            <header className="mb-10 w-full max-w-4xl text-center">
                <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight mb-2">
                    Portfolio Summary
                </h1>
                <p className="text-xl text-indigo-600 font-medium">
                    Open Positions & Average Cost
                </p>
            </header>

            <main className="w-full max-w-3xl px-4">
                {loading ? (
                    <div className="flex items-center justify-center p-6 bg-white rounded-lg shadow-md">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-lg text-gray-600">Loading open positions...</p>
                    </div>
                ) : (
                    <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Symbol
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Quantity
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Average Cost
                                    </th>
                                </tr>
                            </thead>
                            
                            <tbody className="bg-white divide-y divide-gray-100">
                                {positions.length > 0 ? (
                                    positions.map((p, index) => (
                                        <tr 
                                            key={p.symbol} 
                                            className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100 transition duration-150'}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {p.symbol}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                                                {p.quantity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-green-700">
                                                {`$${p.avg_cost}`} 
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-12 text-center text-gray-500 italic">
                                             You currently have no open positions. Time to trade!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PositionsPage;