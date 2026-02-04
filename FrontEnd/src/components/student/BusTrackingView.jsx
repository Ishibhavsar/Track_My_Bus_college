import React, { useMemo } from 'react';
import '../../styles/BusTrackingView.css';

const BusTrackingView = ({
    bus,
    busLocation,
    lastUpdated,
    isLoading,
    onBack
}) => {
    // Calculate distance between two coordinates in kilometers
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
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

    // Generate stops with real-time status based on bus location
    const stops = useMemo(() => {
        if (!bus?.route) return [];

        // Parse route details - support multiple arrow formats
        const routeDetails = bus.route.routeDetails || '';
        // Support both → and -> arrow formats
        const stopNames = routeDetails
            .split(/→|->|➔|➜/)
            .map(s => s.trim())
            .filter(Boolean);

        // Check if we have waypoints with coordinates
        const hasWaypoints = bus.route.waypoints && bus.route.waypoints.length > 0;

        // If we have waypoints with coordinates and bus location, use real-time tracking
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

            // Calculate cumulative distance for each stop from current position
            const now = new Date();

            return sortedWaypoints.map((wp, index) => {
                let status = 'upcoming';
                let etaMinutes = 0;
                let cumulativeDistance = 0;

                // Determine status based on position relative to nearest stop
                if (index < nearestStopIndex) {
                    status = 'passed';
                } else if (index === nearestStopIndex) {
                    status = 'current';
                } else {
                    status = 'upcoming';

                    // Calculate distance from current position to this stop
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

                // Calculate ETA time
                const etaTime = new Date(now.getTime() + etaMinutes * 60 * 1000);
                const timeString = etaTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });

                return {
                    name: wp.name || `Stop ${index + 1}`,
                    time: status === 'passed' ? '--:--' : timeString,
                    status,
                    isStart: index === 0,
                    isEnd: index === sortedWaypoints.length - 1,
                    etaMinutes,
                    distance: cumulativeDistance
                };
            });
        }

        // Fallback: Use route details with estimated times
        if (stopNames.length === 0) return [];

        // For routes without waypoint coordinates, estimate based on departure time
        const now = new Date();
        const departureTime = bus?.departureTime || '08:00';
        const [hours, minutes] = departureTime.split(':').map(Number);

        const baseTime = new Date();
        baseTime.setHours(hours || 8, minutes || 0, 0, 0);

        const minutesPerStop = 7; // Average 7 minutes between stops

        // Calculate elapsed time since departure
        const elapsedMinutes = (now - baseTime) / (1000 * 60);
        const currentStopIndex = busLocation
            ? Math.max(0, Math.min(stopNames.length - 1, Math.floor(elapsedMinutes / minutesPerStop)))
            : 0;

        return stopNames.map((name, index) => {
            const stopTime = new Date(baseTime.getTime() + (index * minutesPerStop * 60 * 1000));

            let status = 'upcoming';
            if (busLocation) {
                if (index < currentStopIndex) {
                    status = 'passed';
                } else if (index === currentStopIndex) {
                    status = 'current';
                }
            }

            return {
                name,
                time: stopTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                }),
                status,
                isStart: index === 0,
                isEnd: index === stopNames.length - 1
            };
        });
    }, [bus, busLocation]);

    // Get ETA for last stop
    const lastStop = stops[stops.length - 1];
    const etaTime = lastStop?.time || '--:--';

    // Calculate if bus is on time
    const getStatusBadge = () => {
        if (!busLocation) return { text: 'Waiting', className: '' };
        return { text: 'On time', className: '' };
    };

    const statusBadge = getStatusBadge();

    // Generate map URL with bus marker
    const getMapUrl = (lat, lng) => {
        return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.015},${lat - 0.01},${lng + 0.015},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`;
    };

    // Call driver
    const handleCallDriver = () => {
        if (bus?.driver?.phone) {
            window.location.href = `tel:${bus.driver.phone}`;
        }
    };

    // Open location in Google Maps
    const openInMaps = () => {
        if (busLocation) {
            window.open(`https://www.google.com/maps?q=${busLocation.lat},${busLocation.lng}&z=15`, '_blank');
        }
    };

    // Inline styles for timeline to avoid CSS conflicts
    const timelineStyles = {
        container: {
            position: 'relative',
            paddingLeft: '30px'
        },
        stop: {
            position: 'relative',
            paddingBottom: '24px',
            paddingLeft: '20px'
        },
        stopLast: {
            paddingBottom: '0'
        },
        line: {
            position: 'absolute',
            left: '6px',
            top: '24px',
            bottom: '0',
            width: '3px',
            backgroundColor: '#e5e7eb',
            borderRadius: '2px'
        },
        linePassed: {
            background: 'linear-gradient(to bottom, #f97316, #fb923c)'
        },
        lineCurrent: {
            background: 'linear-gradient(to bottom, #f97316 50%, #e5e7eb 50%)'
        },
        circle: {
            position: 'absolute',
            left: '0',
            top: '4px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: 'white',
            border: '3px solid #e5e7eb',
            zIndex: 2
        },
        circlePassed: {
            backgroundColor: '#f97316',
            borderColor: '#f97316'
        },
        circleCurrent: {
            backgroundColor: '#22c55e',
            borderColor: '#22c55e',
            animation: 'pulse-green 2s infinite'
        },
        content: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
        },
        stopName: {
            fontSize: '15px',
            fontWeight: '500',
            color: '#1a1a1a',
            marginBottom: '4px'
        },
        stopNamePassed: {
            color: '#9ca3af'
        },
        stopTime: {
            fontSize: '14px',
            fontWeight: '600',
            color: '#1a1a1a',
            minWidth: '50px',
            textAlign: 'right'
        },
        stopTimePassed: {
            color: '#9ca3af'
        },
        badge: {
            display: 'inline-block',
            fontSize: '11px',
            padding: '3px 10px',
            borderRadius: '12px',
            fontWeight: '500',
            marginTop: '4px'
        },
        badgeStarting: {
            backgroundColor: '#fef3c7',
            color: '#d97706'
        },
        badgeCurrent: {
            backgroundColor: '#d1fae5',
            color: '#059669'
        },
        badgeDestination: {
            backgroundColor: '#dbeafe',
            color: '#2563eb'
        }
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
                    <p>Getting bus location...</p>
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
                    <h3>Location Unavailable</h3>
                    <p>The driver hasn't started sharing their location yet</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bus-tracking-view">
            {/* Header */}
            <div className="tracking-header">
                <div className="tracking-header-left">
                    <button className="back-button" onClick={onBack}>←</button>
                    <div className="tracking-header-info">
                        <h2>{bus?.busNumber}</h2>
                        <p>{bus?.route?.name}</p>
                    </div>
                </div>
                {busLocation && (
                    <div className="live-badge">
                        <span className="live-dot"></span>
                        LIVE
                    </div>
                )}
            </div>

            {/* Map Section */}
            <div className="tracking-map-container" onClick={openInMaps} style={{ cursor: 'pointer' }}>
                <iframe
                    src={getMapUrl(busLocation.lat, busLocation.lng)}
                    title="Bus Location Map"
                    loading="lazy"
                />
                {lastUpdated && (
                    <div className="map-update-badge">
                        Updated {lastUpdated.toLocaleTimeString()}
                    </div>
                )}
            </div>

            {/* ETA Card */}
            <div className="eta-card">
                <h3>
                    Will reach {lastStop?.name || 'Destination'} by {etaTime}
                </h3>
                <span className={`eta-badge ${statusBadge.className}`}>{statusBadge.text}</span>
            </div>

            {/* Bus Info Card */}
            <div className="bus-info-card">
                <div className="bus-info-left">
                    <span className="bus-plate">{bus?.busNumber}</span>
                    <div>
                        <div className="bus-name">{bus?.route?.name || 'Bus Service'}</div>
                        <div className="bus-type">
                            Driver: {bus?.driver?.name || 'N/A'}
                        </div>
                    </div>
                </div>
                {bus?.driver?.phone && (
                    <button className="call-button" onClick={handleCallDriver}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                        </svg>
                        Call
                    </button>
                )}
            </div>

            {/* Timeline Section with inline styles */}
            <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'white', padding: '20px' }}>
                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px', textAlign: 'center' }}>
                    Route Stops • {stops.filter(s => s.status === 'passed').length}/{stops.length} completed
                </div>

                {stops.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
                        No stops information available
                    </div>
                ) : (
                    <div style={timelineStyles.container}>
                        {stops.map((stop, index) => {
                            const isLast = index === stops.length - 1;

                            return (
                                <div
                                    key={index}
                                    style={{
                                        ...timelineStyles.stop,
                                        ...(isLast ? timelineStyles.stopLast : {})
                                    }}
                                >
                                    {/* Connecting Line */}
                                    {!isLast && (
                                        <div style={{
                                            ...timelineStyles.line,
                                            ...(stop.status === 'passed' ? timelineStyles.linePassed : {}),
                                            ...(stop.status === 'current' ? timelineStyles.lineCurrent : {})
                                        }} />
                                    )}

                                    {/* Stop Circle */}
                                    <div style={{
                                        ...timelineStyles.circle,
                                        ...(stop.status === 'passed' ? timelineStyles.circlePassed : {}),
                                        ...(stop.status === 'current' ? timelineStyles.circleCurrent : {})
                                    }}>
                                        {stop.status === 'passed' && (
                                            <span style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                color: 'white',
                                                fontSize: '8px',
                                                fontWeight: 'bold'
                                            }}>✓</span>
                                        )}
                                    </div>

                                    {/* Stop Content */}
                                    <div style={timelineStyles.content}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                ...timelineStyles.stopName,
                                                ...(stop.status === 'passed' ? timelineStyles.stopNamePassed : {})
                                            }}>
                                                {stop.name}
                                            </div>

                                            {stop.isStart && (
                                                <span style={{ ...timelineStyles.badge, ...timelineStyles.badgeStarting }}>
                                                    Bus starting point
                                                </span>
                                            )}
                                            {stop.status === 'current' && !stop.isStart && (
                                                <span style={{ ...timelineStyles.badge, ...timelineStyles.badgeCurrent }}>
                                                    🚌 Bus is here
                                                </span>
                                            )}
                                            {stop.isEnd && (
                                                <span style={{ ...timelineStyles.badge, ...timelineStyles.badgeDestination }}>
                                                    Final Destination
                                                </span>
                                            )}
                                            {stop.etaMinutes > 0 && stop.status === 'upcoming' && (
                                                <span style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                                                    ~{stop.etaMinutes} min away
                                                </span>
                                            )}
                                        </div>

                                        <div style={{
                                            ...timelineStyles.stopTime,
                                            ...(stop.status === 'passed' ? timelineStyles.stopTimePassed : {})
                                        }}>
                                            {stop.time}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BusTrackingView;
