// src/components/student/BusDetails.jsx
import React from 'react';

const BusDetails = ({ bus, onClose }) => {
    if (!bus) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold">🚌 Bus Details</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Bus Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-3 rounded">
                            <p className="text-sm text-gray-600">Bus Number</p>
                            <p className="text-xl font-bold text-blue-600">{bus.busNumber}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded">
                            <p className="text-sm text-gray-600">Departure</p>
                            <p className="text-xl font-bold text-green-600">{bus.departureTime}</p>
                        </div>
                    </div>

                    {/* Route Info */}
                    <div className="bg-gray-50 p-4 rounded">
                        <h4 className="font-semibold mb-2">📍 Route Information</h4>
                        <p className="text-gray-700 mb-1">
                            <strong>Route:</strong> {bus.route?.name || 'N/A'}
                        </p>
                        <p className="text-gray-700 mb-1">
                            <strong>Starting Point:</strong> {bus.route?.startingPoint || 'N/A'}
                        </p>
                        <div className="mt-2">
                            <strong className="text-gray-700">Stops:</strong>
                            <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                                {bus.route?.routeDetails || 'No stops information available'}
                            </p>
                        </div>
                    </div>

                    {/* Driver Info */}
                    <div className="bg-gray-50 p-4 rounded">
                        <h4 className="font-semibold mb-2">👤 Driver Information</h4>
                        <p className="text-gray-700 mb-1">
                            <strong>Name:</strong> {bus.driver?.name || 'N/A'}
                        </p>
                        <p className="text-gray-700">
                            <strong>Phone:</strong>{' '}
                            <a
                                href={`tel:${bus.driver?.phone}`}
                                className="text-blue-600 hover:underline"
                            >
                                {bus.driver?.phone || 'N/A'}
                            </a>
                        </p>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-6 bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default BusDetails;
