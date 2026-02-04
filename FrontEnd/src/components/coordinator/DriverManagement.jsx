// src/components/coordinator/DriverManagement.jsx
import React, { useEffect, useState } from 'react';
import { driverAPI } from '../../utils/api';

const CoordinatorDriverManagement = ({ language = 'hi' }) => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);
    const [error, setError] = useState('');

    const translations = {
        en: {
            addDriver: 'Add Driver',
            editDriver: 'Edit Driver',
            name: 'Name',
            phone: 'Phone',
            save: 'Save',
            update: 'Update',
            cancel: 'Cancel',
            drivers: 'Drivers',
            loading: 'Loading…',
            edit: 'Edit',
            delete: 'Delete',
            noDrivers: 'No drivers found.',
            deleteConfirm: 'Delete this driver?',
            failedToLoad: 'Failed to load drivers',
            failedToDelete: 'Failed to delete driver',
            failedToSave: 'Failed to save driver'
        },
        hi: {
            addDriver: 'ड्राइवर जोड़ें',
            editDriver: 'ड्राइवर संपादित करें',
            name: 'नाम',
            phone: 'फोन',
            save: 'सेव करें',
            update: 'अपडेट करें',
            cancel: 'रद्द करें',
            drivers: 'ड्राइवर',
            loading: 'लोड हो रहा है…',
            edit: 'संपादित करें',
            delete: 'हटाएं',
            noDrivers: 'कोई ड्राइवर नहीं मिला।',
            deleteConfirm: 'इस ड्राइवर को हटाना है?',
            failedToLoad: 'ड्राइवर लोड करने में विफल',
            failedToDelete: 'ड्राइवर हटाने में विफल',
            failedToSave: 'ड्राइवर सेव करने में विफल'
        }
    };

    const t = translations[language];

    const emptyForm = {
        name: '',
        phone: '',
    };
    const [form, setForm] = useState(emptyForm);

    const loadDrivers = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await driverAPI.getAllDrivers();
            if (res.data.success) {
                setDrivers(res.data.data);
            }
        } catch (err) {
            setError(t.failedToLoad);
        } finally {
            setLoading(false);
        }
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
        loadDrivers();
    }, []);

    const handleEdit = (driver) => {
        setEditingDriver(driver);
        setForm({
            name: driver.name || '',
            phone: driver.phone || '',
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t.deleteConfirm)) return;
        try {
            await driverAPI.deleteDriver(id);
            loadDrivers();
        } catch (err) {
            setError(t.failedToDelete);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editingDriver) {
                await driverAPI.updateDriver(editingDriver._id, form);
            } else {
                await driverAPI.createDriver(form);
            }
            setEditingDriver(null);
            setForm(emptyForm);
            loadDrivers();
        } catch (err) {
            setError(err.response?.data?.message || t.failedToSave);
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded shadow">
                <h2 className="text-xl font-bold mb-4">
                    {editingDriver ? t.editDriver : t.addDriver}
                </h2>
                {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        className="w-full border rounded px-3 py-2"
                        placeholder={t.name}
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />
                    <input
                        className="w-full border rounded px-3 py-2"
                        placeholder={t.phone}
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        required
                    />
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            {editingDriver ? t.update : t.save}
                        </button>
                        {editingDriver && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingDriver(null);
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
                    {t.drivers} {loading && <span className="text-sm text-gray-500">{t.loading}</span>}
                </h2>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {drivers.map((driver) => (
                        <div
                            key={driver._id}
                            className="border rounded p-3 flex justify-between items-start"
                        >
                            <div>
                                <p className="font-semibold">{translateDriverName(driver.name)}</p>
                                <p className="text-sm text-gray-600">{driver.phone}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    className="text-blue-600 text-sm"
                                    onClick={() => handleEdit(driver)}
                                >
                                    {t.edit}
                                </button>
                                <button
                                    className="text-red-600 text-sm"
                                    onClick={() => handleDelete(driver._id)}
                                >
                                    {t.delete}
                                </button>
                            </div>
                        </div>
                    ))}
                    {!loading && drivers.length === 0 && (
                        <p className="text-gray-500 text-sm">{t.noDrivers}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CoordinatorDriverManagement;
