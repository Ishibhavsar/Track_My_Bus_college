// src/components/admin/RouteManagement.jsx
import React, { useEffect, useState } from 'react';
import { routeAPI } from '../../utils/api';

const AdminRouteManagement = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingRoute, setEditingRoute] = useState(null);
    const [error, setError] = useState('');

    const emptyForm = {
        name: '',
        startingPoint: '',
        routeDetails: '',
    };
    const [form, setForm] = useState(emptyForm);

    const loadRoutes = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await routeAPI.getAllRoutes();
            if (res.data.success) {
                setRoutes(res.data.data);
            }
        } catch (err) {
            setError('Failed to load routes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRoutes();
    }, []);

    const handleEdit = (route) => {
        setEditingRoute(route);
        setForm({
            name: route.name || '',
            startingPoint: route.startingPoint || '',
            routeDetails: route.routeDetails || '',
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this route?')) return;
        try {
            await routeAPI.deleteRoute(id);
            loadRoutes();
        } catch (err) {
            setError('Failed to delete route');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const payload = {
            name: form.name,
            startingPoint: form.startingPoint,
            routeDetails: form.routeDetails,
        };
        try {
            if (editingRoute) {
                await routeAPI.updateRoute(editingRoute._id, payload);
            } else {
                await routeAPI.createRoute(payload);
            }
            setEditingRoute(null);
            setForm(emptyForm);
            loadRoutes();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save route');
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded shadow">
                <h2 className="text-xl font-bold mb-4">
                    {editingRoute ? 'Edit Route' : 'Add Route'}
                </h2>
                {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        className="w-full border rounded px-3 py-2"
                        placeholder="Route Name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />
                    <input
                        className="w-full border rounded px-3 py-2"
                        placeholder="Starting Point"
                        value={form.startingPoint}
                        onChange={(e) => setForm({ ...form, startingPoint: e.target.value })}
                        required
                    />
                    <textarea
                        className="w-full border rounded px-3 py-2"
                        placeholder="Route Details (e.g., Point A → Point B → Point C)"
                        value={form.routeDetails}
                        onChange={(e) => setForm({ ...form, routeDetails: e.target.value })}
                        rows={3}
                    />
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            {editingRoute ? 'Update' : 'Save'}
                        </button>
                        {editingRoute && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingRoute(null);
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
                    Routes {loading && <span className="text-sm text-gray-500">Loading…</span>}
                </h2>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {routes.map((route) => (
                        <div
                            key={route._id}
                            className="border rounded p-3 flex justify-between items-start"
                        >
                            <div>
                                <p className="font-semibold">{route.name}</p>
                                <p className="text-sm text-gray-600">
                                    Starting Point: {route.startingPoint}
                                </p>
                                {route.routeDetails && (
                                    <p className="text-xs text-gray-500">
                                        Route Details: {route.routeDetails}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    className="text-blue-600 text-sm"
                                    onClick={() => handleEdit(route)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="text-red-600 text-sm"
                                    onClick={() => handleDelete(route._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                    {!loading && routes.length === 0 && (
                        <p className="text-gray-500 text-sm">No routes found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminRouteManagement;
