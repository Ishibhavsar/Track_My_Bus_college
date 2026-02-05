# Track My Bus - College Bus Tracking System

A comprehensive bus tracking application built with React and Vite, featuring real-time GPS tracking with Google Maps integration. The system supports four user roles: **Admin**, **Coordinator**, **Driver**, and **Student**.

## 📋 System Overview

### User Roles & Permissions

#### 1. **Admin**
- Complete control over the entire system
- View analytics and dashboards for all buses and routes
- Manage students (add/remove)
- Manage coordinators (add/delete)
- Manage drivers (add/delete)
- Monitor all bus activities in real-time

#### 2. **Coordinator**
- Only one coordinator role: **Raj Singh**
- Language switching: English and Hindi
- Add and remove drivers
- Set and modify bus routes
- Manage route assignments to buses
- Control and coordinate all driver activities

#### 3. **Driver**
- Turn GPS tracking on/off
- View assigned route with waypoints
- Real-time location sharing with the system
- See current position on the map
- Navigate through the assigned route

#### 4. **Student**
- View list of available buses
- Track buses in real-time on Google Maps
- See live bus location
- View route details and scheduled stops with times
- See estimated time of arrival (ETA) for upcoming stops
- Call driver directly from the app
- Switch between different buses to track

---

## 🎯 Student Features & Workflow

### Bus Tracking Flow

1. **Bus List View**
   - Student logs in and sees a list of all available buses for today
   - Each bus card displays:
     - Bus number
     - Route name
     - Driver name
     - Departure time
     - Live/Offline status indicator

2. **Bus Selection & Modal**
   - Click on any bus card
   - Modal popup appears with detailed bus information:
     - Driver information and contact
     - Route details
     - Scheduled stops
     - Capacity
     - Tracking status
   - Click **"Track My Bus"** button to start tracking

3. **Real-Time Map Tracking**
   - Directly opens the mapping interface
   - Shows Google Maps with:
     - **Bus Location**: Live GPS position (when driver has GPS enabled)
     - **Student Location**: Current student position
     - **Route Stops**: All waypoints with color coding:
       - ✅ Green: Reached stops (confirmed arrivals)
       - ⚪ Gray: Upcoming stops
     - **Distance Indicator**: Distance between student and bus
     - **Live Badge**: Shows "LIVE" when GPS is active, "OFFLINE" when inactive

4. **Stop Timeline**
   - Displays route progress: "X/Y completed"
   - Each stop shows:
     - **Stop Name**
     - **Status Badges**:
       - "Start" for the first stop
       - "Reached" for confirmed arrived stops (from driver's actual data)
       - "Current Location" for the bus's nearest stop
       - "End" for the final stop
     - **Time Display**:
       - **When Offline**: Shows scheduled time from database (e.g., "8:00 AM")
       - **When Live**: Shows ETA in minutes (e.g., "~5 min") based on distance
       - **When Reached**: Shows actual arrival time from driver's data
       - **Current Stop**: Shows "Now"

5. **Back & Switch Buses**
   - Click the **back arrow button** (←) in the header
   - Returns to bus list
   - Select a different bus to track
   - Seamlessly switches tracking between buses

6. **Driver Contact**
   - Click the **phone button** to call the driver
   - Direct integration with device phone capabilities

---

## 🗺️ Real-Time Tracking Logic

### Stop Status Determination

**Bus Status is determined by:**
1. **GPS Location-Based** (if driver has GPS enabled)
   - Compares bus GPS coordinates with stop waypoints
   - Determines proximity to nearest stop
2. **Actual Arrival Logs** (from stopArrivals data)
   - Only stops in the stopArrivals array show as "Reached"
   - Shows actual arrival time from driver's data

### Time Display Logic

| Scenario | Display |
|----------|---------|
| Bus is OFFLINE | Scheduled time from database (e.g., "8:15 AM") |
| Bus is LIVE, stop upcoming | ETA in minutes (e.g., "~8 min") |
| Bus at current stop | "Now" |
| Bus passed stop (GPS-based) | "Passed" |
| Stop in stopArrivals log | Actual arrival time (e.g., "8:15 AM") |

### Key Data Sources

- **Scheduled Times**: Route.waypoints[].scheduledTime (from seed.js database)
- **Live Location**: Driver's GPS coordinates (updated via WebSocket)
- **Arrival Confirmations**: stopArrivals array (driven by driver's location data)

---

## 🏗️ Project Structure

```
FrontEnd/
├── src/
│   ├── components/
│   │   └── student/
│   │       ├── StudentHome.jsx          # Bus list display
│   │       ├── BusDetails.jsx           # (Legacy - deprecated)
│   │       ├── BusTracker.jsx           # Tracking manager
│   │       └── BusTrackingView.jsx      # Map interface
│   ├── pages/
│   │   └── StudentPage.jsx              # Main student page
│   ├── hooks/
│   │   └── useAuth.js                   # Authentication hook
│   ├── utils/
│   │   └── api.js                       # API client
│   └── context/
│       └── AuthContext.jsx              # Auth state management
│
BackEnd/
├── src/
│   ├── models/
│   │   ├── Route.model.js               # Route schema with waypoints
│   │   └── User.model.js                # User model
│   ├── controllers/
│   │   ├── bus.controller.js            # Bus endpoints
│   │   └── driver.controller.js         # Driver GPS/location endpoints
│   ├── routes/
│   ├── scripts/
│   │   └── seed.js                      # Database seeding with stop times
│   └── utils/
```

---

## 🔌 Real-Time Communication

### WebSocket Events

**Driver Side:**
- Emits location updates with stopArrivals data

**Student Side:**
- Listens to `location-update` events
- Receives bus location and stop arrival confirmations
- Updates map in real-time

---

## 📊 Stop Times in Database

All scheduled stop times are stored in the seed.js file under Route.waypoints:

```javascript
waypoints: [
  { name: 'Tekri', scheduledTime: '8:00 AM', latitude: 24.5700, longitude: 73.6800, order: 1 },
  { name: 'Udaipole', scheduledTime: '8:02 AM', latitude: 24.5750, longitude: 73.6820, order: 2 },
  // ... more stops
]
```

These times are displayed to students when the bus is offline or as reference points for ETA calculations.

---

## 🚀 Key Features Implemented

✅ **Dynamic Bus Tracking** - Real-time GPS position updates
✅ **Stop Status Logic** - Only shows "Reached" for confirmed arrivals
✅ **Scheduled Times** - Displays times from database
✅ **ETA Calculation** - Calculates remaining time based on distance
✅ **Popup Modal Flow** - Bus selection via modal → Direct tracking
✅ **Bus Switching** - Go back button to switch between buses
✅ **Live/Offline Indication** - Shows connection status
✅ **Driver Contact** - Direct calling from the app
✅ **Distance Indicator** - Shows distance between student and bus

---

## 🔧 Tech Stack

- **Frontend**: React + Vite
- **Maps**: Google Maps API
- **Real-time**: Socket.io
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Styling**: Tailwind CSS + Custom CSS

---

## 📝 Notes

- Bus status based on GPS location AND actual arrival confirmations
- Times automatically adjust based on live tracking
- Static stop times shown when GPS is unavailable
- All data updates in real-time via WebSocket
- Student location tracked for distance calculation
