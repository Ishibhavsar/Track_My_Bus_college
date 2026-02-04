import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/BusTrackingView.css';

// Fix for default marker icons in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import markerRetina from 'leaflet/dist/images/marker-icon-2x.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconRetinaUrl: markerRetina,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons
const busIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
});

const studentIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1995/1995531.png', // Or a blue dot
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

// Component to recenter map when positions change
const RecenterMap = ({ positions }) => {
    const map = useMap();
    React.useEffect(() => {
        if (positions.length > 0) {
            const bounds = L.latLngBounds(positions);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [positions, map]);
    return null;
};

const BusTrackingView = ({
    bus,
    busLocation,
    studentLocation,
    lastUpdated,
    isLoading,
    onBack
}) => {
    // Calculate distance between two coordinates in kilometers
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
        if (!lat1 || !lng1 || !lat2 || !lng2) return 0;
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Calculate ETA based on distance (assuming average speed of 25 km/h in city)
    const calculateETA = (distanceKm) => {
        const avgSpeedKmH = 25;
        const timeHours = distanceKm / avgSpeedKmH;
        const timeMinutes = Math.round(timeHours * 60);
        return timeMinutes;
    };

    // Calculate distance to student
    const distanceToStudent = useMemo(() => {
        if (busLocation && studentLocation) {
            return calculateDistance(
                busLocation.lat, busLocation.lng,
                studentLocation.lat, studentLocation.lng
            );
        }
        return null;
    }, [busLocation, studentLocation]);

    // Generate stops with real-time status based on bus location
    const stops = useMemo(() => {
        if (!bus?.route) return [];

        const hasWaypoints = bus.route.waypoints && bus.route.waypoints.length > 0;

        if (hasWaypoints && busLocation) {
            const sortedWaypoints = [...bus.route.waypoints].sort((a, b) => (a.order || 0) - (b.order || 0));

            // Find the nearest stop to current bus location
            let nearestStopIndex = 0;
            let minDistance = Infinity;

            sortedWaypoints.forEach((wp, index) => {
                if (wp.latitude && wp.longitude) {
                    const dist = calculateDistance(
                        busLocation.lat, busLocation.lng,
                        wp.latitude, wp.longitude
                    );
                    if (dist < minDistance) {
                        minDistance = dist;
                        nearestStopIndex = index;
                    }
                }
            });

            const now = new Date();

            return sortedWaypoints.map((wp, index) => {
                let status = 'upcoming';
                let etaMinutes = 0;
                let cumulativeDistance = 0;

                // Mark as green if passed or current
                if (index < nearestStopIndex) {
                    status = 'passed';
                } else if (index === nearestStopIndex) {
                    // If we are within 200m of the stop, consider it "current"
                    if (minDistance < 0.2) {
                        status = 'current';
                    } else {
                        status = 'upcoming';
                    }
                } else {
                    status = 'upcoming';
                    for (let i = nearestStopIndex; i < index; i++) {
                        const fromWp = sortedWaypoints[i];
                        const toWp = sortedWaypoints[i + 1];
                        if (fromWp?.latitude && fromWp?.longitude && toWp?.latitude && toWp?.longitude) {
                            cumulativeDistance += calculateDistance(
                                fromWp.latitude, fromWp.longitude,
                                toWp.latitude, toWp.longitude
                            );
                        }
                    }
                    etaMinutes = calculateETA(cumulativeDistance);
                }

                const etaTime = new Date(now.getTime() + etaMinutes * 60 * 1000);
                const timeString = etaTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });

                return {
                    name: wp.name || `Stop ${index + 1}`,
                    time: status === 'passed' ? 'Reached' : timeString,
                    status,
                    isStart: index === 0,
                    isEnd: index === sortedWaypoints.length - 1,
                    etaMinutes,
                    distance: cumulativeDistance
                };
            });
        }

        // Fallback for routes without waypoints
        const routeDetails = bus.route.routeDetails || '';
        const stopNames = routeDetails.split(/→|->|➔|➜/).map(s => s.trim()).filter(Boolean);

        if (stopNames.length === 0) return [];

        const now = new Date();
        const departureTime = bus?.departureTime || '08:00';
        const [hours, minutes] = departureTime.split(':').map(Number);
        const baseTime = new Date();
        baseTime.setHours(hours || 8, minutes || 0, 0, 0);

        const minutesPerStop = 7;
        const elapsedMinutes = (now - baseTime) / (1000 * 60);
        const currentStopIndex = busLocation ? Math.max(0, Math.min(stopNames.length - 1, Math.floor(elapsedMinutes / minutesPerStop))) : 0;

        return stopNames.map((name, index) => {
            const stopTime = new Date(baseTime.getTime() + (index * minutesPerStop * 60 * 1000));
            let status = 'upcoming';
            if (busLocation) {
                if (index < currentStopIndex) status = 'passed';
                else if (index === currentStopIndex) status = 'current';
            }

            return {
                name,
                time: status === 'passed' ? 'Reached' : stopTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                status,
                isStart: index === 0,
                isEnd: index === stopNames.length - 1
            };
        });
    }, [bus, busLocation]);

    const lastStopReached = stops.filter(s => s.status === 'passed').slice(-1)[0];
    const nextStop = stops.find(s => s.status === 'upcoming' || s.status === 'current');

    const handleCallDriver = () => {
        if (bus?.driver?.phone) window.location.href = `tel:${bus.driver.phone}`;
    };

    if (isLoading) {
        return (
            <div className="bus-tracking-view">
                <div className="tracking-header">
                    <div className="tracking-header-left">
                        <button className="back-button" onClick={onBack}>←</button>
                        <div className="tracking-header-info">
                            <h2>{bus?.busNumber || 'Loading...'}</h2>
                            <p>{bus?.route?.name || ''}</p>
                        </div>
                    </div>
                </div>
                <div className="tracking-loading">
                    <div className="tracking-loading-spinner"></div>
                    <p>Connecting to bus...</p>
                </div>
            </div>
        );
    }

    if (!busLocation) {
        return (
            <div className="bus-tracking-view">
                <div className="tracking-header">
                    <div className="tracking-header-left">
                        <button className="back-button" onClick={onBack}>←</button>
                        <div className="tracking-header-info">
                            <h2>{bus?.busNumber}</h2>
                            <p>{bus?.route?.name}</p>
                        </div>
                    </div>
                </div>
                <div className="no-location">
                    <div className="no-location-icon">📍</div>
                    <h3>Bus not sharing location</h3>
                    <p>Wait for driver to start sharing their location</p>
                </div>
            </div>
        );
    }

    const mapPositions = [
        [busLocation.lat, busLocation.lng]
    ];
    if (studentLocation) {
        mapPositions.push([studentLocation.lat, studentLocation.lng]);
    }

    return (
        <div className="bus-tracking-view">
            <div className="tracking-header">
                <div className="tracking-header-left">
                    <button className="back-button" onClick={onBack}>←</button>
                    <div className="tracking-header-info">
                        <h2>{bus?.busNumber}</h2>
                        <p>{bus?.route?.name}</p>
                    </div>
                </div>
                <div className="live-badge">
                    <span className="live-dot"></span>
                    LIVE
                </div>
            </div>

            <div className="tracking-map-container">
                <MapContainer
                    center={[busLocation.lat, busLocation.lng]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[busLocation.lat, busLocation.lng]} icon={busIcon}>
                        <Popup>
                            <strong>Bus: {bus?.busNumber}</strong><br />
                            Driver: {bus?.driver?.name || 'Assigned'}
                        </Popup>
                    </Marker>

                    {studentLocation && (
                        <>
                            <Marker position={[studentLocation.lat, studentLocation.lng]} icon={studentIcon}>
                                <Popup>You are here</Popup>
                            </Marker>
                            <Polyline
                                positions={[
                                    [busLocation.lat, busLocation.lng],
                                    [studentLocation.lat, studentLocation.lng]
                                ]}
                                color="#3b82f6"
                                dashArray="5, 10"
                                weight={2}
                            />
                        </>
                    )}
                    <RecenterMap positions={mapPositions} />
                </MapContainer>

                <div className="map-update-badge">
                    Updated {lastUpdated?.toLocaleTimeString()}
                </div>

                {distanceToStudent !== null && (
                    <div className="distance-floating-badge">
                        {distanceToStudent < 1
                            ? `${Math.round(distanceToStudent * 1000)}m away from you`
                            : `${distanceToStudent.toFixed(1)} km away from you`
                        }
                    </div>
                )}
            </div>

            <div className="eta-card">
                <div className="eta-info-main">
                    <h3>{nextStop ? `Next: ${nextStop.name}` : 'Route Completed'}</h3>
                    <p className="eta-subtext">
                        {lastStopReached ? `Passed ${lastStopReached.name}` : 'Started route'}
                    </p>
                </div>
                <span className="eta-badge">On Time</span>
            </div>

            <div className="bus-info-card">
                <div className="bus-info-left">
                    <span className="bus-plate">{bus?.busNumber}</span>
                    <div>
                        <div className="bus-name">{bus?.driver?.name || 'Driver'}</div>
                        <div className="bus-type">Contact available</div>
                    </div>
                </div>
                {bus?.driver?.phone && (
                    <button className="call-button" onClick={handleCallDriver}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                        </svg>
                    </button>
                )}
            </div>

            <div className="timeline-section">
                <div className="timeline-header">
                    Route Progress • {stops.filter(s => s.status === 'passed').length}/{stops.length} completed
                </div>
                <div className="stops-timeline">
                    {stops.map((stop, index) => (
                        <div key={index} className={`timeline-stop ${stop.status}`}>
                            <div className="stop-circle"></div>
                            <div className="stop-content">
                                <div className="stop-info">
                                    <div className="stop-name">{stop.name}</div>
                                    <div className="stop-badges-row">
                                        {stop.isStart && <span className="stop-badge starting">Start</span>}
                                        {stop.status === 'current' && <span className="stop-badge boarding">Current Location</span>}
                                        {stop.isEnd && <span className="stop-badge destination">End</span>}
                                        {stop.etaMinutes > 0 && stop.status === 'upcoming' && (
                                            <span className="stop-eta-mins">~{stop.etaMinutes} min</span>
                                        )}
                                    </div>
                                </div>
                                <div className="stop-time">{stop.time}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BusTrackingView;
