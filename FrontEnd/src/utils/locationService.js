// src/utils/locationService.js

class LocationService {
    constructor() {
        this.watchId = null;
        this.intervalId = null;
        this.isTracking = false;
        this.lastLocation = null;
        this.updateInterval = 10000; // 10 seconds
    }

    // Check if running on native platform (Android/iOS)
    isNative() {
        // For web builds, always return false
        return false;
    }

    // Request location permissions
    async requestPermissions() {
        try {
            // For web, use navigator.geolocation
            return new Promise((resolve) => {
                if (!navigator.geolocation) {
                    resolve(false);
                    return;
                }

                navigator.geolocation.getCurrentPosition(
                    () => resolve(true),
                    () => resolve(false),
                    { timeout: 5000 }
                );
            });
        } catch (error) {
            console.error('Error requesting permissions:', error);
            return false;
        }
    }

    // Check if permissions are granted
    async checkPermissions() {
        try {
            return navigator.geolocation ? true : false;
        } catch (error) {
            console.error('Error checking permissions:', error);
            return false;
        }
    }

    // Get current position once
    async getCurrentPosition() {
        try {
            return new Promise((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error('Geolocation is not supported by this browser'));
                    return;
                }

                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            accuracy: position.coords.accuracy,
                            timestamp: position.timestamp,
                        });
                    },
                    (error) => {
                        let errorMessage = 'Unknown error';
                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                errorMessage = 'Location access denied by user';
                                break;
                            case error.POSITION_UNAVAILABLE:
                                errorMessage = 'Location information unavailable';
                                break;
                            case error.TIMEOUT:
                                errorMessage = 'Location request timed out';
                                break;
                        }
                        reject(new Error(errorMessage));
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 60000 // Cache for 1 minute
                    }
                );
            });
        } catch (error) {
            console.error('Error getting current position:', error);
            throw error;
        }
    }

    // Start continuous location tracking
    async startTracking(onLocationUpdate, onError) {
        if (this.isTracking) {
            console.log('Already tracking location');
            return;
        }

        const hasPermission = await this.requestPermissions();
        if (!hasPermission) {
            onError?.('Location permission denied or not supported');
            return;
        }

        this.isTracking = true;

        try {
            const sendLocation = async () => {
                try {
                    const position = await this.getCurrentPosition();
                    this.lastLocation = position;
                    onLocationUpdate?.(position);
                    await this.sendLocationToBackend(position);
                } catch (error) {
                    console.error('Error in web tracking:', error);
                    onError?.(error.message);
                }
            };

            // Initial location
            await sendLocation();

            // Set up interval for continuous tracking
            this.intervalId = setInterval(sendLocation, this.updateInterval);

            console.log('Location tracking started');
        } catch (error) {
            console.error('Error starting tracking:', error);
            this.isTracking = false;
            onError?.(error.message);
        }
    }

    // Stop location tracking
    async stopTracking() {
        if (!this.isTracking) {
            return;
        }

        try {
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }

            this.isTracking = false;
            this.lastLocation = null;
            console.log('Location tracking stopped');
        } catch (error) {
            console.error('Error stopping tracking:', error);
        }
    }

    // Send location to backend
    async sendLocationToBackend(location) {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

            const response = await fetch(`${apiUrl}/bus/location`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    latitude: location.latitude,
                    longitude: location.longitude,
                }),
            });

            if (response.ok) {
                console.log('Location sent to backend:', location.latitude, location.longitude);
                return true;
            } else {
                console.error('Failed to send location:', response.status);
                return false;
            }
        } catch (error) {
            console.error('Error sending location to backend:', error);
            return false;
        }
    }

    // Get tracking status
    getStatus() {
        return {
            isTracking: this.isTracking,
            lastLocation: this.lastLocation,
        };
    }
}

// Export singleton instance
export const locationService = new LocationService();
export default locationService;
