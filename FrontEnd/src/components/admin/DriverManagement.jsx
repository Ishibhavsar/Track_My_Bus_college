// src/components/admin/DriverManagement.jsx
import React, { useEffect, useState } from 'react';
import { driverAPI } from '../../utils/api';

const AdminDriverManagement = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);
    const [error, setError] = useState('');

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
            setError('Failed to load drivers');
        } finally {
            setLoading(false);
        }
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
        if (!window.confirm('Delete this driver?')) return;
        try {
            await driverAPI.deleteDriver(id);
            loadDrivers();
        } catch (err) {
            setError('Failed to delete driver');
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
            setError(err.response?.data?.message || 'Failed to save driver');
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded shadow">
                <h2 className="text-xl font-bold mb-4">
                    {editingDriver ? 'Edit Driver' : 'Add Driver'}
                </h2>
                {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        className="w-full border rounded px-3 py-2"
                        placeholder="Name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />
                    <input
                        className="w-full border rounded px-3 py-2"
                        placeholder="Phone"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        required
                    />
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            {editingDriver ? 'Update' : 'Save'}
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
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="bg-white p-4 rounded shadow">
                <h2 className="text-xl font-bold mb-4">
                    Drivers {loading && <span className="text-sm text-gray-500">Loading…</span>}
                </h2>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {drivers.map((driver) => (
                        <div
                            key={driver._id}
                            className="border rounded p-3 flex justify-between items-start"
                        >
                            <div>
                                <p className="font-semibold">{driver.name}</p>
                                <p className="text-sm text-gray-600">{driver.phone}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    className="text-blue-600 text-sm"
                                    onClick={() => handleEdit(driver)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="text-red-600 text-sm"
                                    onClick={() => handleDelete(driver._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                    {!loading && drivers.length === 0 && (
                        <p className="text-gray-500 text-sm">No drivers found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDriverManagement;
