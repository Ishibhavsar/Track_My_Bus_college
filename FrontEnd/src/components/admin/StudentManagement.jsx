// src/components/admin/StudentManagement.jsx
import React, { useEffect, useState } from 'react';
import { adminAPI, studentAPI } from '../../utils/api';

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [error, setError] = useState('');

    const emptyForm = {
        name: '',
        phone: '',
    };
    const [form, setForm] = useState(emptyForm);

    const loadStudents = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await studentAPI.getAllStudents();
            if (res.data.success) {
                setStudents(res.data.data);
            }
        } catch (err) {
            setError('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStudents();
    }, []);

    const handleEdit = (student) => {
        setEditingStudent(student);
        setForm({
            name: student.name || '',
            phone: student.phone || '',
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this student?')) return;
        try {
            await adminAPI.deleteStudent(id);
            loadStudents();
        } catch (err) {
            setError('Failed to delete student');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editingStudent) {
                await adminAPI.updateStudent(editingStudent._id, form);
            } else {
                await adminAPI.createStudent(form);
            }
            setEditingStudent(null);
            setForm(emptyForm);
            loadStudents();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save student');
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded shadow">
                <h2 className="text-xl font-bold mb-4">
                    {editingStudent ? 'Edit Student' : 'Add Student'}
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
                            {editingStudent ? 'Update' : 'Save'}
                        </button>
                        {editingStudent && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingStudent(null);
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
                    Students {loading && <span className="text-sm text-gray-500">Loading…</span>}
                </h2>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {students.map((student) => (
                        <div
                            key={student._id}
                            className="border rounded p-3 flex justify-between items-start"
                        >
                            <div>
                                <p className="font-semibold">{student.name}</p>
                                <p className="text-sm text-gray-600">{student.phone}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    className="text-blue-600 text-sm"
                                    onClick={() => handleEdit(student)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="text-red-600 text-sm"
                                    onClick={() => handleDelete(student._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                    {!loading && students.length === 0 && (
                        <p className="text-gray-500 text-sm">No students found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentManagement;
