import React, { useState, useEffect, useRef } from 'react';
import BusTrackingView from './BusTrackingView';
import { io } from 'socket.io-client';

const BusTracker = ({ buses }) => {
    const [selectedBus, setSelectedBus] = useState(null);
    const [busLocation, setBusLocation] = useState(null);
    const [studentLocation, setStudentLocation] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const socketRef = useRef(null);

    useEffect(() => {
        const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        socketRef.current = io(socketUrl);

        socketRef.current.on('connect', () => {
            console.log('Connected to socket server');
        });

        socketRef.current.on('location-update', (data) => {
            if (selectedBus && data.busId === selectedBus._id) {
                setBusLocation({
                    lat: data.location.latitude,
                    lng: data.location.longitude,
                });
                setLastUpdated(new Date());
            }
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [selectedBus]);

    useEffect(() => {
        if (!navigator.geolocation) return;

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setStudentLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            (error) => console.error('Error tracking student location:', error),
            { enableHighAccuracy: true }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    useEffect(() => {
        if (!selectedBus) {
            setBusLocation(null);
            return;
        }

        // Join the room for the specific bus
        if (socketRef.current) {
            socketRef.current.emit('join-bus', selectedBus._id);
        }

        const fetchLocation = async () => {
            try {
                const token = localStorage.getItem('token');
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

                const response = await fetch(`${apiUrl}/bus/${selectedBus._id}/location`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.data && data.data.latitude && data.data.longitude) {
                        setBusLocation({
                            lat: data.data.latitude,
                            lng: data.data.longitude,
                        });
                        setLastUpdated(new Date());
                    }
                } else {
                    if (selectedBus.currentLocation) {
                        setBusLocation({
                            lat: selectedBus.currentLocation.latitude || selectedBus.currentLocation.lat,
                            lng: selectedBus.currentLocation.longitude || selectedBus.currentLocation.lng,
                        });
                        setLastUpdated(new Date());
                    }
                }
            } catch (error) {
                console.error('Error fetching initial bus location:', error);
                if (selectedBus.currentLocation) {
                    setBusLocation({
                        lat: selectedBus.currentLocation.latitude || selectedBus.currentLocation.lat,
                        lng: selectedBus.currentLocation.longitude || selectedBus.currentLocation.lng,
                    });
                }
            }
        };

        setIsLoading(true);
        fetchLocation().finally(() => setIsLoading(false));
    }, [selectedBus]);

    const getMapUrl = (lat, lng) => {
        return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`;
    };

    const openInMaps = (lat, lng) => {
        window.open(`https://www.google.com/maps?q=${lat},${lng}&z=15`, '_blank');
    };

    if (buses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-5xl mb-4">🗺️</span>
                <p className="text-gray-600 font-medium">No buses to track</p>
                <p className="text-gray-400 text-sm mt-1">Buses will appear here when available</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Bus Selector - Horizontal Scroll on Mobile */}
            {!selectedBus && (
                <div className="p-4">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Select a Bus to Track</h2>
                    <div className="space-y-3">
                        {buses.map((bus) => (
                            <div
                                key={bus._id}
                                onClick={() => setSelectedBus(bus)}
                                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:bg-gray-50 transition-all touch-manipulation cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                            <span className="text-2xl">🚌</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{bus.busNumber}</h3>
                                            <p className="text-sm text-gray-500">{bus.route?.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {bus.currentLocation ? (
                                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                Live
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-medium">
                                                Offline
                                            </span>
                                        )}
                                        <span className="text-gray-400">→</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* RedBus-Style Tracking View */}
            {selectedBus && (
                <BusTrackingView
                    bus={selectedBus}
                    busLocation={busLocation}
                    studentLocation={studentLocation}
                    lastUpdated={lastUpdated}
                    isLoading={isLoading}
                    onBack={() => setSelectedBus(null)}
                />
            )}
        </div>
    );
};

export default BusTracker;
