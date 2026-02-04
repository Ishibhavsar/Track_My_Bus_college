// src/components/admin/BroadcastNotification.jsx
import React, { useState } from 'react';
import api from '../../utils/api';

const BroadcastNotification = () => {
  const [form, setForm] = useState({
    title: '',
    message: '',
    targetRole: 'all',
    email: false,
    inApp: true,
  });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    try {
      const res = await api.post('/broadcasts', {
        title: form.title,
        message: form.message,
        targetRole: form.targetRole,
        channels: {
          email: form.email,
          inApp: form.inApp,
        },
      });
      if (res.data.success) {
        setStatus('Broadcast sent successfully');
        setForm({ ...form, title: '', message: '' });
      } else {
        setStatus(res.data.message || 'Failed to send');
      }
    } catch (err) {
      setStatus('Error sending broadcast');
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow max-w-xl">
      <h2 className="text-xl font-bold mb-4">Broadcast Notification</h2>
      {status && <p className="text-sm mb-2">{status}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          className="w-full border rounded px-3 py-2"
          placeholder="Message"
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          required
        />
        <select
          className="w-full border rounded px-3 py-2"
          value={form.targetRole}
          onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
        >
          <option value="all">All</option>
          <option value="student">Students</option>
          <option value="driver">Drivers</option>
          <option value="coordinator">Coordinators</option>
        </select>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.inApp}
              onChange={(e) => setForm({ ...form, inApp: e.target.checked })}
            />
            <span>In-app</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.checked })}
            />
            <span>Email</span>
          </label>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default BroadcastNotification;
