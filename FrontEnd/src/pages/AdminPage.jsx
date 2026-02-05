// src/pages/AdminPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import AdminAnalytics from '../components/admin/AdminAnalytics';
import BroadcastNotification from '../components/admin/BroadcastNotification';
import StudentManagement from '../components/admin/StudentManagement';
import DriverManagement from '../components/admin/DriverManagement';
import CoordinatorManagement from '../components/admin/CoordinatorManagement';
import BusManagement from '../components/admin/BusManagement';
import RouteManagement from '../components/admin/RouteManagement';

const AdminPage = () => {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('home');

  const tabs = [
    { id: 'home', label: 'HOME' },
    { id: 'buses', label: 'BUSES' },
    { id: 'coordinators', label: 'COORDINATORS' },
    { id: 'students', label: 'STUDENTS' },
    { id: 'drivers', label: 'DRIVERS' },
    { id: 'routes', label: 'ROUTES' },
    // { id: 'broadcast', label: 'BROADCAST' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-purple-600 text-white">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg sm:text-xl font-bold">Super Admin Dashboard</h1>
              <p className="text-purple-200 text-xs sm:text-sm">System Control Panel</p>
            </div>
            <button
              onClick={logout}
              className="bg-purple-700 hover:bg-purple-800 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tab Navigation - Scrollable on mobile */}
        <div className="border-t border-purple-500 overflow-x-auto">
          <div className="px-4 sm:px-6">
            <div className="flex space-x-4 sm:space-x-8 min-w-max">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`py-3 sm:py-4 px-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === t.id
                    ? 'border-white text-white'
                    : 'border-transparent text-purple-200 hover:text-white hover:border-purple-300'
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <div className="p-4 sm:p-6">
        {/* Tab Content */}
        {tab === 'home' && <AdminAnalytics />}
        {tab === 'students' && <StudentManagement />}
        {tab === 'drivers' && <DriverManagement />}
        {tab === 'coordinators' && <CoordinatorManagement />}
        {tab === 'buses' && <BusManagement />}
        {tab === 'routes' && <RouteManagement />}
        {/*tab === 'broadcast' && <BroadcastNotification />*/}
      </div>
    </div>
  );
};

export default AdminPage;

