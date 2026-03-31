import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { TIMEZONES, getLocalTimezone } from '../utils/timezone';
import { Save, Check, Link as LinkIcon, Calendar, Unlink } from 'lucide-react';

/**
 * Settings — user profile, timezone, Google Calendar connection
 */
export default function Settings() {
  const { user, updateUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ name: '', username: '', timezone: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [calendarStatus, setCalendarStatus] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        username: user.username || '',
        timezone: user.timezone || getLocalTimezone(),
      });
    }
    checkCalendarStatus();

    // Check callback params
    const calParam = searchParams.get('calendar');
    if (calParam === 'connected') setCalendarStatus('Google Calendar connected successfully!');
    if (calParam === 'error') setCalendarStatus('Failed to connect Google Calendar.');
  }, [user]);

  const checkCalendarStatus = async () => {
    try {
      const res = await API.get('/calendar/status');
      setCalendarConnected(res.data.connected);
    } catch (err) {
      console.error(err);
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await API.put('/auth/profile', form);
      updateUser(res.data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  const connectCalendar = async () => {
    try {
      const res = await API.get('/calendar/auth-url');
      window.location.href = res.data.url;
    } catch (err) {
      alert(err.response?.data?.message || 'Google Calendar not configured');
    }
  };

  const disconnectCalendar = async () => {
    try {
      await API.delete('/calendar/disconnect');
      setCalendarConnected(false);
    } catch (err) {
      alert('Error disconnecting calendar');
    }
  };

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Manage your profile and integrations
        </p>
      </div>

      {/* Profile Section */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Profile</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
          <div>
            <label className="input-label">Full Name</label>
            <input className="input-field" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div>
            <label className="input-label">Username</label>
            <input className="input-field" value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} />
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <LinkIcon size={11} /> Public page: /{form.username}
            </div>
          </div>

          <div>
            <label className="input-label">Timezone</label>
            <select className="input-field" value={form.timezone}
              onChange={(e) => setForm({ ...form, timezone: e.target.value })}>
              {TIMEZONES.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ alignSelf: 'flex-start' }}>
            {saved ? <><Check size={16} /> Saved</> : saving ? 'Saving...' : <><Save size={16} /> Save Profile</>}
          </button>
        </div>
      </div>

      {/* Google Calendar Section */}
      <div className="glass-card" style={{ padding: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Google Calendar</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
          Connect your Google Calendar to automatically sync appointments.
        </p>

        {calendarStatus && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius)',
            background: calendarStatus.includes('success') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${calendarStatus.includes('success') ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
            color: calendarStatus.includes('success') ? 'var(--success)' : 'var(--danger)',
            fontSize: 13,
            marginBottom: 16,
          }}>
            {calendarStatus}
          </div>
        )}

        {calendarLoading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Checking connection...</p>
        ) : calendarConnected ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="badge badge-confirmed" style={{ gap: 6 }}>
              <Check size={14} /> Connected
            </span>
            <button className="btn btn-danger btn-sm" onClick={disconnectCalendar}>
              <Unlink size={14} /> Disconnect
            </button>
          </div>
        ) : (
          <button className="btn btn-secondary" onClick={connectCalendar}>
            <Calendar size={16} /> Connect Google Calendar
          </button>
        )}
      </div>
    </div>
  );
}
