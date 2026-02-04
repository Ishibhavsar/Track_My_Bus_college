import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { busAPI } from '../utils/api';
import BusTracker from '../components/student/BusTracker';

const StudentPage = () => {
    const { user, logout } = useAuth();
    const [buses, setBuses] = useState([]);
    const [selectedBus, setSelectedBus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('buses');
    const [showBusModal, setShowBusModal] = useState(false);

    const tabs = [
        { id: 'buses', label: 'Buses', icon: '🚌' },
        { id: 'track', label: 'Track', icon: '📍' },
    ];

    useEffect(() => {
        fetchBuses();
    }, []);

    const fetchBuses = async () => {
        setLoading(true);
        try {
            const response = await busAPI.getBusesForToday();
            if (response.data.success) {
                setBuses(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching buses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBusSelect = (bus) => {
        setSelectedBus(bus);
        setShowBusModal(true);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Mobile App Bar - Material Design Style */}
            <header className="bg-blue-600 text-white px-4 py-3 shadow-lg sticky top-0 z-50">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🚌</span>
                        <div>
                            <h1 className="text-lg font-bold leading-tight">Track My Bus</h1>
                            <p className="text-xs text-blue-200">Welcome, {user?.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="bg-white/20 hover:bg-white/30 active:bg-white/40 px-4 py-2 rounded-full text-sm font-medium transition-all touch-manipulation"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content Area - Scrollable */}
            <main className="flex-1 overflow-y-auto pb-20">
                {/* Buses Tab Content */}
                {activeTab === 'buses' && (
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Available Buses</h2>
                            <button
                                onClick={fetchBuses}
                                className="text-blue-600 text-sm font-medium active:text-blue-800 touch-manipulation"
                            >
                                Refresh
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-600">Loading buses...</p>
                            </div>
                        ) : buses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <span className="text-5xl mb-4">🚌</span>
                                <p className="text-gray-600 font-medium">No buses available today</p>
                                <p className="text-gray-400 text-sm mt-1">Pull down to refresh</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {buses.map((bus) => (
                                    <div
                                        key={bus._id}
                                        onClick={() => handleBusSelect(bus)}
                                        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:bg-gray-50 transition-all touch-manipulation cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                                    <span className="text-2xl">🚌</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900">{bus.busNumber}</h3>
                                                    <p className="text-sm text-gray-500">{bus.route?.name || 'Route N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {bus.currentLocation ? (
                                                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                        Live
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-xs font-medium">
                                                        Offline
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
                                            <div>
                                                <p className="text-xs text-gray-400">Departure</p>
                                                <p className="text-sm font-medium text-gray-700">⏰ {bus.departureTime}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400">Driver</p>
                                                <p className="text-sm font-medium text-gray-700">👤 {bus.driver?.name || 'Assigned'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Track Tab Content */}
                {activeTab === 'track' && (
                    <div className="h-full">
                        <BusTracker buses={buses} />
                    </div>
                )}
            </main>

            {/* Bottom Navigation - Android Style */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
                <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col items-center justify-center flex-1 h-full py-2 transition-all touch-manipulation ${activeTab === tab.id
                                    ? 'text-blue-600'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <span className={`text-2xl mb-1 transition-transform ${activeTab === tab.id ? 'scale-110' : ''}`}>
                                {tab.icon}
                            </span>
                            <span className={`text-xs font-medium ${activeTab === tab.id ? 'font-bold' : ''}`}>
                                {tab.label}
                            </span>
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 w-12 h-1 bg-blue-600 rounded-t-full"></div>
                            )}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Bus Details Modal - Bottom Sheet Style */}
            {showBusModal && selectedBus && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
                    onClick={() => setShowBusModal(false)}
                >
                    <div
                        className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-8 animate-slide-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Handle Bar */}
                        <div className="flex justify-center mb-4">
                            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                                <span className="text-3xl">🚌</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{selectedBus.busNumber}</h3>
                                <p className="text-gray-500">{selectedBus.route?.name || 'Route N/A'}</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <span className="text-xl">👤</span>
                                <div>
                                    <p className="text-xs text-gray-400">Driver</p>
                                    <p className="font-medium">{selectedBus.driver?.name || 'Not Assigned'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <span className="text-xl">📞</span>
                                <div>
                                    <p className="text-xs text-gray-400">Contact</p>
                                    <p className="font-medium">{selectedBus.driver?.phone || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <span className="text-xl">⏰</span>
                                <div>
                                    <p className="text-xs text-gray-400">Departure Time</p>
                                    <p className="font-medium">{selectedBus.departureTime}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <span className="text-xl">🪑</span>
                                <div>
                                    <p className="text-xs text-gray-400">Capacity</p>
                                    <p className="font-medium">{selectedBus.capacity} seats</p>
                                </div>
                            </div>
                            <div className={`flex items-center gap-3 p-3 rounded-xl ${selectedBus.currentLocation ? 'bg-green-50' : 'bg-gray-50'}`}>
                                <span className="text-xl">{selectedBus.currentLocation ? '🟢' : '⚪'}</span>
                                <div>
                                    <p className="text-xs text-gray-400">Tracking Status</p>
                                    <p className={`font-medium ${selectedBus.currentLocation ? 'text-green-700' : 'text-gray-500'}`}>
                                        {selectedBus.currentLocation ? 'Live tracking available' : 'Currently offline'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowBusModal(false);
                                    setActiveTab('track');
                                }}
                                className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg active:bg-blue-700 transition-all touch-manipulation"
                            >
                                Track Bus
                            </button>
                            <button
                                onClick={() => setShowBusModal(false)}
                                className="px-6 py-4 bg-gray-100 text-gray-700 rounded-2xl font-medium active:bg-gray-200 transition-all touch-manipulation"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

export default StudentPage;
