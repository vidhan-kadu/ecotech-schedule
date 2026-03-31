import { useState, useEffect } from 'react';
import API from '../api/axios';
import { format, isAfter } from 'date-fns';
import { BookOpen, CheckCircle, XCircle } from 'lucide-react';

/**
 * Bookings — view and manage all bookings
 */
export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await API.get('/bookings');
      setBookings(res.data.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/bookings/${id}/status`, { status });
      fetchBookings();
    } catch (err) {
      alert('Error updating booking');
    }
  };

  const now = new Date();
  const filtered = bookings.filter(b => {
    if (filter === 'upcoming') return isAfter(new Date(b.startTime), now) && b.status !== 'CANCELLED';
    if (filter === 'past') return !isAfter(new Date(b.startTime), now);
    return true;
  });

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>;
  }

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Bookings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          View and manage your scheduled appointments
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['all', 'upcoming', 'past'].map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
          <BookOpen size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
          <p>No bookings found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(booking => (
            <div key={booking._id} className="glass-card" style={{
              padding: '18px 22px',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{booking.guestName}</span>
                    <span className={`badge badge-${booking.status.toLowerCase()}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
                    {booking.guestEmail}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {booking.eventType?.title} · {booking.eventType?.duration} min
                  </div>
                  {booking.guestNotes && (
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, fontStyle: 'italic' }}>
                      "{booking.guestNotes}"
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    {format(new Date(booking.startTime), 'EEE, MMM d, yyyy')}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')} UTC
                  </div>

                  {/* Actions */}
                  {booking.status !== 'CANCELLED' && isAfter(new Date(booking.startTime), now) && (
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 10 }}>
                      {booking.status === 'PENDING' && (
                        <button className="btn btn-sm" onClick={() => updateStatus(booking._id, 'CONFIRMED')}
                          style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--success)', border: '1px solid rgba(34,197,94,0.2)' }}>
                          <CheckCircle size={14} /> Confirm
                        </button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => updateStatus(booking._id, 'CANCELLED')}>
                        <XCircle size={14} /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
