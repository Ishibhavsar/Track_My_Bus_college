// src/components/student/StudentHome.jsx
import React from 'react';

const StudentHome = ({ buses, loading, onSelectBus }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Available Buses Today</h2>
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading buses...</span>
                </div>
            ) : buses.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-600 text-lg">No buses available today</p>
                    <p className="text-gray-400 text-sm mt-2">Check back later for updates</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {buses.map((bus) => (
                        <div
                            key={bus._id}
                            className="bg-gray-50 p-4 rounded-lg border hover:shadow-lg transition"
                        >
                            <h3 className="font-bold text-lg mb-2">🚌 {bus.busNumber}</h3>
                            <div className="space-y-1 text-gray-600">
                                <p>📍 Route: {bus.route?.name || 'N/A'}</p>
                                <p>⏰ Departure: {bus.departureTime || 'N/A'}</p>
                                <p>👤 Driver: {bus.driver?.name || 'N/A'}</p>
                                <p className="text-sm">
                                    Starting: {bus.route?.startingPoint || 'N/A'}
                                </p>
                            </div>
                            <button
                                onClick={() => onSelectBus(bus)}
                                className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                            >
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentHome;
