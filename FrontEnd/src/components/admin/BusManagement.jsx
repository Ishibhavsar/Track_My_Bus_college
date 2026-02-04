// src/components/admin/BusManagement.jsx
import React, { useEffect, useState } from 'react';
import { busAPI, routeAPI, driverAPI } from '../../utils/api';

const AdminBusManagement = () => {
    const [buses, setBuses] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingBus, setEditingBus] = useState(null);
    const [error, setError] = useState('');

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
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
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
        if (!window.confirm('Delete this bus?')) return;
        try {
            await busAPI.deleteBus(id);
            loadData();
        } catch (err) {
            setError('Failed to delete bus');
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
            setError(err.response?.data?.message || 'Failed to save bus');
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded shadow">
                <h2 className="text-xl font-bold mb-4">
                    {editingBus ? 'Edit Bus' : 'Add Bus'}
                </h2>
                {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        className="w-full border rounded px-3 py-2"
                        placeholder="Bus Number"
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
                        <option value="">Select Route</option>
                        {routes.map((r) => (
                            <option key={r._id} value={r._id}>
                                {r.name}
                            </option>
                        ))}
                    </select>
                    <select
                        className="w-full border rounded px-3 py-2"
                        value={form.driverId}
                        onChange={(e) => setForm({ ...form, driverId: e.target.value })}
                        required
                    >
                        <option value="">Select Driver</option>
                        {drivers.map((d) => (
                            <option key={d._id} value={d._id}>
                                {d.name} ({d.phone})
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
                        <span>Available today</span>
                    </label>
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            {editingBus ? 'Update' : 'Save'}
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
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="bg-white p-4 rounded shadow">
                <h2 className="text-xl font-bold mb-4">
                    Buses {loading && <span className="text-sm text-gray-500">Loading…</span>}
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
                                    Route: {bus.route?.name} | Departure: {bus.departureTime}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Driver: {bus.driver?.name} ({bus.driver?.phone})
                                </p>
                                <p className="text-xs mt-1">
                                    Available today:{' '}
                                    <span className={bus.isAvailableToday ? 'text-green-600' : 'text-red-600'}>
                                        {bus.isAvailableToday ? 'Yes' : 'No'}
                                    </span>
                                </p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    className="text-blue-600 text-sm"
                                    onClick={() => handleEdit(bus)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="text-red-600 text-sm"
                                    onClick={() => handleDelete(bus._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                    {!loading && buses.length === 0 && (
                        <p className="text-gray-500 text-sm">No buses found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminBusManagement;
