// src/pages/CoordinatorPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import BusManagement from '../components/coordinator/BusManagement';
import DriverManagement from '../components/coordinator/DriverManagement';
import RouteManagement from '../components/coordinator/RouteManagement';

const CoordinatorPage = () => {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('buses');
  const [language, setLanguage] = useState('hi'); // Default to Hindi

  const translations = {
    en: {
      title: 'Coordinator Dashboard',
      buses: 'Buses',
      drivers: 'Drivers',
      routes: 'Routes',
      logout: 'Logout',
    },
    hi: {
      title: 'समन्वयक डैशबोर्ड',
      buses: 'बस देखें',
      drivers: 'ड्राइवर',
      routes: 'मार्ग',
      logout: 'Logout',
    },
  };

  const t = translations[language];

  const tabs = [
    { id: 'buses', label: t.buses },
    { id: 'drivers', label: t.drivers },
    { id: 'routes', label: t.routes },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">{t.title}</h1>
              <p className="text-purple-200 text-sm">Track My Bus</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                className="bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded-lg transition-colors"
              >
                {language === 'en' ? 'हिंदी' : 'English'}
              </button>
              <button
                onClick={logout}
                className="bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded-lg transition-colors"
              >
                {t.logout}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-t border-purple-500">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex space-x-8">
              {tabs.map((tabItem) => (
                <button
                  key={tabItem.id}
                  onClick={() => setTab(tabItem.id)}
                  className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                    tab === tabItem.id
                      ? 'border-white text-white'
                      : 'border-transparent text-purple-200 hover:text-white hover:border-purple-300'
                  }`}
                >
                  {tabItem.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Tab Content */}
        {tab === 'buses' && <BusManagement language={language} />}
        {tab === 'drivers' && <DriverManagement language={language} />}
        {tab === 'routes' && <RouteManagement language={language} />}
      </div>
    </div>
  );
};

export default CoordinatorPage;
