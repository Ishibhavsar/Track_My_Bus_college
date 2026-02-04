// src/components/coordinator/BusManagement.jsx
import React, { useEffect, useState } from 'react';
import { busAPI, routeAPI, driverAPI } from '../../utils/api';

const CoordinatorBusManagement = ({ language = 'hi' }) => {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [error, setError] = useState('');

  const translations = {
    en: {
      addBus: 'Add Bus',
      editBus: 'Edit Bus',
      busNumber: 'Bus Number',
      selectRoute: 'Select Route',
      selectDriver: 'Select Driver',
      availableToday: 'Available today',
      save: 'Save',
      update: 'Update',
      cancel: 'Cancel',
      buses: 'Buses',
      loading: 'Loading…',
      route: 'Route',
      departure: 'Departure',
      driver: 'Driver',
      yes: 'Yes',
      no: 'No',
      edit: 'Edit',
      delete: 'Delete',
      noBuses: 'No buses found.',
      deleteConfirm: 'Delete this bus?',
      failedToLoad: 'Failed to load data',
      failedToDelete: 'Failed to delete bus',
      failedToSave: 'Failed to save bus'
    },
    hi: {
      addBus: 'बस जोड़ें',
      editBus: 'बस संपादित करें',
      busNumber: 'बस नंबर',
      selectRoute: 'मार्ग चुनें',
      selectDriver: 'ड्राइवर चुनें',
      availableToday: 'आज उपलब्ध',
      save: 'सेव करें',
      update: 'अपडेट करें',
      cancel: 'रद्द करें',
      buses: 'बसें',
      loading: 'लोड हो रहा है…',
      route: 'मार्ग',
      departure: 'प्रस्थान',
      driver: 'ड्राइवर',
      yes: 'हाँ',
      no: 'नहीं',
      edit: 'संपादित करें',
      delete: 'हटाएं',
      noBuses: 'कोई बस नहीं मिली।',
      deleteConfirm: 'इस बस को हटाना है?',
      failedToLoad: 'डेटा लोड करने में विफल',
      failedToDelete: 'बस हटाने में विफल',
      failedToSave: 'बस सेव करने में विफल'
    }
  };

  const t = translations[language];

  const emptyForm = {
    busNumber: '',
    routeId: '',
    driverId: '',
    departureTime: '',
    isAvailableToday: true,
  };
  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [b, r, d] = await Promise.all([
        busAPI.getAllBuses(),
        routeAPI.getAllRoutes(),
        driverAPI.getAllDrivers(),
      ]);
      if (b.data.success) setBuses(b.data.data);
      if (r.data.success) setRoutes(r.data.data);
      if (d.data.success) setDrivers(d.data.data);
    } catch (err) {
      setError(t.failedToLoad);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to translate route names
  const translateRouteName = (routeName) => {
    if (language === 'hi') {
      const routeTranslations = {
        'Route A - City Center': 'मार्ग अ - शहर केंद्र',
        'Route B - Industrial Area': 'मार्ग ब - औद्योगिक क्षेत्र',
        'Route C - Residential': 'मार्ग स - आवासीय',
        'Route D - Highway': 'मार्ग द - राजमार्ग',
        'Route E - University': 'मार्ग ई - विश्वविद्यालय',
        'Route F - Hospital': 'मार्ग उ - अस्पताल',
        'City Center': 'शहर केंद्र',
        'Industrial Area': 'औद्योगिक क्षेत्र',
        'Residential': 'आवासीय',
        'Highway': 'राजमार्ग',
        'University': 'विश्वविद्यालय',
        'Hospital': 'अस्पताल',
        'Purana Kesla': 'पुराना केसला',
        'Tekari Bus Stand': 'टेकारी बस स्टैंड',
        'Main Campus': 'मुख्य कैंपस',
        'New Campus': 'नया कैंपस',
        'Medical College': 'मेडिकल कॉलेज',
        'Engineering College': 'इंजीनियरिंग कॉलेज',
        'Arts College': 'कला महाविद्यालय',
        'Commerce College': 'वाणिज्य महाविद्यालय',
        'Science College': 'विज्ञान महाविद्यालय',
        'Law College': 'विधि महाविद्यालय',
        'Management College': 'प्रबंधन महाविद्यालय',
        'Pharmacy College': 'फार्मेसी कॉलेज',
        'Nursing College': 'नर्सिंग कॉलेज',
        'Teacher Training College': 'शिक्षक प्रशिक्षण महाविद्यालय'
      };
      return routeTranslations[routeName] || routeName;
    }
    return routeName;
  };

  // Helper function to translate driver names
  const translateDriverName = (driverName) => {
    if (language === 'hi') {
      const driverTranslations = {
        'Ramesh Kumar': 'रमेश कुमार',
        'Suresh Yadav': 'सुरेश यादव',
        'Mahesh Singh': 'महेश सिंह',
        'Dinesh Patel': 'दिनेश पटेल',
        'Ram Singh': 'राम सिंह',
        'Mohan Lal': 'मोहन लाल',
        'Ravi Sharma': 'रवि शर्मा',
        'Amit Verma': 'अमित वर्मा',
        'Vijay Gupta': 'विजय गुप्ता',
        'Sanjay Tiwari': 'संजय तिवारी',
        'Rajesh Pandey': 'राजेश पांडे',
        'Ashok Mishra': 'अशोक मिश्रा',
        'Deepak Joshi': 'दीपक जोशी',
        'Prakash Dubey': 'प्रकाश दुबे',
        'Santosh Rai': 'संतोष राय'
      };
      return driverTranslations[driverName] || driverName;
    }
    return driverName;
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (bus) => {
    setEditingBus(bus);
    setForm({
      busNumber: bus.busNumber,
      routeId: bus.route?._id || bus.route,
      driverId: bus.driver?._id || bus.driver,
      departureTime: bus.departureTime,
      isAvailableToday: bus.isAvailableToday,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      await busAPI.deleteBus(id);
      loadData();
    } catch (err) {
      setError(t.failedToDelete);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingBus) {
        await busAPI.updateBus(editingBus._id, form);
      } else {
        await busAPI.createBus(form);
      }
      setEditingBus(null);
      setForm(emptyForm);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || t.failedToSave);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-4">
          {editingBus ? t.editBus : t.addBus}
        </h2>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder={t.busNumber}
            value={form.busNumber}
            onChange={(e) => setForm({ ...form, busNumber: e.target.value })}
            required
          />
          <select
            className="w-full border rounded px-3 py-2"
            value={form.routeId}
            onChange={(e) => setForm({ ...form, routeId: e.target.value })}
            required
          >
            <option value="">{t.selectRoute}</option>
            {routes.map((r) => (
              <option key={r._id} value={r._id}>
                {translateRouteName(r.name)}
              </option>
            ))}
          </select>
          <select
            className="w-full border rounded px-3 py-2"
            value={form.driverId}
            onChange={(e) => setForm({ ...form, driverId: e.target.value })}
            required
          >
            <option value="">{t.selectDriver}</option>
            {drivers.map((d) => (
              <option key={d._id} value={d._id}>
                {translateDriverName(d.name)} ({d.phone})
              </option>
            ))}
          </select>
          <input
            type="time"
            className="w-full border rounded px-3 py-2"
            value={form.departureTime}
            onChange={(e) =>
              setForm({ ...form, departureTime: e.target.value })
            }
            required
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isAvailableToday}
              onChange={(e) =>
                setForm({ ...form, isAvailableToday: e.target.checked })
              }
            />
            <span>{t.availableToday}</span>
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {editingBus ? t.update : t.save}
            </button>
            {editingBus && (
              <button
                type="button"
                onClick={() => {
                  setEditingBus(null);
                  setForm(emptyForm);
                }}
                className="border px-4 py-2 rounded"
              >
                {t.cancel}
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-4">
          {t.buses} {loading && <span className="text-sm text-gray-500">{t.loading}</span>}
        </h2>
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {buses.map((bus) => (
            <div
              key={bus._id}
              className="border rounded p-3 flex justify-between items-start"
            >
              <div>
                <p className="font-semibold">#{bus.busNumber}</p>
                <p className="text-sm text-gray-600">
                  {t.route}: {translateRouteName(bus.route?.name)} | {t.departure}: {bus.departureTime}
                </p>
                <p className="text-sm text-gray-600">
                  {t.driver}: {translateDriverName(bus.driver?.name)} ({bus.driver?.phone})
                </p>
                <p className="text-xs mt-1">
                  {t.availableToday}:{' '}
                  <span className={bus.isAvailableToday ? 'text-green-600' : 'text-red-600'}>
                    {bus.isAvailableToday ? t.yes : t.no}
                  </span>
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  className="text-blue-600 text-sm"
                  onClick={() => handleEdit(bus)}
                >
                  {t.edit}
                </button>
                <button
                  className="text-red-600 text-sm"
                  onClick={() => handleDelete(bus._id)}
                >
                  {t.delete}
                </button>
              </div>
            </div>
          ))}
          {!loading && buses.length === 0 && (
            <p className="text-gray-500 text-sm">{t.noBuses}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoordinatorBusManagement;
