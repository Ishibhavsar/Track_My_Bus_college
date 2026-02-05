import React, { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, PolylineF, InfoWindowF } from '@react-google-maps/api';
import '../../styles/BusTrackingView.css';

const containerStyle = {
    width: '100%',
    height: '100%'
};

const BusTrackingView = ({
    bus,
    busLocation,
    studentLocation,
    stopArrivals = [],
    lastUpdated,
    isLoading,
    onBack
}) => {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
    });

    const [map, setMap] = useState(null);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [mapError, setMapError] = useState(null);

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

    // Generate stops with status based on bus location
    const stops = useMemo(() => {
        if (!bus?.route) return [];

        const waypoints = bus.route.waypoints || [];
        const hasWaypoints = waypoints.length > 0;

        // 1. Determine base stop data (from waypoints or routeDetails)
        let baseStops = [];
        if (hasWaypoints) {
            baseStops = [...waypoints].sort((a, b) => (a.order || 0) - (b.order || 0)).map((wp, index) => ({
                id: wp._id,
                name: wp.name || `Stop ${index + 1}`,
                lat: wp.latitude,
                lng: wp.longitude,
                scheduledTime: wp.scheduledTime || '', // e.g., "8:00 AM"
                isWaypoint: true,
                order: index
            }));
        } else {
            const routeDetails = bus.route.routeDetails || '';
            const stopNames = routeDetails.split(/→|->|➔|➜/).map(s => s.trim()).filter(Boolean);
            baseStops = stopNames.map((name, index) => ({
                name,
                scheduledTime: '',
                isWaypoint: false,
                order: index
            }));
        }

        if (baseStops.length === 0) return [];

        // 2. Find nearest stop if busLocation exists
        let nearestStopIndex = -1;
        let minDistance = Infinity;

        if (busLocation) {
            baseStops.forEach((stop, index) => {
                if (stop.lat && stop.lng) {
                    const dist = calculateDistance(busLocation.lat, busLocation.lng, stop.lat, stop.lng);
                    if (dist < minDistance) {
                        minDistance = dist;
                        nearestStopIndex = index;
                    }
                }
            });
        }

        // 3. Map to final stop objects with status
        return baseStops.map((stop, index) => {
            let status = 'upcoming';
            let etaMinutes = 0;
            let cumulativeDistance = 0;

            // Check if this stop is in the stopArrivals (actual reached stops)
            const arrivalLog = stopArrivals.find(log =>
                log.stopId === (stop.id || stop._id) || log.stopName === stop.name
            );

            // Determine status based on actual GPS location
            if (busLocation && nearestStopIndex !== -1) {
                if (index < nearestStopIndex) {
                    // Only mark a stop as "passed" if we have any arrival confirmations
                    // This avoids showing a lot of "passed" stops when the driver
                    // hasn't actually logged arrivals yet (e.g., Bus 10 case).
                    if (stopArrivals && stopArrivals.length > 0) {
                        status = 'passed';
                    } else {
                        status = 'upcoming';
                    }
                } else if (index === nearestStopIndex) {
                    if (minDistance < 0.2) {
                        status = 'current';
                    } else {
                        status = 'upcoming';
                    }
                } else {
                    for (let i = nearestStopIndex; i < index; i++) {
                        const from = baseStops[i];
                        const to = baseStops[i + 1];
                        if (from.lat && from.lng && to.lat && to.lng) {
                            cumulativeDistance += calculateDistance(from.lat, from.lng, to.lat, to.lng);
                        }
                    }
                    etaMinutes = calculateETA(cumulativeDistance);
                }
            }


            // Always show scheduled time (or actual if reached) on the right, like RedBus
            let displayTime = '';
            let actualArrivalTime = '';
            if (arrivalLog && arrivalLog.arrivalTime) {
                // Bus has actually arrived at this stop - show actual arrival time
                const arrivalDate = new Date(arrivalLog.arrivalTime);
                actualArrivalTime = arrivalDate.toLocaleTimeString('en-US', {
                    hour: '2-digit', minute: '2-digit', hour12: true
                });
                displayTime = actualArrivalTime;
                status = 'reached';
            } else {
                // Always show scheduled time for all stops
                displayTime = stop.scheduledTime || 'TBD';
            }

            return {
                id: stop.id,
                name: stop.name,
                lat: stop.lat,
                lng: stop.lng,
                scheduledTime: stop.scheduledTime,
                time: displayTime,
                actualArrivalTime,
                status,
                isStart: index === 0,
                isEnd: index === baseStops.length - 1,
                etaMinutes,
                distance: cumulativeDistance
            };
        });
    }, [bus, busLocation, stopArrivals]);

    const lastStopReached = stops.filter(s => s.status === 'reached').slice(-1)[0];
    const nextStop = stops.find(s => s.status === 'upcoming' || s.status === 'current');

    const handleCallDriver = () => {
        if (bus?.driver?.phone) window.location.href = `tel:${bus.driver.phone}`;
    };

    // Auto-recenter and fit bounds
    useEffect(() => {
        if (!map || !isLoaded) return;

        const bounds = new window.google.maps.LatLngBounds();
        let hasPoints = false;

        if (busLocation) {
            bounds.extend(busLocation);
            hasPoints = true;
        }
        if (studentLocation) {
            bounds.extend(studentLocation);
            hasPoints = true;
        }

        // If no live tracking, extend to all stops
        if (!hasPoints) {
            stops.forEach(stop => {
                if (stop.lat && stop.lng) {
                    bounds.extend({ lat: stop.lat, lng: stop.lng });
                    hasPoints = true;
                }
            });
        }

        if (hasPoints) {
            map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
            // Don't zoom in too much on a single point
            const listener = window.google.maps.event.addListener(map, "idle", function () {
                if (map.getZoom() > 17) map.setZoom(17);
                window.google.maps.event.removeListener(listener);
            });
        }
    }, [map, isLoaded, busLocation, studentLocation, stops]);

    const onLoad = useCallback(function callback(map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);

    // Error handling for Google Maps load failure
    if (loadError) {
        console.error('Google Maps failed to load:', loadError);
        return (
            <div className="bus-tracking-view">
                <div className="tracking-header">
                    <div className="tracking-header-left">
                        <button className="back-button" onClick={onBack} title="Go back">←</button>
                        <div className="tracking-header-info">
                            <h2>{bus?.busNumber || 'Bus'}</h2>
                            <p>{bus?.route?.name || ''}</p>
                        </div>
                    </div>
                </div>
                <div className="tracking-loading" style={{ flexDirection: 'column', gap: '16px' }}>
                    <span style={{ fontSize: '48px' }}>🗺️</span>
                    <h3 style={{ margin: 0, color: '#374151' }}>Map Unavailable</h3>
                    <p style={{ margin: 0, color: '#6b7280', textAlign: 'center', padding: '0 20px' }}>
                        Unable to load Google Maps. Please check your internet connection.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '8px',
                            padding: '12px 24px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Retry
                    </button>
                </div>
                {/* Show route info even without map */}
                <div className="timeline-section">
                    <div className="timeline-header">
                        Route Information • {stops.length} stops
                    </div>
                    <div className="stops-timeline">
                        {stops.map((stop, index) => (
                            <div key={index} className={`timeline-stop ${stop.status}`}>
                                <div className="stop-circle"></div>
                                <div className="stop-content">
                                    <div className="stop-info">
                                        <div className="stop-name">{stop.name}</div>
                                    </div>
                                    <div className="stop-time">{stop.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading || !isLoaded) {
        return (
            <div className="bus-tracking-view">
                <div className="tracking-header">
                    <div className="tracking-header-left">
                        <button className="back-button" onClick={onBack} title="Go back and track another bus">←</button>
                        <div className="tracking-header-info">
                            <h2>{bus?.busNumber || 'Loading...'}</h2>
                            <p>{bus?.route?.name || ''}</p>
                        </div>
                    </div>
                </div>
                <div className="tracking-loading">
                    <div className="tracking-loading-spinner"></div>
                    <p>{!isLoaded ? 'Loading Maps...' : 'Connecting to bus...'}</p>
                </div>
            </div>
        );
    }

    const defaultCenter = busLocation ||
        (stops.find(s => s.lat && s.lng) ? { lat: stops.find(s => s.lat && s.lng).lat, lng: stops.find(s => s.lat && s.lng).lng } : { lat: 20.5937, lng: 78.9629 });

    return (
        <div className="bus-tracking-view">
            <div className="tracking-header">
                <div className="tracking-header-left">
                    <button className="back-button" onClick={onBack} title="Go back and track another bus">←</button>
                    <div className="tracking-header-info">
                        <h2>{bus?.busNumber}</h2>
                        <p>{bus?.route?.name}</p>
                    </div>
                </div>
                <div className={`live-badge ${!busLocation ? 'offline' : ''}`}>
                    <span className={`live-dot ${!busLocation ? 'gray' : ''}`}></span>
                    {busLocation ? 'LIVE' : 'OFFLINE'}
                </div>
            </div>

            <div className="tracking-map-container">
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={defaultCenter}
                    zoom={15}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    options={{
                        zoomControl: false,
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                        styles: [
                            {
                                "featureType": "poi",
                                "elementType": "labels",
                                "stylers": [{ "visibility": "off" }]
                            }
                        ]
                    }}
                >
                    {/* Bus Marker */}
                    {busLocation && (
                        <MarkerF
                            position={busLocation}
                            icon={{
                                url: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
                                scaledSize: new window.google.maps.Size(40, 40),
                                anchor: new window.google.maps.Point(20, 40)
                            }}
                            onClick={() => setSelectedMarker({ type: 'bus', name: `Bus ${bus.busNumber}` })}
                        />
                    )}

                    {/* Student Marker */}
                    {studentLocation && (
                        <MarkerF
                            position={studentLocation}
                            icon={{
                                url: 'https://cdn-icons-png.flaticon.com/512/1995/1995531.png',
                                scaledSize: new window.google.maps.Size(32, 32),
                                anchor: new window.google.maps.Point(16, 32)
                            }}
                            onClick={() => setSelectedMarker({ type: 'student', name: 'You are here' })}
                        />
                    )}

                    {/* Stop Markers */}
                    {stops.filter(s => s.lat && s.lng).map((stop, idx) => (
                        <MarkerF
                            key={`stop-${idx}`}
                            position={{ lat: stop.lat, lng: stop.lng }}
                            icon={{
                                path: window.google.maps.SymbolPath.CIRCLE,
                                fillColor: stop.status === 'passed' || stop.status === 'current' ? '#10b981' : '#ffffff',
                                fillOpacity: 1,
                                strokeWeight: 2,
                                strokeColor: stop.status === 'passed' || stop.status === 'current' ? '#10b981' : '#64748b',
                                scale: 6,
                            }}
                            onClick={() => setSelectedMarker({ type: 'stop', ...stop })}
                        />
                    ))}

                    {/* Path to student if live */}
                    {busLocation && studentLocation && (
                        <PolylineF
                            path={[busLocation, studentLocation]}
                            options={{
                                strokeColor: '#3b82f6',
                                strokeOpacity: 0.8,
                                strokeWeight: 2,
                                icons: [{
                                    icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 2 },
                                    offset: '0',
                                    repeat: '10px'
                                }]
                            }}
                        />
                    )}

                    {selectedMarker && (
                        <InfoWindowF
                            position={selectedMarker.lat ? { lat: selectedMarker.lat, lng: selectedMarker.lng } : (selectedMarker.type === 'bus' ? busLocation : studentLocation)}
                            onCloseClick={() => setSelectedMarker(null)}
                        >
                            <div className="infowindow-content">
                                <strong>{selectedMarker.name}</strong>
                                {selectedMarker.time && <p>Reached at: {selectedMarker.time}</p>}
                            </div>
                        </InfoWindowF>
                    )}
                </GoogleMap>

                <div className="map-update-badge">
                    {busLocation
                        ? `Updated ${lastUpdated?.toLocaleTimeString()}`
                        : 'Waiting for live tracking...'
                    }
                </div>

                {busLocation && distanceToStudent !== null && (
                    <div className="distance-floating-badge">
                        {distanceToStudent < 1
                            ? `${Math.round(distanceToStudent * 1000)}m away from you`
                            : `${distanceToStudent.toFixed(1)} km away from you`
                        }
                    </div>
                )}
            </div>

            <div className={`eta-card ${!busLocation ? 'offline' : ''}`}>
                <div className="eta-info-main">
                    {busLocation ? (
                        <>
                            <h3>{nextStop ? `Next: ${nextStop.name}` : 'Route Completed'}</h3>
                            <p className="eta-subtext">
                                {lastStopReached ? `Passed ${lastStopReached.name}` : 'Started route'}
                            </p>
                        </>
                    ) : (
                        <>
                            <h3>Live tracking unavailable</h3>
                            <p className="eta-subtext">Showing planned route</p>
                        </>
                    )}
                </div>
                {busLocation && <span className="eta-badge">On Time</span>}
            </div>

            <div className="bus-info-card">
                <div className="bus-info-left">
                    <span className="bus-plate">{mapBusNumber(bus?.busNumber)}</span>
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
                    Route Progress • {stops.filter(s => s.status === 'reached').length}/{stops.length} completed
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
                                        {stop.status === 'reached' && <span className="stop-badge reached">Reached</span>}
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


// Helper to map old bus numbers to new ones
function mapBusNumber(busNumber) {
    if (!busNumber) return busNumber;
    // Accept both string and number
    const str = String(busNumber);
    if (str === '10') return '11';
    if (str === '9') return '13';
    if (str === '4') return '10';
    if (str === '6') return '12';
    return str;
}

export default BusTrackingView;
