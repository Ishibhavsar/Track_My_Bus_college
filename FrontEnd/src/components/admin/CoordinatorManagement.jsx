// src/components/admin/CoordinatorManagement.jsx
import React, { useEffect, useState } from 'react';
import { coordinatorAPI } from '../../utils/api';

const AdminCoordinatorManagement = () => {
    const [coordinators, setCoordinators] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingCoordinator, setEditingCoordinator] = useState(null);
    const [error, setError] = useState('');

    const emptyForm = {
        name: '',
        phone: '',
    };
    const [form, setForm] = useState(emptyForm);

    const loadCoordinators = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await coordinatorAPI.getAllCoordinators();
            if (res.data.success) {
                setCoordinators(res.data.data);
            }
        } catch (err) {
            setError('Failed to load coordinators');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCoordinators();
    }, []);

    const handleEdit = (coordinator) => {
        setEditingCoordinator(coordinator);
        setForm({
            name: coordinator.name || '',
            phone: coordinator.phone || '',
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this coordinator?')) return;
        try {
            await coordinatorAPI.deleteCoordinator(id);
            loadCoordinators();
        } catch (err) {
            setError('Failed to delete coordinator');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editingCoordinator) {
                await coordinatorAPI.updateCoordinator(editingCoordinator._id, form);
            } else {
                await coordinatorAPI.createCoordinator(form);
            }
            setEditingCoordinator(null);
            setForm(emptyForm);
            loadCoordinators();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save coordinator');
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded shadow">
                <h2 className="text-xl font-bold mb-4">
                    {editingCoordinator ? 'Edit Coordinator' : 'Add Coordinator'}
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
                            {editingCoordinator ? 'Update' : 'Save'}
                        </button>
                        {editingCoordinator && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingCoordinator(null);
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
                    Coordinators {loading && <span className="text-sm text-gray-500">Loading…</span>}
                </h2>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {coordinators.map((coordinator) => (
                        <div
                            key={coordinator._id}
                            className="border rounded p-3 flex justify-between items-start"
                        >
                            <div>
                                <p className="font-semibold">{coordinator.name}</p>
                                <p className="text-sm text-gray-600">{coordinator.phone}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    className="text-blue-600 text-sm"
                                    onClick={() => handleEdit(coordinator)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="text-red-600 text-sm"
                                    onClick={() => handleDelete(coordinator._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                    {!loading && coordinators.length === 0 && (
                        <p className="text-gray-500 text-sm">No coordinators found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminCoordinatorManagement;
