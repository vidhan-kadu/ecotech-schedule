import { useState, useEffect } from 'react';
import API from '../api/axios';
import { Save, Check } from 'lucide-react';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Availability — set weekly available hours per day
 */
export default function Availability() {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchAvailability(); }, []);

  const fetchAvailability = async () => {
    try {
      const res = await API.get('/availability');
      const data = res.data.availability;

      // Ensure all 7 days exist
      const fullWeek = DAY_NAMES.map((_, i) => {
        const existing = data.find(a => a.dayOfWeek === i);
        return existing || { dayOfWeek: i, startTime: '09:00', endTime: '17:00', isEnabled: false };
      });

      setAvailability(fullWeek);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateDay = (dayIndex, field, value) => {
    setAvailability(prev =>
      prev.map(a => a.dayOfWeek === dayIndex ? { ...a, [field]: value } : a)
    );
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.put('/availability', { availability });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Error saving availability');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>;
  }

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Availability</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Set your weekly available hours for bookings
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saved ? <><Check size={16} /> Saved</> : saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {availability.map(slot => (
          <div key={slot.dayOfWeek} className="glass-card" style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
            opacity: slot.isEnabled ? 1 : 0.5,
            transition: 'var(--transition)',
          }}>
            {/* Toggle + Day Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 140 }}>
              <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={slot.isEnabled}
                  onChange={(e) => updateDay(slot.dayOfWeek, 'isEnabled', e.target.checked)}
                  style={{ display: 'none' }}
                />
                <span style={{
                  position: 'absolute', inset: 0, borderRadius: 12,
                  background: slot.isEnabled ? 'var(--primary)' : 'var(--border)',
                  transition: 'var(--transition)',
                }} />
                <span style={{
                  position: 'absolute',
                  top: 3, left: slot.isEnabled ? 23 : 3,
                  width: 18, height: 18, borderRadius: '50%',
                  background: 'white',
                  transition: 'var(--transition)',
                }} />
              </label>
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                {DAY_NAMES[slot.dayOfWeek]}
              </span>
            </div>

            {/* Time Inputs */}
            {slot.isEnabled && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="time"
                  className="input-field"
                  value={slot.startTime}
                  onChange={(e) => updateDay(slot.dayOfWeek, 'startTime', e.target.value)}
                  style={{ width: 130 }}
                />
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>to</span>
                <input
                  type="time"
                  className="input-field"
                  value={slot.endTime}
                  onChange={(e) => updateDay(slot.dayOfWeek, 'endTime', e.target.value)}
                  style={{ width: 130 }}
                />
              </div>
            )}

            {!slot.isEnabled && (
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Unavailable</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
