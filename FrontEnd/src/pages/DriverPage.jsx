import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { driverAPI, busAPI } from '../utils/api';

const DriverPage = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('status');
    const [assignedBus, setAssignedBus] = useState(null);
    const [isSharing, setIsSharing] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [locationError, setLocationError] = useState('');

    const watchIdRef = useRef(null);
    const intervalIdRef = useRef(null);

    const tabs = [
        { id: 'status', label: 'Status', icon: '🚌' },
        { id: 'route', label: 'Route', icon: '🗺️' },
    ];

    useEffect(() => {
        fetchAssignedBus();
    }, []);

    // Start/stop location tracking
    useEffect(() => {
        if (isSharing && assignedBus) {
            startLocationTracking();
        } else {
            stopLocationTracking();
        }

        return () => {
            stopLocationTracking();
        };
    }, [isSharing, assignedBus]);

    // Send location to server when it updates
    useEffect(() => {
        if (isSharing && currentLocation && assignedBus) {
            sendLocationToServer();
        }
    }, [currentLocation]);

    const startLocationTracking = async () => {
        try {
            // Check if geolocation is available
            if (!navigator.geolocation) {
                setLocationError('Geolocation is not supported by your browser');
                setIsSharing(false);
                return;
            }

            // Request permission and start watching
            watchIdRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    setCurrentLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    setLocationError('');
                },
                (error) => {
                    console.error('Location error:', error);
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            setLocationError('Location permission denied. Please allow location access.');
                            break;
                        case error.POSITION_UNAVAILABLE:
                            setLocationError('Location information unavailable');
                            break;
                        case error.TIMEOUT:
                            setLocationError('Location request timed out');
                            break;
                        default:
                            setLocationError('Unable to get location');
                    }
                    setIsSharing(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0
                }
            );

            // Set up interval to send location every 10 seconds
            intervalIdRef.current = setInterval(() => {
                if (currentLocation) {
                    sendLocationToServer();
                }
            }, 10000);

        } catch (error) {
            console.error('Tracking error:', error);
            setLocationError('Failed to start tracking: ' + error.message);
            setIsSharing(false);
        }
    };

    const stopLocationTracking = () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
        }
    };

    const sendLocationToServer = async () => {
        if (!currentLocation) return;

        try {
            await busAPI.updateLocation(currentLocation.lat, currentLocation.lng);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Failed to update location:', error);
        }
    };

    const fetchAssignedBus = async () => {
        setLoading(true);
        try {
            const response = await driverAPI.getAssignedBus();
            if (response.data.success) {
                setAssignedBus(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching assigned bus:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleLocationSharing = () => {
        if (!isSharing) {
            setLocationError('');
        }
        setIsSharing(!isSharing);
    };

    // Parse route stops from routeDetails
    const getRouteStops = () => {
        if (!assignedBus?.route?.routeDetails) return [];
        const stopNames = assignedBus.route.routeDetails.split('→').map(s => s.trim()).filter(Boolean);
        return stopNames.map((name, index) => ({ name, index }));
    };

    const routeStops = getRouteStops();

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Mobile App Bar */}
            <header className="bg-green-600 text-white px-4 py-3 shadow-lg sticky top-0 z-50">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🚌</span>
                        <div>
                            <h1 className="text-lg font-bold leading-tight">Driver Dashboard</h1>
                            <p className="text-xs text-green-200">Welcome, {user?.name}</p>
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

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pb-20">
                {/* Status Tab */}
                {activeTab === 'status' && (
                    <div className="p-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-600">Loading your assignment...</p>
                            </div>
                        ) : !assignedBus ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <span className="text-5xl mb-4">🚌</span>
                                <p className="text-gray-600 font-medium">No bus assigned</p>
                                <p className="text-gray-400 text-sm mt-1">Contact admin for assignment</p>
                            </div>
                        ) : (
                            <>
                                {/* Assigned Bus Card */}
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                                            <span className="text-3xl">🚌</span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-medium">Your Bus</p>
                                            <h2 className="text-2xl font-bold text-gray-900">{assignedBus.busNumber}</h2>
                                            <p className="text-gray-500">{assignedBus.route?.name || 'No route'}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gray-50 p-3 rounded-xl">
                                            <p className="text-xs text-gray-400">Departure</p>
                                            <p className="font-medium">⏰ {assignedBus.departureTime}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl">
                                            <p className="text-xs text-gray-400">Capacity</p>
                                            <p className="font-medium">🪑 {assignedBus.capacity} seats</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Location Sharing Control */}
                                <div className={`rounded-2xl p-5 shadow-sm border mb-4 transition-colors ${isSharing ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'
                                    }`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">Live Location</h3>
                                            <p className="text-sm text-gray-500">
                                                {isSharing ? 'Sharing location with students' : 'Location sharing is off'}
                                            </p>
                                        </div>
                                        <div className={`w-4 h-4 rounded-full ${isSharing ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                                    </div>

                                    {locationError && (
                                        <div className="bg-red-50 text-red-700 p-3 rounded-xl mb-4 text-sm">
                                            ⚠️ {locationError}
                                        </div>
                                    )}

                                    {isSharing && currentLocation && (
                                        <div className="bg-white rounded-xl p-3 mb-4 border border-green-200">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-xs text-gray-400">Current Coordinates</p>
                                                    <p className="font-mono text-sm">
                                                        {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                                                    </p>
                                                </div>
                                                {lastUpdate && (
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-400">Last sent</p>
                                                        <p className="text-xs text-green-600">{lastUpdate.toLocaleTimeString()}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={toggleLocationSharing}
                                        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all touch-manipulation ${isSharing
                                            ? 'bg-red-500 text-white active:bg-red-600'
                                            : 'bg-green-600 text-white active:bg-green-700'
                                            }`}
                                    >
                                        {isSharing ? '⏹ Stop Sharing' : '▶ Start Sharing Location'}
                                    </button>
                                </div>

                                {/* Quick Stats */}
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                    <h3 className="font-bold text-lg text-gray-900 mb-4">Today's Info</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <span className="text-xl">📍</span>
                                            <div>
                                                <p className="text-xs text-gray-400">Route</p>
                                                <p className="font-medium">{assignedBus.route?.name || 'Not assigned'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <span className="text-xl">🕐</span>
                                            <div>
                                                <p className="text-xs text-gray-400">Status</p>
                                                <p className={`font-medium ${isSharing ? 'text-green-600' : 'text-gray-500'}`}>
                                                    {isSharing ? '🟢 On Route' : '⚪ Not Started'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Route Tab */}
                {activeTab === 'route' && (
                    <div className="p-4">
                        {!assignedBus?.route ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <span className="text-5xl mb-4">🗺️</span>
                                <p className="text-gray-600 font-medium">No route assigned</p>
                                <p className="text-gray-400 text-sm mt-1">Route details will appear here</p>
                            </div>
                        ) : (
                            <>
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">{assignedBus.route.name}</h2>
                                    <p className="text-gray-500 mb-4">Starting from: {assignedBus.route.startingPoint}</p>

                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span>📍</span>
                                        <span>{routeStops.length} stops on this route</span>
                                    </div>
                                </div>

                                {routeStops.length > 0 && (
                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="font-bold text-lg text-gray-900">Your Route Progress</h3>
                                            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full uppercase tracking-wider">
                                                {routeStops.length} Stops
                                            </span>
                                        </div>

                                        <div className="relative pl-8">
                                            {/* Vertical Line */}
                                            <div className="absolute left-[7.5px] top-4 bottom-4 w-0.5 bg-gray-100"></div>

                                            <div className="space-y-8">
                                                {routeStops.map((stop, index) => {
                                                    const isFirst = index === 0;
                                                    const isLast = index === routeStops.length - 1;

                                                    // Simple heuristic: current stop is based on order since we don't have waypoint comparison here yet
                                                    // but we can at least show it beautifully
                                                    return (
                                                        <div key={index} className="relative">
                                                            {/* Marker Circle */}
                                                            <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-4 border-white z-10 shadow-sm ${isFirst ? 'bg-green-500 ring-4 ring-green-100' :
                                                                    isLast ? 'bg-red-500 ring-4 ring-red-100' :
                                                                        'bg-blue-500 ring-4 ring-blue-100'
                                                                }`}></div>

                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <p className={`font-bold text-gray-900 ${isFirst || isLast ? 'text-lg' : 'text-md'}`}>
                                                                        {stop.name}
                                                                    </p>
                                                                    {isFirst && <span className="text-xs font-bold text-green-600 uppercase tracking-tighter">Starting Point</span>}
                                                                    {isLast && <span className="text-xs font-bold text-red-600 uppercase tracking-tighter">Final Destination</span>}
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className="text-xs font-bold text-gray-400">Stop #{index + 1}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Route Details Raw */}
                                {assignedBus.route.routeDetails && routeStops.length === 0 && (
                                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                        <h3 className="font-bold text-lg text-gray-900 mb-4">Route Details</h3>
                                        <p className="text-gray-600 whitespace-pre-wrap">{assignedBus.route.routeDetails}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
                <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col items-center justify-center flex-1 h-full py-2 transition-all touch-manipulation ${activeTab === tab.id
                                ? 'text-green-600'
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
                                <div className="absolute bottom-0 w-12 h-1 bg-green-600 rounded-t-full"></div>
                            )}
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
};

export default DriverPage;
