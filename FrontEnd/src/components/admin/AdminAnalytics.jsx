// src/components/admin/AdminAnalytics.jsx
import React, { useEffect, useState } from 'react';
import { busAPI, routeAPI, driverAPI, studentAPI, coordinatorAPI } from '../../utils/api';

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [liveBuses, setLiveBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const [busesRes, routesRes, driversRes, studentsRes, coordinatorsRes] = await Promise.all([
        busAPI.getAllBuses(),
        routeAPI.getAllRoutes(),
        driverAPI.getAllDrivers(),
        studentAPI.getAllStudents().catch(() => ({ data: { data: [] } })),
        coordinatorAPI.getAllCoordinators().catch(() => ({ data: { data: [] } })),
      ]);

      const buses = busesRes.data.success ? busesRes.data.data : [];
      const availableBuses = buses.filter(b => b.isAvailableToday);
      const activeBuses = buses.filter(b => b.isAvailableToday && b.currentLocation);

      setStats({
        buses: buses.length,
        activeNow: activeBuses.length,
        students: studentsRes.data?.data?.length || 0,
        drivers: driversRes.data?.data?.length || 0,
        coordinators: coordinatorsRes.data?.data?.length || 0,
        routes: routesRes.data?.data?.length || 0,
        alertsInactive: availableBuses.length - activeBuses.length
      });

      // Set live buses from real data - show ALL available buses
      setLiveBuses(availableBuses.map(bus => ({
        id: bus.busNumber,
        busId: bus._id,
        driver: bus.driver?.name || 'No Driver',
        location: bus.route?.startingPoint || bus.route?.name || 'Unknown Route',
        status: bus.currentLocation ? 'ON ROUTE' : 'WAITING',
        gpsStatus: bus.currentLocation ? 'GPS-ONLINE' : 'GPS-OFF',
        lastUpdate: bus.currentLocation?.timestamp ? new Date(bus.currentLocation.timestamp).toLocaleTimeString() : null
      })));
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setStats({ buses: 0, activeNow: 0, students: 0, drivers: 0, coordinators: 0, routes: 0, alertsInactive: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    // Auto-refresh every 30 seconds for live monitoring
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return <p>Loading analytics...</p>;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Buses */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">TOTAL</p>
              <p className="text-3xl font-bold text-gray-900">{stats.buses}</p>
              <p className="text-xs text-gray-500 mt-1">BUSES REGISTERED</p>
            </div>
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Now */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">LIVE</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeNow}</p>
              <p className="text-xs text-gray-500 mt-1">ACTIVE NOW</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Students */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.students}</p>
              <p className="text-xs text-gray-500 mt-1">STUDENTS</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-gray-600">
                <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01.99l-2.98 3.67a.5.5 0 0 0 .39.84H14v7h6z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.alertsInactive}</p>
              <p className="text-xs text-gray-500 mt-1">ALERTS/INACTIVE</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Drivers */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.drivers}</p>
              <p className="text-xs text-gray-500 mt-1">DRIVERS</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Coordinators */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.coordinators}</p>
              <p className="text-xs text-gray-500 mt-1">COORDINATORS</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-purple-600">
                <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01.99l-2.98 3.67a.5.5 0 0 0 .39.84H14v7h6z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Routes */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.routes}</p>
              <p className="text-xs text-gray-500 mt-1">ROUTES</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-green-600">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Live Bus Monitor */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">LIVE BUS MONITOR</h3>
            <span className="text-xs text-gray-400">(Auto-refreshes every 30s)</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-600">GPS-ONLINE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-gray-600">GPS-OFF</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {liveBuses.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No buses available today</p>
          ) : (
            liveBuses.map((bus) => (
              <div key={bus.busId || bus.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold">
                    {bus.id}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{bus.driver}</p>
                    <p className="text-sm text-gray-500">{bus.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${bus.status === 'ON ROUTE'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                    }`}>
                    {bus.status}
                  </span>
                  <p className={`text-xs mt-1 ${bus.gpsStatus === 'GPS-ONLINE' ? 'text-green-600' : 'text-gray-400'}`}>
                    {bus.gpsStatus}
                    {bus.lastUpdate && <span className="ml-1">({bus.lastUpdate})</span>}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
